import { Account, AppData, Candidate, Channel, Post } from '../types';
import { encryptLoginPassword } from '../utils/passwordEncryption';

const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '');
const ACCESS_KEY = 'pc_web_access';
const REFRESH_KEY = 'pc_web_refresh';
const SESSION_KEY = 'pc_web_session';

export class ApiError extends Error {
  constructor(message: string, public status: number, public details?: unknown) { super(message); }
}

function errorMessage(payload: any): string {
  const details = payload?.error?.details ?? payload;
  if (typeof details === 'string') return details;
  if (details?.detail) return String(details.detail);
  if (details && typeof details === 'object') {
    const first = Object.values(details).flat()[0];
    if (first) return String(first);
  }
  return 'The request could not be completed.';
}

function unwrapPayload<T>(payload: any): T {
  if (payload?.success === true && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return payload.data as T;
  }
  return payload as T;
}

async function refreshAccess(): Promise<boolean> {
  const refresh = sessionStorage.getItem(REFRESH_KEY);
  if (!refresh) return false;
  const response = await fetch(`${API_URL}/auth/refresh/`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh }),
  });
  if (!response.ok) return false;
  const tokens = unwrapPayload<{ access: string; refresh: string }>(await response.json());
  sessionStorage.setItem(ACCESS_KEY, tokens.access);
  if (tokens.refresh) sessionStorage.setItem(REFRESH_KEY, tokens.refresh);
  return true;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const access = sessionStorage.getItem(ACCESS_KEY);
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (access) headers.set('Authorization', `Bearer ${access}`);
  const url = path.startsWith('http') ? path : `${API_URL}/${path.replace(/^\//, '')}`;
  const method = init.method ?? 'GET';
  if (import.meta.env.DEV) console.debug(`[API] ${method} ${url}`);
  const response = await fetch(url, { ...init, headers });
  if (import.meta.env.DEV) console.debug(`[API] ${method} ${url} -> ${response.status}`);
  if (response.status === 401 && retry && await refreshAccess()) return apiRequest<T>(path, init, false);
  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(errorMessage(payload), response.status, payload?.error?.details);
  return unwrapPayload<T>(payload);
}

async function list<T = any>(path: string): Promise<T[]> {
  const payload: any = await apiRequest<any>(path);
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.data) ? payload.data : (payload?.results ?? []);
}

async function optional<T>(path: string, fallback: T): Promise<T> {
  try { return await apiRequest<T>(path); }
  catch (error) { if (error instanceof ApiError && error.status === 404) return fallback; throw error; }
}

export const createEmptyData = (): AppData => ({
  meta: { description: 'PeopleConnect API data' },
  party: { id: '', name: '', about: '', manifesto: [] },
  regions: [], candidates: [], accounts: [], channels: [], posts: [], schemes: [],
  notifications: [], events: [], campaigns: [], surveys: [], gallery: [], videos: [],
  news: [], development: [], phoneNumbers: [], manifesto_items: [], complaints: [], feedback: [],
});

export type DataResource = 'party' | 'regions' | 'candidates' | 'accounts' | 'channels' |
  'posts' | 'schemes' | 'notifications' | 'events' | 'campaigns' | 'surveys' | 'gallery' |
  'videos' | 'news' | 'development' | 'health' | 'phoneNumbers' | 'contact' |
  'manifesto_items' | 'complaints' | 'feedback' | 'adminReport' | 'candidateReport';

const resourceBatches = new Map<string, Promise<Partial<AppData>>>();

export async function loadResources(resources: DataResource[]): Promise<Partial<AppData>> {
  const unique = [...new Set(resources)];
  const key = [...unique].sort().join('|');
  const existing = resourceBatches.get(key);
  if (existing) return existing;
  const request = Promise.all(unique.map(async (resource) => {
    switch (resource) {
      case 'party': return [resource, (await optional('party/', createEmptyData().party)) ?? createEmptyData().party];
      case 'regions': return [resource, await list('regions/')];
      case 'candidates': return [resource, await list<Candidate>('candidates/')];
      case 'accounts': return [resource, await list<Account>('users/')];
      case 'channels': return [resource, await list<Channel>('channels/')];
      case 'posts': return [resource, await list<Post>('posts/')];
      case 'schemes': return [resource, await list('schemes/')];
      case 'notifications': return [resource, await list('notifications/')];
      case 'events': return [resource, await list('events/')];
      case 'campaigns': return [resource, await list('campaigns/')];
      case 'surveys': return [resource, await list('surveys/')];
      case 'gallery': return [resource, await list('gallery/')];
      case 'videos': return [resource, await list('videos/')];
      case 'news': return [resource, await list('news/')];
      case 'development': return [resource, await list('development/')];
      case 'health': return [resource, await optional('health/', undefined)];
      case 'phoneNumbers': return [resource, await list('phone-numbers/')];
      case 'contact': return [resource, await optional('contact/', undefined)];
      case 'manifesto_items': return [resource, await list('manifesto/')];
      case 'complaints': return [resource, await list('complaints/')];
      case 'feedback': return [resource, await list('feedback/')];
      case 'adminReport': return [resource, await apiRequest('reports/admin/')];
      case 'candidateReport': return [resource, await apiRequest('reports/candidate/')];
    }
  })).then((entries) => Object.fromEntries(entries) as Partial<AppData>);
  resourceBatches.set(key, request);
  try { return await request; }
  finally { resourceBatches.delete(key); }
}

export function getSession(): Account | null {
  try { const raw = sessionStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}

function persistSession(account: Account, access: string, refresh: string) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(account));
  sessionStorage.setItem(ACCESS_KEY, access);
  sessionStorage.setItem(REFRESH_KEY, refresh);
}

export async function restoreSession(): Promise<Account | null> {
  if (!getSession()) return null;
  try {
    const account = await apiRequest<Account>('auth/me/');
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(account));
    return account;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearSession();
      return null;
    }
    throw error;
  }
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(ACCESS_KEY); sessionStorage.removeItem(REFRESH_KEY);
}

export async function loginWeb(email: string, password: string): Promise<Account> {
  const result = await apiRequest<{ access: string; refresh: string; user: Account }>('auth/login/', {
    method: 'POST',
    headers: { 'X-Client-Type': 'web' },
    body: JSON.stringify({ userName: email, password: encryptLoginPassword(password) }),
  });
  persistSession(result.user, result.access, result.refresh);
  return result.user;
}

export async function logoutWeb(): Promise<void> {
  const refresh = sessionStorage.getItem(REFRESH_KEY);
  try { if (refresh) await apiRequest('auth/logout/', { method: 'POST', body: JSON.stringify({ refresh }) }); }
  finally { clearSession(); }
}

export const updateParty = (party: AppData['party']) => apiRequest<AppData['party']>('party/', { method: 'PUT', body: JSON.stringify(party) });
export const createCandidate = (candidate: Omit<Candidate, 'id' | 'hasLogin'>) => apiRequest<Candidate>('candidates/', { method: 'POST', body: JSON.stringify(candidate) });
export const createCandidateLogin = (candidateId: string, password: string) => apiRequest<Account>(`candidates/${candidateId}/create-login/`, { method: 'POST', body: JSON.stringify({ password }) });
export async function importCandidates(file: File) { const body = new FormData(); body.append('file', file); return apiRequest<{ imported: number; invalid: number; rows: unknown[] }>('candidates/import/', { method: 'POST', body }); }
export const createPost = (post: Omit<Post, 'id'>) => apiRequest<Post>('posts/', { method: 'POST', body: JSON.stringify(post) });
export const createChannel = (channel: Omit<Channel, 'id'>) => apiRequest<Channel>('channels/', { method: 'POST', body: JSON.stringify(channel) });
export const updateChannel = (channel: Channel) => apiRequest<Channel>(`channels/${channel.id}/`, { method: 'PATCH', body: JSON.stringify(channel) });

export function getChannelsForOwner(ownerType: 'party' | 'candidate', ownerId: string, data: AppData): Channel[] { return data.channels.filter(c => c.ownerType === ownerType && c.ownerId === ownerId); }
export function getPostsForCandidate(candidateId: string, data: AppData): Post[] { return data.posts.filter(p => p.ownerType === 'candidate' && p.ownerId === candidateId); }
export function exportCSV(rows: any[], filename: string): void {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]).join(',');
  const body = rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([`${headers}\n${body}`], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}

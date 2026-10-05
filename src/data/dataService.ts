import { SEED } from './seedData';
import { AppData, Account, Post, Channel } from '../types';

const KEY = 'pc_web_data';
const SESSION_KEY = 'pc_web_session';

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(SEED));
  } catch {
    return JSON.parse(JSON.stringify(SEED));
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function resetData(): AppData {
  const fresh = JSON.parse(JSON.stringify(SEED));
  localStorage.setItem(KEY, JSON.stringify(fresh));
  return fresh;
}

export function exportData(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'pc-demo-data.json'; a.click();
  URL.revokeObjectURL(url);
}

export function getSession(): Account | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setSession(acc: Account): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(acc));
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function loginWeb(email: string, password: string, data: AppData): Account | null {
  return data.accounts.find(
    (a) => a.email === email && a.password === password && (a.role === 'admin' || a.role === 'candidate')
  ) || null;
}

export function getChannelsForOwner(ownerType: 'party' | 'candidate', ownerId: string, data: AppData): Channel[] {
  return data.channels.filter((c) => c.ownerType === ownerType && c.ownerId === ownerId);
}

export function getPostsForCandidate(candidateId: string, data: AppData): Post[] {
  return data.posts.filter((p) => p.ownerType === 'candidate' && p.ownerId === candidateId);
}

export function exportCSV(rows: any[], filename: string): void {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]).join(',');
  const body = rows.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([headers + '\n' + body], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

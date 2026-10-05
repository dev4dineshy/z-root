export interface Region { id: string; name: string; }
export interface Candidate { id: string; name: string; regionId: string; email: string; bio: string; photoUrl?: string | null; }
export interface Account { id: string; role: 'admin' | 'candidate' | 'user'; name: string; email: string; password: string; candidateId?: string; regionId?: string | null; }
export interface Channel {
  id: string;
  ownerType: 'party' | 'candidate';
  ownerId: string;
  platform: 'facebook' | 'youtube' | 'x';
  label: string;
  connected: boolean;
  verified?: boolean;
  flagNote?: string;
}
export interface PostMetrics { likes: number; comments: number; reshares: number; }
export interface Post {
  id: string;
  ownerType: 'party' | 'candidate';
  ownerId: string;
  regionId: string | null;
  title: string;
  body: string;
  status: 'draft' | 'published';
  channelIds: string[];
  originalPostUrl?: string | null;
  metrics: PostMetrics;
  createdAt: string;
  publishedAt?: string | null;
  type?: 'update' | 'survey' | 'event' | 'announcement';
  imageUrl?: string | null;
  tags?: string[];
}
export interface Scheme {
  id: string;
  title: string;
  description: string;
  category?: string;
  icon?: string;
  programme?: string;
  regionId?: string | null;
  candidateId?: string | null;
}
export interface Notification { id: string; regionId: string | null; candidateId: string | null; postId: string; title: string; body?: string; read: boolean; createdAt: string; }
export interface AppEvent { id: string; candidateId: string | null; regionId: string | null; title: string; date: string; description?: string; }
export interface Campaign { id: string; title: string; candidateId: string | null; regionId: string | null; body: string; status: string; createdAt: string; }
export interface Survey { id: string; title: string; candidateId: string | null; regionId: string | null; questions: string[]; responses: number; createdAt: string; }
export interface GalleryItem {
  id: string;
  title: string;
  category?: string;
  regionId: string | null;
  candidateId: string | null;
  mediaUrls: string[];
  createdAt: string;
}
export interface VideoItem {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  regionId: string | null;
  candidateId: string | null;
  url: string | null;
  sourceType?: string;
  thumbnailKey?: string;
  createdAt: string;
  category?: string;
}

export interface NewsItem { id: string; title: string; body: string; date: string; category: string; imageEmoji?: string; }
export interface DevelopmentItem { id: string; title: string; ward: string; progress: number; status: string; description: string; imageEmoji?: string; }
export interface HealthActivity { id: string; title: string; date: string; location: string; type: string; }
export interface HealthLink {
  id: string;
  title: string;
  desc: string;
  fullContent?: { overview: string; points: string[]; contact: string; };
}
export interface HealthSection {
  name: string;
  tagline: string;
  description: string;
  activities: HealthActivity[];
  links: HealthLink[];
}
export interface PhoneNumber { id: string; title: string; number: string; category: string; icon?: string; }
export interface ContactInfo {
  address: string;
  mapCoords?: { lat: number; lng: number };
  mapLabel?: string;
  phone: string;
  email: string;
  hours: string;
}
export interface ManifestoItem { id: string; title: string; description: string; category?: string; icon?: string; }

export interface AppData {
  meta: { demo: boolean; description: string };
  party: { id: string; name: string; about: string; manifesto: string[] };
  regions: Region[];
  candidates: Candidate[];
  accounts: Account[];
  channels: Channel[];
  posts: Post[];
  schemes: Scheme[];
  notifications: Notification[];
  events: AppEvent[];
  campaigns: Campaign[];
  surveys: Survey[];
  gallery: GalleryItem[];
  videos: VideoItem[];
  news?: NewsItem[];
  development?: DevelopmentItem[];
  health?: HealthSection;
  phoneNumbers?: PhoneNumber[];
  contact?: ContactInfo;
  manifesto_items?: ManifestoItem[];
  complaints: any[];
  feedback: any[];
}

export type AppTab = 'sports' | 'tv' | 'news' | 'favorites';
export type EventTimeStatus = 'live' | 'upcoming' | 'finished';
export type EventTimeFilter = 'Tous' | 'En direct' | 'Bientot' | 'Fini';

export interface SportEvent {
  unixTimestamp: number;
  sport?: string;
  match: string;
  channels: string[];
}

export interface DayEvents {
  date: string;
  events: SportEvent[];
}

export interface ApiResponse {
  events: DayEvents[];
}

export interface FlatEvent extends SportEvent {
  date: string;
  sportType: string;
}

export interface TVChannel {
  name: string;
  image: string;
  country: string;
  stream1: string;
  stream2: string;
  status1?: string | null;
  status2?: string | null;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  link: string;
  image: string;
  source: string;
  publishedTimestamp: number;
  author?: string;
}

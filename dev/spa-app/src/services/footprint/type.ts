import type { FootprintListUserInfo } from '@/features/footprint-list/index.hook';

export type { FootprintListUserInfo };

export interface FootprintListResponse {
  list: FootprintListUserInfo[];
}

export interface FootprintListWithPaginationResponse {
  list: FootprintListUserInfo[];
  hasMore: boolean;
}

export interface FootprintAPIResponse {
  userId: string;
  avaId: string;
  videoCallWaiting?: boolean;
  voiceCallWaiting?: boolean;
  abt?: string;
  age: number;
  region: number;
  userName: string;
  lastLogin?: string;
  chkTime: string;
  bustSize?: string;
  hLevel?: string;
  isNewUser?: boolean;
}

export interface FavoriteAPIResponse {
  userId: string;
}

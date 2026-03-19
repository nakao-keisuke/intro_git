import type { Region } from '@/utils/region';

export type FavoriteListUserInfo = {
  userName: string;
  userId: string;
  age: number;
  region: Region;
  avatarId: string;
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
  about: string;
  isCalling: boolean;
  hasLovense: boolean;
  hLevel?: string;
  bustSize?: string;
  isNewUser?: boolean;
  regDate?: string;
};

export interface FavoriteListData {
  myFavoriteList: FavoriteListUserInfo[];
  favoritedMeList: FavoriteListUserInfo[];
  isPurchased: boolean;
}

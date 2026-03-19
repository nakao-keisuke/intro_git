import type { MediaInfo } from '@/types/MediaInfo';
import type { Region } from '@/utils/region';

export type SearchMeetpeopleInfo = {
  userId: string;
  userName: string;
  age: number;
  about: string;
  region: Region;
  avatarId: string;
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
  isLoggedIn: boolean;
  thumbnailList: MediaInfo[];
  lastLoginTime: string;
  isNewUser: boolean;
  isCalling: boolean;
  hasStory: boolean;
  hasLovense: boolean;
  isListedOnFleaMarket: boolean;
};

export type SearchParams = {
  age?: string;
  minAge?: string;
  maxAge?: string;
  region?: string;
  voice?: string;
  video?: string;
  face?: string;
  bodyType?: number[]; // 体型の数値ID配列
  marriageHistory?: string;
  name?: string;
  lovense?: string;
  newUser?: string;
  bustSize?: string; // A~Eカップサイズ
  bigBreasts?: string; // 巨乳フィルター (true/false)
  fleaMarket?: string; // フリマ出品中フィルター (true/false)
};

export type SearchResponse =
  | {
      searchMeetPeopleList: SearchMeetpeopleInfo[];
      type: 'success';
    }
  | {
      type: 'error';
      message: string;
    };

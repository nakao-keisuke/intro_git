import type { APIRequest } from '@/libs/http/type';
import type { Region } from '@/utils/region';

export type BookmarkListRequest = APIRequest & {
  token?: string;
};

// boardServiceのBoard型と同様のcamelCase型定義
export type BookmarkUser = {
  userId: string;
  userName: string;
  age: number;
  region: number;
  avaId: string;
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
  abt: string;
  regDate: string;
  gender: number;
  onlineStatus: string;
  hasStoryMovie: boolean;
  avatarType: number;
  homeCountry: string;
  hasLovense?: boolean; // オプショナルで追加
  // 追加の詳細情報（APIレスポンスに含まれる可能性）
  hLevel?: string;
  bustSize?: string;
  isNewUser?: boolean;
};

export type BookmarkListUserInfo = {
  // 基本情報
  userName: string;
  userId: string;
  age: number;
  region: Region;
  avatarId: string;

  // 通話状態
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
  isCalling?: boolean;

  // メッセージ・説明
  message?: string;
  about?: string;
  postTime?: string;

  // ユーザー詳細情報
  hasLovense: boolean;
  hLevel?: string | undefined;
  bustSize?: string | undefined;
  isNewUser: boolean;
  regDate?: string | undefined;
  lastLoginTime?: string | undefined;

  // APIから直接取得できる追加情報
  gender?: number;
  onlineStatus?: string;
  hasStoryMovie?: boolean;
  avatarType?: number;
  homeCountry?: string;
};

export type BookmarkListResponse = {
  bookmarkList: BookmarkListUserInfo[];
};

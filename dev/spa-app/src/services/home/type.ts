import type { CreditPurchaseCourseInfo } from '@/apis/get-credit-purchase-course-info';
import type { GetUtageWebBoardMessageResponseData } from '@/apis/get-utage-web-board-message';
import type { MeetPeopleResponseData } from '@/apis/utage-web-get-meet-people-exclude-video-call-channeler';
import type { APIRequest } from '@/libs/http/type';
import type {
  InstantCallItem,
  RankedMeetPerson,
} from '@/services/ranking/type';
import type { MyUserInfo } from '@/types/MyUserInfo';
import type { BodyTypeNumber } from '@/utils/bodyType';
import type { MarriageHistoryNumber } from '@/utils/marriageHistory';
import type { Region } from '@/utils/region';
import type { LiveChannels, MeetPeople, User } from '../shared/type';

/**
 * 探す画面のユーザー一覧・配信中ユーザー・配信可能ユーザーの取得結果
 */
export type HomeData = {
  liveChannels?: LiveChannels;
  recentVideoCallUsers?: RecentVideoCallUser[];
  videoCallRankingUsers?: RankedMeetPerson[];
  meetPeopleUsers?: MeetPeople[];
};

/**
 * 拡張されたユーザー情報型（useGetMyInfoで使用）
 */
export type MyUserInfoExtended = MyUserInfo & {
  isRegisteredEmail: boolean;
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
  region?: Region;
  regDate?: string;
  bustSize?: string;
  hLevel?: string;
  isFirstBonusCourseExist?: boolean;
  isSecondBonusCourseExist?: boolean;
  isThirdBonusCourseExist?: boolean;
  isFourthBonusCourseExist?: boolean;
  isFifthBonusCourseExist?: boolean;
};

/**
 * BOARD/LOGIN/ランキング統合取得の結果
 */
export type InstantCallData = {
  videoCallRankingUsers: RankedMeetPerson[];
  boardData: GetUtageWebBoardMessageResponseData[];
  loginData: MeetPeopleResponseData[];
  boardInstantCallList: InstantCallItem[];
  loginInstantCallList: InstantCallItem[];
};

/**
 * ユーザー一覧の取得
 */
export type MeetPeopleRequest = APIRequest & {
  token?: string | undefined;
  limit: number;
  sort_type: 0 | 1; // 0: ログイン日時, 1: 登録日
  video_call_waiting?: boolean;
  voice_call_waiting?: boolean;
  showing_face?: true;
  is_new?: boolean;
  lower_age?: number;
  upper_age?: number;
  default_avatar_flag: boolean;
  marriage_history?: MarriageHistoryNumber[];
  region?: number[];
  job?: string[];
  bdy_tpe?: BodyTypeNumber[];
  last_login_time?: string;
  fetch_users?: number;
  has_lovense?: boolean;
  is_big_breasts?: boolean;
  is_listed_on_flea_market?: boolean;
  is_flea_market_on_sale?: boolean;
};

/*
 * ライブユーザー一覧の取得
 */
export type LiveUsersRequest = APIRequest & {
  token: string;
  call_type: 'video' | 'live';
};

/**
 * チャンネル情報
 */
export type ChannelInfo = {
  channelId: string;
  broadcasterId: string;
  callType: string;
  channelType: string;
  thumbnailImageId: string;
};

/*
 * ライブユーザー一覧の取得
 */
export type RecentVideoCallUsersRequest = APIRequest & {
  api: string;
  token?: string;
  application_id?: string;
  limit?: number;
};

/**
 * ビデオ通話可能ユーザー一覧
 * 最新ビデオ通話したユーザー = 通話可能ユーザーと判定する
 */
export type RecentVideoCallUser = {
  userId: string;
  isNew: boolean;
  endTime: string;
  hasLovense: boolean;
  hasStoryMovie: boolean;
  user: User;
};

/**
 * バナー情報
 */
export type Banner = {
  imagePath: string;
  link: string;
};

/**
 * getBanners()の戻り値型（バナー情報 + クレジット購入コース情報）
 */
export type BannersWithCreditInfo = {
  banners: Banner[];
  creditPurchaseCourseInfo: CreditPurchaseCourseInfo;
};

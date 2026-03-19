import type { GetCategoryRankingForUtageWebResponseData } from '@/apis/get-category-ranking-for-utage-web';
import type { GetChatFileArchiveResponseElementData } from '@/apis/get-chat-file-archive-camel';
import type { GetPresentMenuListResponseElementData } from '@/apis/get-present-menu-list-camel';
import type { RecommendedUserData } from '@/apis/get-recommended-users-camel';
import type { GetUserInfoForWebResponseData } from '@/apis/get-user-inf-for-web';
import type { APIRequest, APIResponse } from '@/libs/http/type';
import type { LiveChannel } from '@/types/LiveChannel';
import type { MediaInfo } from '@/types/MediaInfo';
import type { ProfileMediaItem } from './utils/media';

// camelcaseKeys変換後のAPIResponse型
export type CamelCasedUserInfoResponse = Omit<
  APIResponse<GetUserInfoForWebResponseData>,
  'data'
> & {
  data?: UserInfo;
};

// リクエスト型定義
export type GetUserInfoRequest = APIRequest & {
  userId: string;
  viewerUserId?: string;
};

export type GetThumbnailListRequest = APIRequest & {
  userId: string;
};

export type GetCategoryRankingRequest = APIRequest & {
  // パラメータなし
};

export type GetChatFileArchiveRequest = APIRequest & {
  token?: string;
  partnerId: string;
};

export type GetRecommendedUsersRequest = APIRequest & {
  token?: string;
};

export type GetVideoChatMenuListRequest = APIRequest & {
  token: string;
  partnerId: string;
};

export type AddFavoriteRequest = APIRequest & {
  token: string;
  partnerId: string;
};

export type AddBookmarkRequest = APIRequest & {
  token: string;
  partnerId: string;
};

export type DeleteBookmarkRequest = APIRequest & {
  token: string;
  partnerId: string;
};

export type ViewImageRequest = APIRequest & {
  token: string;
  imageId: string;
};

export type ViewVideoRequest = APIRequest & {
  token: string;
  videoId: string;
};

// レスポンス型定義（camelcaseKeys変換後の型）
export type UserInfo = {
  readonly userId: string;
  readonly userName: string;
  readonly voiceCallWaiting: boolean;
  readonly videoCallWaiting: boolean;
  readonly videoChatWaiting: boolean;
  readonly point: number;
  readonly avaId: string;
  readonly region: number;
  readonly age: number;
  readonly abt: string | undefined;
  readonly bdyTpe: number[];
  readonly inters: number[];
  readonly talkTheme: number;
  readonly stepToCall: number;
  readonly marriageHistory: number;
  readonly showingFaceStatus: number;
  readonly personalities: number[];
  readonly lastLoginTimeFromUserCollection: string;
  readonly regDate?: string;
  readonly isFav: number;
  readonly oftenVisitTime?: string;
  readonly job?: string;
  readonly looks?: string;
  readonly holidays?: string;
  readonly hometown?: string;
  readonly bloodType?: string;
  readonly housemate?: string;
  readonly smokingStatus?: string;
  readonly alcohol?: string;
  readonly constellation?: string;
  readonly bookmark: boolean;
  readonly isNewUser: boolean;
  readonly hasLovense?: boolean;
  readonly bustSize?: string;
  readonly hLevel?: string;
  readonly applicationId: string;
  readonly identificationStatus?: IdentificationStatus;
};
// camelcaseKeys変換後のサムネイル型定義
export type ThumbnailInfo = {
  readonly type: 'image' | 'movie';
  readonly thumbnailUrl: string;
  readonly timelineMovieUrl?: string; // movie typeの場合のみ
};
export type RankingInfo = GetCategoryRankingForUtageWebResponseData;
export type ChatFileArchiveInfo = GetChatFileArchiveResponseElementData[0];
export type RecommendedUserInfo = RecommendedUserData;
export type VideoChatMenuInfo = GetPresentMenuListResponseElementData;

/**
 * プロフィール初期データのレスポンス型
 * 並列取得される3つのAPIレスポンスを統合
 */
export type ProfileInitialDataResponse = {
  /** ユーザー基本情報 */
  userInfo: UserInfo;
  /** サムネイル一覧 */
  thumbnailList: ThumbnailInfo[];
  /** チャットファイルアーカイブ */
  chatFileArchive: ChatFileArchiveInfo[];
};

/**
 * ページ表示用に加工済みの初期データ（最終形）
 * - thumbnailList を MediaInfo[] に正規化した mediaList を含む
 */
export type ProfileInitialData = {
  userInfo: UserInfo;
  mediaList: MediaInfo[];
  mediaItems: ProfileMediaItem[];
  hasMultipleImages: boolean;
};

// 共通点の生データ型（サーバーサイドで返すデータ）
export type CommonPointsRawData = {
  ageGroup?: number; // 年齢層の数値
  region?: number; // 地域の数値
  hobby?: number[]; // 趣味の数値配列
  personality?: number[]; // 性格の数値配列
};

export type ProfileLaterDataResponse = {
  recommendedUsers: RecommendedUserInfo[];
  videoChatMenuList: VideoChatMenuInfo[];
  commonPoints?: CommonPointsRawData | null;
};

/**
 * Suspenseで個別取得するデータの型定義
 */

/** 本人確認ステータスのレスポンス型 */
export type IdentificationStatusResponse = {
  identificationStatus: IdentificationStatus;
};

/** おすすめユーザーのレスポンス型 */
export type RecommendedUsersDataResponse = {
  recommendedUsers: RecommendedUserInfo[];
};

/** 共通点のレスポンス型 */
export type CommonPointsDataResponse = {
  commonPoints: CommonPointsRawData | null;
};

// 加工済みユーザー情報型（既存のPartnerInfo型に相当）
export type ProcessedUserInfo = {
  userId: string;
  userName: string;
  avatarId: string;
  age: number;
  about: string;
  hobby: string[];
  bodyType: string;
  marriageHistory: string;
  personality: string[];
  region: string;
  showingFace: string;
  stepToCall: string;
  talkTheme: string;
  lastLoginTime: string;
  videoCallWaiting: boolean;
  voiceCallWaiting: boolean;
  videoChatWaiting: boolean;
  isNewUser: boolean;
  oftenVisitTime: string;
  job: string;
  looks: string;
  holidays: string;
  hometown: string;
  bloodType: string;
  housemate: string;
  alcohol: string;
  smokingStatus: string;
  constellation: string;
  hasLovense: boolean;
  bustSize: string;
  hLevel: string;
  applicationId: string;
  ageGroup: string;
  isFavorited?: boolean;
  isBookmarked?: boolean;
  rank?: number;
};

// API操作結果型
export type ProfileActionResult = {
  success: boolean;
  message?: string;
};

// エラー型
export type ProfileError = {
  code: number;
  message: string;
  details?: unknown;
};

// 本人確認ステータス型
export type IdentificationStatus = {
  isApproved: boolean;
};

export interface LiveBroadcasterData extends LiveChannel {
  isLoggedIn: boolean;
  thumbnailList: MediaInfo[];
  isFavorited: boolean;
  isBookmarked: boolean;
  rank?: number;
  otherLiveChannels?: Array<{
    broadcaster: LiveChannel['broadcaster'];
    channelInfo: LiveChannel['channelInfo'];
    type: 'live' | 'video' | 'voice';
    statusText?: string;
  }>;
}

/**
 * ライブ配信特有の情報のみを含む型（unbroadcasterパターンとの統一）
 * broadcaster情報はuserInfoを使用するため含まない
 */
export interface LiveBroadcasterChannelData {
  channelInfo: {
    rtcChannelToken: string;
    appId: string;
    channelId: string;
    peerId: string;
    userCount: number;
    thumbnailImageId: string;
  } | null;
  isLoggedIn: boolean;
  isFavorited: boolean;
  isBookmarked: boolean;
  isInProgress: boolean;
  otherLiveChannels: Array<{
    userId: string;
    userName: string;
    avatarId: string;
    age: number;
    about: string;
    region: number; // 生データ（数値）
    isLive: boolean;
    isNewUser: boolean;
    hasLovense: boolean;
    channelInfo: {
      rtcChannelToken: string;
      appId: string;
      channelId: string;
      peerId: string;
      userCount: number;
      thumbnailImageId: string;
    };
  }>;
}

export interface LiveBroadcasterResponse {
  liveBroadcasterData: LiveBroadcasterData;
}

export interface LiveBroadcasterActionResult {
  success: boolean;
  message?: string;
}

export interface CategoryRankingResponse {
  user: {
    user_name: string;
    voice_call_waiting: boolean;
    video_call_waiting: boolean;
    ava_id: string;
    region: number;
    age: number;
    abt: string | undefined;
    last_login_time: string;
    is_new: boolean;
    call_status: number;
    last_action_status_label?: string;
  };
  user_id: string;
  rank: number;
  is_sudden_rise: boolean;
  has_lovense: boolean;
}

// レビュー関連の型定義（camelCase変換後）
export type ReviewItem = {
  reviewInfo: {
    reviewId: string;
    score: number;
    reviewerUserId: string;
    description: string;
    createdAt: number;
  };
  reviewerUserInfo: {
    userName: string;
    avaId: string;
    age: number;
    userId: string;
    [key: string]: unknown;
  };
};

// Jambo APIからのレビューリストレスポンス型（camelCase変換後）
export type JamboReviewListResponse = {
  reviews: ReviewItem[];
  averageScore: number;
  reviewCount: number;
};

export type ProcessedReviewItem = ReviewItem & {
  formattedDate: string;
  maskedUsername: string;
};

export type ReviewListDataResponse = {
  reviewList: ProcessedReviewItem[];
  avgScore: number;
  reviewCount: number;
};

/**
 * レビュー評価の概要情報（軽量版）
 * avgScoreとreviewCountのみを必要とする画面で使用
 */
export type ReviewSummary = {
  avgScore: number;
  reviewCount: number;
};

/**
 * アクティブなライブ録画情報
 * profileService.getActiveLiveRecording() で取得
 */
export type ActiveLiveRecordingInfo = {
  readonly recordingId: string;
  readonly broadcasterId: string;
};

import type { GetUserInfoForWebResponseData } from '@/apis/get-user-inf-for-web';
import type { ListBookmarkResponseElementData } from '@/apis/list-bookmark';
import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { APIRequest, APIResponse } from '@/libs/http/type';
import type {
  BookmarkListResponse,
  BookmarkListUserInfo,
} from '@/services/bookmark-list/type';
import type { ApiRouteResponse } from '@/types/ApiRoute';
import { region } from '@/utils/region';

// ==============================
// Route Handler ⇔ Client の型定義
// ==============================

// Route Handler ⇔ Client のレスポンス型
export type GetBookmarkListRouteResponse =
  ApiRouteResponse<BookmarkListResponse>;

// ==============================
// Route Handler ⇔ Jambo の型定義
// ==============================

// Jambo向け取得リクエスト（snake_case）
export type GetBookmarkListJamboRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.LIST_BOOKMARK;
  readonly token: string;
  readonly skip: 0;
  readonly take: 72;
};

// Jamboからの取得レスポンス（snake_case）- 既存の型を使用
export type GetBookmarkListJamboResponseData = ListBookmarkResponseElementData;

// Jamboからのユーザー情報取得レスポンス（snake_case）- 既存の型を使用
export type GetUserInfoForWebJamboResponseData = GetUserInfoForWebResponseData;

export type GetBookmarkListUpstreamResponse = APIResponse<
  GetBookmarkListJamboResponseData[]
>;
export type GetUserInfoForWebUpstreamResponse =
  APIResponse<GetUserInfoForWebJamboResponseData>;

// ==============================
// リクエスト作成関数
// ==============================

export const createGetBookmarkListRequest = (
  token: string,
): GetBookmarkListJamboRequest => ({
  api: JAMBO_API_ROUTE.LIST_BOOKMARK,
  token,
  skip: 0,
  take: 72,
});

// ==============================
// レスポンス変換関数（Jambo → Client）
// ==============================

export const transformBookmarkListResponse = (
  bookmarkData: GetBookmarkListJamboResponseData[],
  userDetailsMap: Map<string, GetUserInfoForWebJamboResponseData>,
): BookmarkListResponse => {
  // 重複排除ロジック
  const bookmarkDataList = Array.from(
    new Map(bookmarkData.map((data) => [data.user_id, data])).values(),
  );

  const bookmarkList: BookmarkListUserInfo[] = bookmarkDataList.map((data) => {
    const userDetails = userDetailsMap.get(data.user_id);

    return {
      // 基本情報
      userName: data.user_name,
      userId: data.user_id,
      age: data.age,
      region: region(data.region),
      avatarId: data.ava_id,

      // 通話状態
      voiceCallWaiting: data.voice_call_waiting ?? false,
      videoCallWaiting: data.video_call_waiting ?? false,
      isCalling: false, // デフォルト値

      // メッセージ・説明
      message: data.abt ?? '',
      about: data.abt ?? '',
      postTime: '', // デフォルト値

      // ユーザー詳細情報（getUserInfoForWebから補完）
      hasLovense: userDetails?.has_lovense ?? false,
      hLevel: userDetails?.h_level ?? '',
      bustSize: userDetails?.bust_size ?? '',
      isNewUser: userDetails?.is_new ?? false,
      regDate: userDetails?.reg_date ?? '',
      lastLoginTime: userDetails?.last_login_time_from_user_collection ?? '',

      // APIから直接取得できる追加情報（今回は使用しないが型定義上必要）
      // NOTE: これらのプロパティは実際のAPIレスポンスに含まれないためデフォルト値を使用
      gender: 0,
      onlineStatus: '',
      hasStoryMovie: false,
      avatarType: 0,
      homeCountry: '',
    };
  });

  return {
    bookmarkList,
  };
};

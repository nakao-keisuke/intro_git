import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { BoardListUserInfo } from '@/services/board/type';
import { getAgeRange } from '@/utils/ageRangeUtils';
import { getRegionPrefectureNumbers } from '@/utils/region';

// ===============================
// Request Types (snake_case)
// ===============================

export type GetBoardDataRequest = {
  skip: number;
  call_waiting?: 'video' | 'voice';
  age?: string;
  region?: string;
};

type MeetPeopleRequestParams = {
  api: string;
  limit: number;
  sort_type: number;
  default_avatar_flag: boolean;
  video_call_waiting?: boolean;
  voice_call_waiting?: boolean;
  lower_age?: number;
  upper_age?: number;
  region?: number[];
};

export type PostBoardMessageRequest = {
  message: string;
};

// ===============================
// Response Types (CamelCase)
// ===============================

export type GetBoardDataResponse = {
  boardList: BoardListUserInfo[];
  hasMore: boolean;
  nextSkip: number;
};

export type PostBoardMessageResponse = {
  success: boolean;
  code?: number;
  message?: string;
};

// ===============================
// Request Functions for Route Handler → Jambo
// ===============================

/**
 * Route Handler から Jambo API への掲示板メッセージ取得リクエスト作成関数
 */
export function createGetBoardMessageRequest(
  token: string | undefined,
  skip: number,
) {
  return {
    api: JAMBO_API_ROUTE.BOARD_MESSAGE_LIST,
    ...(token && { token }),
    skip,
  };
}

/**
 * Route Handler から Jambo API への Meet People リクエスト作成関数
 */
export function createGetMeetPeopleRequest(
  callWaiting?: 'video' | 'voice',
  age?: string,
  region?: string,
): MeetPeopleRequestParams {
  const request: MeetPeopleRequestParams = {
    api: JAMBO_API_ROUTE.MEET_PEOPLE,
    limit: 200,
    sort_type: 0,
    default_avatar_flag: false,
  };

  // フィルター条件を追加
  if (callWaiting === 'video') {
    request.video_call_waiting = true;
  } else if (callWaiting === 'voice') {
    request.voice_call_waiting = true;
  }

  // 年齢フィルター
  if (age) {
    const ageRange = getAgeRange(age);
    if (ageRange.lower) request.lower_age = ageRange.lower;
    if (ageRange.upper) request.upper_age = ageRange.upper;
  }

  // 地域フィルター
  if (region) {
    const regionNumbers = getRegionPrefectureNumbers(region);
    if (regionNumbers.length > 0) {
      request.region = regionNumbers;
    }
  }

  return request;
}

/**
 * Route Handler から Jambo API への掲示板投稿リクエスト作成関数
 */
export function createPostBoardMessageRequest(token: string, message: string) {
  return {
    api: JAMBO_API_ROUTE.POST_BOARD_MESSAGE,
    token,
    message,
  };
}

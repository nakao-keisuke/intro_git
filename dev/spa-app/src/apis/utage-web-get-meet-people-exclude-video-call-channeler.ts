import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';
import type { BodyTypeNumber } from '@/utils/bodyType';
import type { MarriageHistoryNumber } from '@/utils/marriageHistory';

const sortLastLoginTime = 0;
const sortRegisterDate = 1;
type SORT_LAST_LOGIN_TIME = typeof sortLastLoginTime;
type SORT_REGISTER_DATE = typeof sortRegisterDate;

interface MeetPeopleRequest extends JamboRequest {
  readonly api: 'utage_web_get_meet_people_exclude_video_call_channeler';
  readonly limit: number;
  readonly sort_type: SORT_LAST_LOGIN_TIME | SORT_REGISTER_DATE;
  readonly video_call_waiting?: true;
  readonly voice_call_waiting?: true;
  readonly showing_face?: true;
  readonly is_new?: boolean;
  readonly lower_age?: number;
  readonly upper_age?: number;
  readonly default_avatar_flag: boolean;
  readonly marriage_history?: MarriageHistoryNumber[];
  readonly region?: number[];
  readonly job?: string[];
  readonly bdy_tpe?: BodyTypeNumber[];
  readonly last_login_time?: string;
  readonly fetch_users?: number;
  readonly has_lovense?: boolean;
  readonly is_big_breasts?: boolean;
}

export interface MeetPeopleResponseData extends JamboResponseData {
  readonly user_id: string;
  readonly ava_id: string;
  readonly abt: string;
  readonly age: number;
  readonly user_name: string;
  readonly region: number;
  readonly voice_call_waiting: boolean;
  readonly video_call_waiting: boolean;
  readonly is_new_user: boolean;
  readonly is_calling: boolean;
  readonly is_live_now: boolean;
  readonly last_login_time: string;
  readonly has_story_movie: boolean;
  readonly step_to_call: number;
  readonly has_lovense: boolean;
  readonly is_listed_on_flea_market: boolean;
  readonly bust_size?: string;
  readonly average_score?: number;
  readonly review_count?: number;
}

export const videoCallMeetPeopleRequest: MeetPeopleRequest = {
  api: 'utage_web_get_meet_people_exclude_video_call_channeler',
  default_avatar_flag: false,
  limit: 120,
  sort_type: sortLastLoginTime,
  video_call_waiting: true,
};

export const newComerMeetPeopleRequest: MeetPeopleRequest = {
  api: 'utage_web_get_meet_people_exclude_video_call_channeler',
  limit: 36,
  sort_type: sortLastLoginTime,
  is_new: true,
  lower_age: 18,
  upper_age: 35,
  default_avatar_flag: false,
};

/**
 * SPの探す画面専用のリクエスト
 * ISRで呼ぶためlimitを多めに設定
 */
export const loginMeetPeopleRequestForHome: MeetPeopleRequest = {
  api: 'utage_web_get_meet_people_exclude_video_call_channeler',
  limit: 300,
  sort_type: sortLastLoginTime,
  default_avatar_flag: false,
};

export const loginMeetPeopleRequest: MeetPeopleRequest = {
  api: 'utage_web_get_meet_people_exclude_video_call_channeler',
  limit: 200,
  sort_type: sortLastLoginTime,
  default_avatar_flag: false,
};

export const getMoreUsersRequest = (
  lastLoginTime?: string,
  isNew: boolean = false,
  lowerAge?: number,
  isBigBreasts?: boolean,
): MeetPeopleRequest => {
  const request: MeetPeopleRequest = {
    api: 'utage_web_get_meet_people_exclude_video_call_channeler',
    limit: 27,
    sort_type: 0,
    default_avatar_flag: false,
    ...(lastLoginTime && { last_login_time: lastLoginTime }),
    ...(isNew && { is_new: true }),
    ...(lowerAge !== undefined && { lower_age: lowerAge }),
    ...(isBigBreasts && { is_big_breasts: true }),
  };

  return request;
};

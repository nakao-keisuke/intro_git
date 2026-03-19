import type { JamboRequest } from '@/types/JamboApi';

type GetRecommendedUsersRequest = JamboRequest & {
  readonly api: 'get_recommended_users';
  readonly token: string;
};

export type RecommendedUserData = {
  readonly user_id: string;
  readonly user_name: string;
  readonly age: number;
  readonly region: number;
  readonly ava_id: string;
  readonly voice_call_waiting: boolean;
  readonly video_call_waiting: boolean;
  readonly abt: string;
  readonly last_login: string;
  readonly is_new?: boolean;
  readonly gender: number;
  readonly showing_face_status: number;
  readonly talk_theme: number;
  readonly step_to_call: number;
  readonly has_lovense?: boolean;
  readonly has_story_movie?: boolean;
  readonly is_online?: boolean;
  readonly app_version?: number | null;
  readonly bust_size?: string | null;
  readonly bckstg_num?: number;
  readonly housemate?: string;
  readonly is_sent?: boolean;
  readonly looks?: string;
  readonly constellation?: string;
  readonly holidays?: string;
  readonly instant_call_waiting?: boolean;
  readonly translated_username_in_english?: string;
  readonly lat?: number;
  readonly alcohol?: string;
  readonly marriage_history?: number;
  readonly h_level?: string | null;
  readonly application_id?: string;
  readonly pbimg_num?: number;
  readonly preferred_body_types?: number[];
  readonly bdy_tpe?: number[];
  readonly job?: string;
  readonly personalities?: number[];
  readonly status?: string | null;
  readonly is_favorite?: boolean;
  readonly smoking_status?: string;
  readonly long?: number;
  readonly often_visit_time?: string;
  readonly only_watch_call?: boolean;
  readonly reg_time?: number;
  readonly blood_type?: string;
  readonly silent_ok?: string | null;
  readonly hometown?: string;
  readonly preferred_personalities?: number[];
  readonly list_public_image?: Array<{
    img_id: string;
    buzz_id: string;
  }>;
  readonly inters?: number[];
  readonly offline_call?: boolean;
  readonly recent_call_time?: string;
  readonly time_out_user?: boolean;
};

export type GetRecommendedUsersResponseElementData = RecommendedUserData[];

export const getRecommendedUsersRequest = (
  token: string,
): GetRecommendedUsersRequest => {
  return {
    api: 'get_recommended_users',
    token: token,
  };
};

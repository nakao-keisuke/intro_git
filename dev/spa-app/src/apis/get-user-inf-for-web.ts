import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

interface GetUserInfoForWebRequest extends JamboRequest {
  readonly api: typeof JAMBO_API_ROUTE.GET_USER_INFO_FOR_WEB;
  readonly req_user_id: string;
  readonly user_id?: string;
}

export interface GetUserInfoForWebResponseData extends JamboResponseData {
  readonly user_id: string;
  readonly user_name: string;
  readonly voice_call_waiting: boolean;
  readonly video_call_waiting: boolean;
  readonly video_chat_waiting: boolean;
  readonly point: number;
  readonly ava_id: string;
  readonly region: number;
  readonly age: number;
  readonly abt: string | undefined;
  readonly bdy_tpe: number[];
  readonly inters: number[];
  readonly talk_theme: number;
  readonly step_to_call: number;
  readonly marriage_history: number;
  readonly showing_face_status: number;
  readonly personalities: number[];
  readonly last_login_time_from_user_collection: string;
  readonly reg_date?: string;
  readonly is_fav: number;
  readonly often_visit_time?: string;
  readonly job?: string;
  readonly looks?: string;
  readonly holidays?: string;
  readonly hometown?: string;
  readonly blood_type?: string;
  readonly house_mate?: string;
  readonly smoking_status?: string;
  readonly alcohol?: string;
  readonly constellation?: string;
  readonly bookmark: boolean;
  readonly is_new: boolean;
  readonly has_lovense?: boolean;
  readonly is_listed_on_flea_market?: boolean;
  readonly bust_size?: string;
  readonly h_level?: string;
  readonly application_id: string;
}

export const getUserInfoForWebRequest = (
  partnerId: string,
): GetUserInfoForWebRequest => {
  return {
    api: JAMBO_API_ROUTE.GET_USER_INFO_FOR_WEB,
    req_user_id: partnerId,
  };
};

export const getUserInfoForWebWithUserIdRequest = (
  userId: string,
  partnerId: string,
): GetUserInfoForWebRequest => {
  return {
    api: JAMBO_API_ROUTE.GET_USER_INFO_FOR_WEB,
    user_id: userId,
    req_user_id: partnerId,
  };
};

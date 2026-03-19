import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

interface GetUserInfoRequest extends JamboRequest {
  readonly api: typeof JAMBO_API_ROUTE.GET_USER_INFO;
  readonly token: string;
  readonly req_user_id?: string;
}

export interface GetUserInfoResponseData extends JamboResponseData {
  gender: number;
  readonly user_id: string;
  readonly user_name: string;
  readonly voice_call_waiting: boolean;
  readonly video_call_waiting: boolean;
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
  readonly email?: string;
  readonly reg_date: string;
  readonly bonus_flag: number;
  readonly often_visit_time: string;
  readonly application_id?: string;
  readonly paydoor_recurring_token?: string;
  readonly bust_size?: string;
  readonly h_level?: string;
  readonly gclid?: string;
  readonly job?: string;
  readonly looks?: string;
  readonly holidays?: string;
  readonly housemate?: string;
  readonly blood_type?: string;
  readonly alcohol?: string;
  readonly smoking_status?: string;
  readonly ga4_client_id?: string;
}

export function getUserInfoRequest(token: string): GetUserInfoRequest {
  return {
    api: JAMBO_API_ROUTE.GET_USER_INFO,
    token: token,
  };
}

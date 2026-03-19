import {
  APPLICATION_ID,
  type ApplicationIdType,
} from '@/constants/applicationId';
import { getCurrentTime } from '@/libs/date';
import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

interface LoginForWebRequest extends JamboRequest {
  readonly api: 'login_for_web';
  readonly device_id: string;
  readonly email?: string;
  readonly phone_number: string;
  readonly pwd: string;
  readonly login_time: string;
  readonly client_ip: string;
  readonly device_token?: string | undefined;
  readonly application_id: ApplicationIdType;
  readonly google_account_id?: string | undefined;
  readonly line_id?: string | undefined;
  readonly machine_type: 'pc' | 'mobile';
  readonly sc_flag?: boolean;
  readonly language?: string | undefined;
}

export interface LoginForWebResponseData extends JamboResponseData {
  readonly user_id: string;
  readonly user_name: string;
  readonly voice_call_waiting: boolean;
  readonly video_call_waiting: boolean;
  readonly point: number;
  readonly ava_id: string;
  readonly region: number;
  readonly age: number;
  readonly token: string;
  readonly got_registered_point: boolean;
  readonly email: string;
}

export function loginForWebRequest({
  email,
  phone,
  hashedPwd,
  clientIp,
  deviceToken,
  googleAccountId,
  lineId,
  machineType,
  applicationId = APPLICATION_ID.WEB,
  scFlag = false,
  idfv,
  lang,
}: {
  email?: string;
  hashedPwd?: string;
  clientIp: string;
  deviceToken?: string | undefined;
  phone?: string;
  googleAccountId?: string | undefined;
  lineId?: string | undefined;
  machineType: 'pc' | 'mobile';
  applicationId?: ApplicationIdType;
  scFlag?: boolean;
  idfv?: string | undefined;
  lang?: string | undefined;
}): LoginForWebRequest {
  return {
    api: 'login_for_web',
    device_id: 'device_id',
    email: email ?? '',
    phone_number: phone ?? '',
    pwd: hashedPwd ?? '',
    login_time: getCurrentTime('yyyyMMddHHmmss'),
    client_ip: clientIp,
    device_token: deviceToken ?? '',
    application_id: applicationId,
    google_account_id: googleAccountId ?? '',
    line_id: lineId ?? '',
    machine_type: machineType,
    sc_flag: scFlag,
    ...(idfv ? { device_id: idfv } : {}),
    ...(lang ? { language: lang } : {}),
  };
}

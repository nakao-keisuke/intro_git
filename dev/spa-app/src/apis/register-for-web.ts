import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type RegisterForWebRequest = JamboRequest & {
  readonly api: 'reg_for_web';
  readonly user_name: string;
  readonly age: number;
  readonly region: number;
  readonly cm_code: string;
  readonly client_ip: string;
  readonly web_uuid: string;
  readonly application_id: string;
  readonly visitor_id: string;
  readonly phone_number: string;
  readonly pwd: string;
  readonly google_account_id: string;
  readonly email: string;
  readonly line_id: string;
  readonly gclid: string | null;
  readonly ga4_client_id: string | null;
  readonly language?: string | undefined;
  readonly device_id?: string | undefined;
};

export type RegisterForWebResponseData = JamboResponseData & {
  readonly token: string;
  readonly pwd: string;
  readonly email: string;
  readonly user_id: string;
};

export function registerForWebRequest(
  name: string,
  age: number,
  region: number,
  cmCode: string,
  clientIp: string,
  webUUId: string,
  visitorId: string,
  applicationId: string,
  phoneNumber: string,
  password: string,
  googleAccountId: string,
  email: string,
  lineId: string,
  gclid: string | null | undefined,
  ga4ClientId: string | null | undefined,
  lang?: string | undefined,
  idfv?: string | undefined,
): RegisterForWebRequest {
  return {
    api: 'reg_for_web',
    user_name: name,
    age: age,
    region: region,
    cm_code: cmCode,
    client_ip: clientIp,
    web_uuid: webUUId,
    visitor_id: visitorId,
    application_id: applicationId,
    phone_number: phoneNumber,
    pwd: password,
    google_account_id: googleAccountId,
    email: email,
    line_id: lineId,
    gclid: gclid || null,
    ga4_client_id: ga4ClientId || null,
    ...(lang ? { language: lang } : {}),
    ...(idfv ? { device_id: idfv } : {}),
  };
}

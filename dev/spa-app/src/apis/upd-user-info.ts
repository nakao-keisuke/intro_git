import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { JamboRequest } from '@/types/JamboApi';
import type { ActiveTime } from '@/utils/activeTime';
import type { Alcohol } from '@/utils/alcohol';
import type { BloodType } from '@/utils/bloodType';
import { type BodyType, bodyTypeNumber } from '@/utils/bodyType';
import { hobbyNumber } from '@/utils/hobby';
import type { Holiday } from '@/utils/holiday';
import type { Housemate } from '@/utils/housemate';
import type { Occupation } from '@/utils/occupation';
import { personalityNumber } from '@/utils/personality';
import type { PreferredLooks } from '@/utils/preferredLooks';
import type { Smoking } from '@/utils/smoking';
import { type TalkTheme, talkThemeNumber } from '@/utils/talkTheme';

type UpdateUserInfoRequest = JamboRequest & {
  readonly api: typeof JAMBO_API_ROUTE.UPDATE_USER_INFO;
  readonly token: string;
  readonly user_name?: string;
  readonly age?: number;
  readonly region?: number;
  readonly inters?: number[];
  readonly personalities?: number[];
  readonly auto_region?: 0;
  readonly gender?: 0;
  readonly abt?: string;
  readonly talk_theme?: number;
  readonly bdy_tpe?: number[];
  // 新規追加フィールド（サーバー側はsnake_caseで文字列として保存）
  readonly often_visit_time?: string; // 活動時間帯
  readonly job?: string; // 職業
  readonly looks?: string; // 好みの外見
  readonly holidays?: string; // 休日
  readonly housemate?: string; // 同居人
  readonly blood_type?: string; // 血液型
  readonly alcohol?: string; // お酒
  readonly smoking_status?: string; // 喫煙状況
};

export type UpdateUserInfoResponseData = {
  readonly bonus_flag: number;
};

// ベースリクエストを生成するヘルパー関数
const createBaseRequest = (
  token: string,
  userName: string,
  region: number,
): Pick<
  UpdateUserInfoRequest,
  'api' | 'token' | 'user_name' | 'gender' | 'region'
> => ({
  api: JAMBO_API_ROUTE.UPDATE_USER_INFO,
  token,
  user_name: userName,
  gender: 0,
  region,
});

// 汎用的な更新リクエスト作成関数
const createUpdateRequest = (
  token: string,
  userName: string,
  region: number,
  fields: Partial<
    Omit<
      UpdateUserInfoRequest,
      'api' | 'token' | 'user_name' | 'gender' | 'region'
    >
  >,
): UpdateUserInfoRequest => ({
  ...createBaseRequest(token, userName, region),
  ...fields,
});

// === 既存フィールド用リクエスト関数 ===

export const updateUserInfoRequest = (
  token: string,
  userName: string,
  age: number,
  region: number,
  about: string | undefined,
  talktheme: TalkTheme,
  bodytype: BodyType,
  inters: string,
  personalities: string,
): UpdateUserInfoRequest => {
  const aboutObj = about ? { abt: about } : {};
  return createUpdateRequest(token, userName, region, {
    age,
    talk_theme: talkThemeNumber(talktheme),
    inters: [hobbyNumber(inters)],
    personalities: [personalityNumber(personalities)],
    bdy_tpe: [bodyTypeNumber(bodytype)],
    auto_region: 0,
    ...aboutObj,
  });
};

export const updateAboutRequest = (
  about: string,
  token: string,
  userName: string,
  region: number,
): UpdateUserInfoRequest =>
  createUpdateRequest(token, userName, region, { abt: about });

export const updateAgeRequest = (
  age: number,
  token: string,
  userName: string,
  region: number,
): UpdateUserInfoRequest =>
  createUpdateRequest(token, userName, region, { age });

export const updateBodyTypeRequest = (
  bodytype: BodyType,
  token: string,
  userName: string,
  region: number,
): UpdateUserInfoRequest =>
  createUpdateRequest(token, userName, region, {
    bdy_tpe: [bodyTypeNumber(bodytype)],
  });

export const updatePersonalityRequest = (
  personalities: string,
  token: string,
  userName: string,
  region: number,
): UpdateUserInfoRequest =>
  createUpdateRequest(token, userName, region, {
    personalities: [personalityNumber(personalities)],
  });

export const updateIntersRequest = (
  inters: string,
  token: string,
  userName: string,
  region: number,
): UpdateUserInfoRequest =>
  createUpdateRequest(token, userName, region, {
    inters: [hobbyNumber(inters)],
  });

export const updateTalkThemeRequest = (
  talktheme: TalkTheme,
  token: string,
  userName: string,
  region: number,
): UpdateUserInfoRequest =>
  createUpdateRequest(token, userName, region, {
    talk_theme: talkThemeNumber(talktheme),
  });

export const updateUserNameRequest = (
  token: string,
  userName: string,
  region: number,
): UpdateUserInfoRequest => createUpdateRequest(token, userName, region, {});

export const updateRegionRequest = (
  token: string,
  userName: string,
  region: number,
): UpdateUserInfoRequest => createUpdateRequest(token, userName, region, {});

// === 新規追加フィールド用リクエスト関数 ===

export const updateActiveTimeRequest = (
  activeTime: ActiveTime,
  token: string,
  userName: string,
  region: number,
): UpdateUserInfoRequest =>
  createUpdateRequest(token, userName, region, {
    often_visit_time: activeTime,
  });

export const updateOccupationRequest = (
  occupation: Occupation,
  token: string,
  userName: string,
  region: number,
): UpdateUserInfoRequest =>
  createUpdateRequest(token, userName, region, {
    job: occupation,
  });

export const updatePreferredLooksRequest = (
  preferredLooks: PreferredLooks,
  token: string,
  userName: string,
  region: number,
): UpdateUserInfoRequest =>
  createUpdateRequest(token, userName, region, {
    looks: preferredLooks,
  });

export const updateHolidayRequest = (
  holiday: Holiday,
  token: string,
  userName: string,
  region: number,
): UpdateUserInfoRequest =>
  createUpdateRequest(token, userName, region, {
    holidays: holiday,
  });

export const updateHousemateRequest = (
  housemate: Housemate,
  token: string,
  userName: string,
  region: number,
): UpdateUserInfoRequest =>
  createUpdateRequest(token, userName, region, {
    housemate: housemate,
  });

export const updateBloodTypeRequest = (
  bloodType: BloodType,
  token: string,
  userName: string,
  region: number,
): UpdateUserInfoRequest =>
  createUpdateRequest(token, userName, region, {
    blood_type: bloodType,
  });

export const updateAlcoholRequest = (
  alcohol: Alcohol,
  token: string,
  userName: string,
  region: number,
): UpdateUserInfoRequest =>
  createUpdateRequest(token, userName, region, {
    alcohol: alcohol,
  });

export const updateSmokingRequest = (
  smoking: Smoking,
  token: string,
  userName: string,
  region: number,
): UpdateUserInfoRequest =>
  createUpdateRequest(token, userName, region, {
    smoking_status: smoking,
  });

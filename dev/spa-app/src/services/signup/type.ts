import type { APIRequest } from '@/libs/http/type';

// FingerprintJS 復号化リクエスト型
export type UnsealFingerprintRequest = APIRequest & {
  sealedData: string;
};

// FingerprintJS 復号化レスポンス型（APIから返却される構造）
export type UnsealFingerprintResponseData = {
  data: UnsealFingerprintResponse;
};

// FingerprintJS データ本体
export type UnsealFingerprintResponse = {
  visitorId: string | undefined;
  isVPN: boolean | undefined;
};

// 通話待機設定更新リクエスト型
export type UpdateCallWaitingRequest = APIRequest & {
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
};

// 通話待機設定更新レスポンス型（空オブジェクト）
export type UpdateCallWaitingResponse = Record<string, never>;

// ユーザー登録パラメータ型
export type RegisterUserParams = {
  name: string;
  age: number;
  region: number;
  cmCode: string;
  clientIp: string;
  webUUId: string;
  visitorId: string;
  applicationId: string;
  phoneNumber: string;
  password: string;
  googleAccountId: string;
  email: string;
  lineId: string;
  deviceToken?: string;
  googleClientId?: string;
  machineType?: string;
  cookie?: string;
  gclid: string;
};

// サインアップ操作結果型
export type SignupActionResult<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

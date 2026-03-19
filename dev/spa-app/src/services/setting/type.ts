import type { APIRequest } from '@/libs/http/type';

export type SettingInitialData = {
  isPurchased: boolean;
  consumedPoint: number;
};

export type SettingRequest = APIRequest & {
  token?: string;
};

export type AlreadyRegisteredMailData = {
  email: string;
};

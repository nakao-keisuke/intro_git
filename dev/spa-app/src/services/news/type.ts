import type { APIRequest } from '@/libs/http/type';

export type NewsDataRequest = APIRequest & {
  token?: string;
};

export type NewsDataResponse = {
  isFirstBonusCourseExist: boolean;
  isSecondBonusCourseExist: boolean;
  isThirdBonusCourseExist: boolean;
  isFourthBonusCourseExist: boolean;
  isFifthBonusCourseExist: boolean;
  isPaidySplitBannerExist: boolean;
  isUtage: boolean;
  token: string;
};

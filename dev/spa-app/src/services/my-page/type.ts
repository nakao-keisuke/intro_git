import type { Banner } from '@/types/Banner';
import type { MyUserInfo } from '@/types/MyUserInfo';
import type { User } from '../shared/type';

export interface MyPageInitialData {
  myUserInfo: MyUserInfo | null;
  isRegisteredEmail: boolean;
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
  isAboutBonusAvailable: boolean;
  isAvatarBonusAvailable: boolean;
  isAgeBonusAvailable: boolean;
  isHobbyBonusAvailable: boolean;
  isBodytypeBonusAvailable: boolean;
  bannerList: Banner[];
  checkTimeList: string[];
  isFirstBonusCourseExist: boolean;
  isSecondBonusCourseExist: boolean;
  isThirdBonusCourseExist: boolean;
  isFourthBonusCourseExist: boolean;
  isFifthBonusCourseExist: boolean;
  userDetail: User | null;
  isOnboardingMissionCompleted: boolean;
  creditPurchaseCourseInfoStatus?: 'success' | 'error' | 'unknown';
  gclid?: string;
  googleClientId?: string;
}
export interface CreditPurchaseCourse {
  isCreditPurchaseLogExist: boolean;
  canBuyFirstBonusCourse: boolean;
  canBuySecondBonusCourse: boolean;
  canBuyThirdBonusCourse: boolean;
  canBuyFourthBonusCourse: boolean;
  canBuyFifthBonusCourse: boolean;
}

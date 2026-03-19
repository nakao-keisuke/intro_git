import type { MissionItem } from '@/apis/onboarding-mission';
import type { Banner } from '@/types/Banner';
import type { JamboResponseData } from '@/types/JamboApi';
import type { MyUserInfo } from '@/types/MyUserInfo';

export type PurchasePageData = MyUserInfo & {
  email: string;
  isFirstBonusCourseExist: boolean;
  isSecondBonusCourseExist: boolean;
  isThirdBonusCourseExist: boolean;
  isFourthBonusCourseExist: boolean;
  isFifthBonusCourseExist: boolean;
  isCreditLogExist: boolean;
  timestamp: string;
  signature: string;
  bannerList: Banner[];
  isPaidyAccount: boolean;
  token: string;
  creditCardMission: MissionItem | null;
};

export type PurchaseServiceError = {
  type: 'error';
  message: string;
};

export type PurchasePageResponse = PurchasePageData | PurchaseServiceError;

export type PurchaseSearchParams = {
  showAlert?: string;
  message?: string;
  paymentStatus?: string;
  amount?: string;
  point?: string;
  transactionId?: string;
  from_chat?: string;
  method?: string;
  source?: string;
};

export interface GetCreditPurchaseCourseResponseData extends JamboResponseData {
  // camelCase (normalized by ServerHttpClient)
  readonly isCreditPurchaseLogExist?: boolean;
  readonly canBuyFirstBonusCourse?: boolean;
  readonly canBuySecondBonusCourse?: boolean;
  readonly canBuyThirdBonusCourse?: boolean;
  readonly canBuyFourthBonusCourse?: boolean;
  readonly canBuyFifthBonusCourse?: boolean;
}

export interface PaymentCustomerResponseData extends JamboResponseData {
  // camelCase (normalized by ServerHttpClient)
  readonly defaultPaymentMethodId?: string;
  readonly stripeCustomerId?: string;
}

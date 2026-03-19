import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

interface GetCreditPurchaseCourseInfoRequest extends JamboRequest {
  readonly api: 'get_credit_purchase_course_info';
  readonly token: string;
}

/**
 * Jambo サーバーから直接レスポンスされる snake_case 型
 * postToJambo() で直接 Jambo サーバーにリクエストする場合に使用
 * 例: purchaseService.ts, dailyBonusService.ts, newsService.ts
 */
export interface GetCreditPurchaseCourseResponseData extends JamboResponseData {
  readonly is_credit_purchase_log_exist?: boolean;
  readonly can_buy_first_bonus_course?: boolean;
  readonly can_buy_second_bonus_course?: boolean;
  readonly can_buy_third_bonus_course?: boolean;
  readonly can_buy_fourth_bonus_course?: boolean;
  readonly can_buy_fifth_bonus_course?: boolean;
}

/**
 * Pages Router API 経由で camelCase に変換されたレスポンス型
 * serverHttpClient による自動変換後に使用
 * 例: useGetCreditPurchaseCourseInfo.hook.ts, AppPayNoModal.tsx
 */
export interface CreditPurchaseCourseInfo {
  readonly isCreditPurchaseLogExist: boolean;
  readonly canBuyFirstBonusCourse: boolean;
  readonly canBuySecondBonusCourse: boolean;
  readonly canBuyThirdBonusCourse: boolean;
  readonly canBuyFourthBonusCourse: boolean;
  readonly canBuyFifthBonusCourse: boolean;
}

export function getCreditPurchaseCourseInfoRequest(
  token: string,
): GetCreditPurchaseCourseInfoRequest {
  return {
    api: 'get_credit_purchase_course_info',
    token: token,
  };
}

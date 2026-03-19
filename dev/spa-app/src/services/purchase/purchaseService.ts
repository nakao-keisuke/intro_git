import { getCreditPurchaseCourseInfoRequest } from '@/apis/get-credit-purchase-course-info';
import { getPaymentCustomerRequest } from '@/apis/get-payment-customer';
import {
  type GetUserInfoResponseData,
  getUserInfoRequest,
} from '@/apis/get-user-inf';
import {
  normalizeMissionToSnakeCase,
  type OnboardingMissionResponseData,
  onboardingMissionRequest,
} from '@/apis/onboarding-mission';
import { MISSION_IDS } from '@/constants/missionIds';
import { encryptBySha256 } from '@/libs/crypto';
import type { HttpClient } from '@/libs/http/HttpClient';
import type { Banner } from '@/types/Banner';
import type { JamboResponse } from '@/types/JamboApi';
import { isPaidyAccount } from '@/utils/paidy';
import type {
  GetCreditPurchaseCourseResponseData,
  PaymentCustomerResponseData,
  PurchasePageResponse,
} from './type';

export type PurchaseService = {
  getInitialData: (
    token: string,
    email: string,
  ) => Promise<PurchasePageResponse>;
  getPaymentCustomer: (token: string) => Promise<{
    defaultPaymentMethodId: string;
    stripeCustomerId: string;
  } | null>;
};

export class PurchaseServiceImpl implements PurchaseService {
  constructor(private readonly client: HttpClient) {}

  async getInitialData(
    token: string,
    email: string,
  ): Promise<PurchasePageResponse> {
    try {
      const userRequest = getUserInfoRequest(token);
      const creditRequest = getCreditPurchaseCourseInfoRequest(token);
      const missionRequest = onboardingMissionRequest(token, false); // Server側では常にfalse

      const [
        { code: userCode, data: userData },
        { code: _bonusCode, data: bonusData },
        { code: missionCode, data: missionDataRaw },
      ] = await Promise.all([
        this.client.post<JamboResponse<GetUserInfoResponseData>>(
          import.meta.env.API_URL!,
          userRequest,
        ),
        this.client.post<JamboResponse<GetCreditPurchaseCourseResponseData>>(
          import.meta.env.API_URL!,
          creditRequest,
        ),
        this.client.post<JamboResponse<OnboardingMissionResponseData>>(
          import.meta.env.API_URL!,
          missionRequest,
        ),
      ]);

      // APIレスポンスをsnake_case形式に正規化
      const missionData = missionDataRaw
        ? {
            ...missionDataRaw,
            missions: missionDataRaw.missions?.map(normalizeMissionToSnakeCase),
          }
        : null;

      if (userCode || !userData) {
        return {
          type: 'error',
          message: 'サーバーの不明なエラーです',
        };
      }

      if (missionCode || !missionData) {
        return {
          type: 'error',
          message: 'ミッションの取得に失敗しました',
        };
      }

      // 暗号化署名の生成
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const plaintext = `${timestamp}${
        import.meta.env.PAYDOOR_API_SECRET as string
      }`.toUpperCase();
      const signature = encryptBySha256(plaintext);

      // ボーナスバナーの決定
      let bonusBanner: Banner | null = null;
      if (bonusData?.canBuyFirstBonusCourse) {
        bonusBanner = { id: 'purchasezerothheader', path: '/purchase' };
      } else if (bonusData?.canBuySecondBonusCourse) {
        bonusBanner = { id: 'purchasefirstheader', path: '/purchase' };
      } else if (bonusData?.canBuyThirdBonusCourse) {
        bonusBanner = { id: 'purchasesecondheader', path: '/purchase' };
      } else if (bonusData?.canBuyFourthBonusCourse) {
        bonusBanner = { id: 'purchasethirdheader', path: '/purchase' };
      } else if (bonusData?.canBuyFifthBonusCourse) {
        bonusBanner = { id: 'purchasefourthheader', path: '/purchase' };
      }

      // クレカ登録ミッション情報を取得（CSR側で判定するため）
      const creditCardMission =
        missionData?.missions?.find(
          (mission) =>
            mission.mission_id === MISSION_IDS.CREDIT_CARD_REGISTRATION,
        ) || null;

      return {
        email: email.includes('@') ? email : '',
        userId: userData.user_id,
        userName: userData.user_name,
        avatarId: userData.ava_id,
        age: userData.age,
        point: userData.point,
        isFirstBonusCourseExist: !!bonusData?.canBuyFirstBonusCourse,
        isSecondBonusCourseExist: !!bonusData?.canBuySecondBonusCourse,
        isThirdBonusCourseExist: !!bonusData?.canBuyThirdBonusCourse,
        isFourthBonusCourseExist: !!bonusData?.canBuyFourthBonusCourse,
        isFifthBonusCourseExist: !!bonusData?.canBuyFifthBonusCourse,
        isCreditLogExist: !!bonusData?.isCreditPurchaseLogExist,
        timestamp,
        signature,
        bannerList: [
          { id: 'dailybonus', path: '/premium-dailybonus' } as const,
          ...(bonusBanner ? [bonusBanner] : []),
        ],
        isPaidyAccount: isPaidyAccount(userData.user_id),
        token,
        creditCardMission,
      };
    } catch (error) {
      console.error('PurchaseService Error:', error);
      return {
        type: 'error',
        message: 'サーバーの不明なエラーです',
      };
    }
  }

  async getPaymentCustomer(token: string): Promise<{
    defaultPaymentMethodId: string;
    stripeCustomerId: string;
  } | null> {
    try {
      const request = getPaymentCustomerRequest(token);
      const { code, data } = await this.client.post<
        JamboResponse<PaymentCustomerResponseData>
      >(import.meta.env.API_URL!, request);

      if (code !== 0) return null;

      const hasPaymentMethod = !!data.defaultPaymentMethodId;
      const hasCustomer = !!data.stripeCustomerId;
      if (!hasPaymentMethod || !hasCustomer) return null;

      return {
        defaultPaymentMethodId: data.defaultPaymentMethodId,
        stripeCustomerId: data.stripeCustomerId,
      };
    } catch (error) {
      console.error('PurchaseService getPaymentCustomer Error:', error);
      return null;
    }
  }
}

export function createPurchaseService(client: HttpClient): PurchaseService {
  return new PurchaseServiceImpl(client);
}

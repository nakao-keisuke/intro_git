import { getServerSession } from 'next-auth';
import {
  type CheckRegisterEmailStatusForUtageWebResponseData,
  checkRegisterEmailStatusForUtageWebRequest,
} from '@/apis/check-register-email-status-for-utage-web';
import {
  type CreditPurchaseCourseInfo,
  getCreditPurchaseCourseInfoRequest,
} from '@/apis/get-credit-purchase-course-info';
import {
  type GetPhoneVerificationStatusResponseData,
  getPhoneVerificationStatusRequest,
} from '@/apis/get-phone-verification-status';
import {
  type AddPwaInstallBonusResponseData,
  addPwaInstallBonusRequest,
} from '@/apis/get-pwa-bonus';
import {
  type GetUserInfoResponseData,
  getUserInfoRequest,
} from '@/apis/get-user-inf';
import {
  type HasReceivedPwaRegisterBonusResponseData,
  hasReceivedPwaRegisterBonusRequest,
} from '@/apis/has-received-pwa-register-bonus';
import {
  type IsNotOrganicCmCodeResponseData,
  isNotOrganicCmCodeRequest,
} from '@/apis/is-not-organic-cm-code';
import type { HttpClient } from '@/libs/http/HttpClient';
import type { APIResponse } from '@/libs/http/type';
import type { NewsDataResponse } from './type';

export interface NewsService {
  getInitialData: () => Promise<NewsDataResponse>;
}

export class ServerNewsService implements NewsService {
  private readonly apiUrl: string = import.meta.env.API_URL!;

  constructor(private readonly client: HttpClient) {}

  async getInitialData(): Promise<NewsDataResponse> {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;

    const createDefaultResponse = (token: string = ''): NewsDataResponse => ({
      isFirstBonusCourseExist: false,
      isSecondBonusCourseExist: false,
      isThirdBonusCourseExist: false,
      isFourthBonusCourseExist: false,
      isFifthBonusCourseExist: false,
      isPaidySplitBannerExist: false,
      isUtage: false,
      token,
    });

    if (!token) {
      return createDefaultResponse('');
    }

    try {
      const creditRequest = getCreditPurchaseCourseInfoRequest(token);
      const checkRegisteredEmailStatusRequest =
        checkRegisterEmailStatusForUtageWebRequest(token);
      const hasReceivedPwaBonusRequest =
        hasReceivedPwaRegisterBonusRequest(token);
      const addPwaBonusRequest = addPwaInstallBonusRequest(token);
      const userRequest = getUserInfoRequest(token);
      const getPhoneStatusRequest = getPhoneVerificationStatusRequest(token);
      const cmCodeRequest = isNotOrganicCmCodeRequest(token);

      const [
        bonusResponse,
        _checkRegisteredEmailStatusResponse,
        _hasReceivedPwaBonusResponse,
        _addPwaBonusResponse,
        userResponse,
        _getPhoneStatusResponse,
        cmCodeResponse,
      ] = await Promise.all([
        this.client
          .post<APIResponse<CreditPurchaseCourseInfo>>(
            this.apiUrl,
            creditRequest,
          )
          .catch((): APIResponse<CreditPurchaseCourseInfo> => ({ code: -1 })),
        this.client
          .post<APIResponse<CheckRegisterEmailStatusForUtageWebResponseData>>(
            this.apiUrl,
            checkRegisteredEmailStatusRequest,
          )
          .catch(
            (): APIResponse<CheckRegisterEmailStatusForUtageWebResponseData> => ({
              code: -1,
            }),
          ),
        this.client
          .post<APIResponse<HasReceivedPwaRegisterBonusResponseData>>(
            this.apiUrl,
            hasReceivedPwaBonusRequest,
          )
          .catch(
            (): APIResponse<HasReceivedPwaRegisterBonusResponseData> => ({
              code: -1,
            }),
          ),
        this.client
          .post<APIResponse<AddPwaInstallBonusResponseData>>(
            this.apiUrl,
            addPwaBonusRequest,
          )
          .catch(
            (): APIResponse<AddPwaInstallBonusResponseData> => ({ code: -1 }),
          ),
        this.client
          .post<APIResponse<GetUserInfoResponseData>>(this.apiUrl, userRequest)
          .catch((): APIResponse<GetUserInfoResponseData> => ({ code: -1 })),
        this.client
          .post<APIResponse<GetPhoneVerificationStatusResponseData>>(
            this.apiUrl,
            getPhoneStatusRequest,
          )
          .catch(
            (): APIResponse<GetPhoneVerificationStatusResponseData> => ({
              code: -1,
            }),
          ),
        this.client
          .post<APIResponse<IsNotOrganicCmCodeResponseData>>(
            this.apiUrl,
            cmCodeRequest,
          )
          .catch(
            (): APIResponse<IsNotOrganicCmCodeResponseData> => ({ code: -1 }),
          ),
      ]);

      const bonusData =
        bonusResponse.code === 0 ? bonusResponse.data : undefined;
      const cmCodeData =
        cmCodeResponse.code === 0 ? cmCodeResponse.data : undefined;

      const getIsNotOrganicCmCode = (
        data: IsNotOrganicCmCodeResponseData | undefined,
      ): boolean => {
        if (!data || typeof data !== 'object') return false;
        return Boolean(data.is_not_organic_cm_code);
      };

      const getApplicationId = (
        data: GetUserInfoResponseData | undefined,
      ): string | undefined => {
        if (!data || typeof data !== 'object') return undefined;
        return (data as any).applicationId ?? data.application_id;
      };

      const isNotOrganicCmCode = getIsNotOrganicCmCode(cmCodeData);
      const isPaidySplitBannerExist = isNotOrganicCmCode === true;
      const applicationId = getApplicationId(userResponse.data);

      return {
        isFirstBonusCourseExist: !!bonusData?.canBuyFirstBonusCourse,
        isSecondBonusCourseExist: !!bonusData?.canBuySecondBonusCourse,
        isThirdBonusCourseExist: !!bonusData?.canBuyThirdBonusCourse,
        isFourthBonusCourseExist: !!bonusData?.canBuyFourthBonusCourse,
        isFifthBonusCourseExist: !!bonusData?.canBuyFifthBonusCourse,
        isPaidySplitBannerExist,
        isUtage: applicationId === '15',
        token,
      };
    } catch (_error) {
      return createDefaultResponse(token);
    }
  }
}

export function createNewsService(client: HttpClient): NewsService {
  return new ServerNewsService(client);
}

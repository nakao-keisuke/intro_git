import { getServerSession } from 'next-auth';
import { getSession } from 'next-auth/react';
import { getCreditPurchaseCourseInfoRequest } from '@/apis/get-credit-purchase-course-info';
import {
  type FooterPrintResponseData,
  getFooterPrintHistoryRequest,
} from '@/apis/get-foot-print-list';
import { getUserInfoRequest } from '@/apis/get-user-inf';
import {
  type IsNotOrganicCmCodeResponseData,
  isNotOrganicCmCodeRequest,
} from '@/apis/is-not-organic-cm-code';
import {
  isAllMissionCompleted as checkMissionCompleted,
  type OnboardingMissionResponseData,
  onboardingMissionRequest,
} from '@/apis/onboarding-mission';
import type { FootprintListResponse } from '@/app/api/footprint/list/route';
import {
  GET_CREDIT_PURCHASE_COURSE_INFO,
  GET_USER_INFO,
  HTTP_GET_FOOT_PRINT_LIST,
  HTTP_GET_UTAGE_ONBOARDING_MISSION_PROGRESS,
} from '@/constants/endpoints';
import type { FootprintListUserInfo } from '@/features/footprint-list/index.hook';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
import { isPWA } from '@/libs/isPWA';
import type { Banner } from '@/types/Banner';
import type { ResponseData } from '@/types/NextApi';
import {
  isBonusAvailable,
  profileIndexOfAbout,
  profileIndexOfAge,
  profileIndexOfAvatar,
  profileIndexOfBodytype,
  profileIndexOfHobby,
} from '@/utils/bonusAvailable';
import type { User } from '../shared/type';
import type { CreditPurchaseCourse, MyPageInitialData } from './type';

export interface MyPageService {
  getInitialData: () => Promise<MyPageInitialData>;
}

export class ServerMyPageService implements MyPageService {
  private readonly apiUrl = import.meta.env.API_URL ?? '';

  constructor(private readonly client: HttpClient) {}

  async getInitialData(): Promise<MyPageInitialData> {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const token = session?.user.token;

    if (!token) {
      throw new Error('Unauthorized');
    }

    const userRequest = getUserInfoRequest(token);
    const creditRequest = getCreditPurchaseCourseInfoRequest(token);
    const footprintRequest = getFooterPrintHistoryRequest(token);
    const isNotOrganicCmCodeReq = isNotOrganicCmCodeRequest(token);
    const onboardingMissionReq = onboardingMissionRequest(token, false);

    const [userRes, creditRes, footprintRes, organicRes, onboardingMissionRes] =
      await Promise.all([
        this.client.post<APIResponse<User>>(this.apiUrl, userRequest, {
          cache: 'no-store',
        }),
        this.client.post<APIResponse<CreditPurchaseCourse>>(
          this.apiUrl,
          creditRequest,
        ),
        this.client.post<APIResponse<FooterPrintResponseData[]>>(
          this.apiUrl,
          footprintRequest,
        ),
        this.client.post<APIResponse<IsNotOrganicCmCodeResponseData>>(
          this.apiUrl,
          isNotOrganicCmCodeReq,
        ),
        this.client.post<APIResponse<OnboardingMissionResponseData>>(
          this.apiUrl,
          onboardingMissionReq,
        ),
      ]);

    const userData = userRes.data;
    const bonusData = creditRes.data;
    const footprintData = footprintRes.data;
    const _organicData = organicRes.data;
    const onboardingMissionData = onboardingMissionRes.data;

    if (!userData) {
      throw new Error('Failed to fetch user data');
    }

    const bonusFlag = userData.bonusFlag;
    const isAboutBonusAvailable = isBonusAvailable(
      bonusFlag ?? 0,
      profileIndexOfAbout,
    );
    const isAvatarBonusAvailable = isBonusAvailable(
      bonusFlag ?? 0,
      profileIndexOfAvatar,
    );
    const isAgeBonusAvailable = isBonusAvailable(
      bonusFlag ?? 0,
      profileIndexOfAge,
    );
    const isHobbyBonusAvailable = isBonusAvailable(
      bonusFlag ?? 0,
      profileIndexOfHobby,
    );
    const isBodytypeBonusAvailable = isBonusAvailable(
      bonusFlag ?? 0,
      profileIndexOfBodytype,
    );

    const bannerList: Banner[] = [];

    if (bonusData?.canBuyFirstBonusCourse) {
      bannerList.push({ id: 'purchasezeroth', path: '/purchase' });
    } else if (bonusData?.canBuySecondBonusCourse) {
      bannerList.push({ id: 'purchasefirst', path: '/purchase' });
    } else if (bonusData?.canBuyThirdBonusCourse) {
      bannerList.push({ id: 'purchasesecond', path: '/purchase' });
    } else if (bonusData?.canBuyFourthBonusCourse) {
      bannerList.push({ id: 'purchasethird', path: '/purchase' });
    } else if (bonusData?.canBuyFifthBonusCourse) {
      bannerList.push({ id: 'purchasefourth', path: '/purchase' });
    }

    const homeAppPath =
      userData.applicationId === '15' ? '/setting/iphone' : '/setting/android';

    bannerList.push(
      { id: 'dailybonusfooter' as const, path: '/premium-dailybonus' as const },
      { id: 'fleamarketfooter' as const, path: '/lp/flea-market' as const },
      {
        id: 'lovenseroulettefooter' as const,
        path: '/lovense_roulette' as const,
      },
      { id: 'lovensevideofooter' as const, path: '/lovense' as const },
      { id: 'paidyfooter' as const, path: '/purchase' as const },
      {
        id: 'homeAppFooter' as const,
        path: homeAppPath as '/setting/iphone' | '/setting/android',
      },
    );

    const isOnboardingMissionCompleted =
      onboardingMissionRes.code === 0 && onboardingMissionData
        ? checkMissionCompleted(onboardingMissionData)
        : false;

    const shouldShowOnboardingBanner = !isOnboardingMissionCompleted;

    if (shouldShowOnboardingBanner) {
      bannerList.push({
        id: 'onboardingnewfooter' as const,
        path: '/onboarding' as const,
      });
    }

    const checkTimeList =
      footprintData?.map((data: FooterPrintResponseData) => data.chk_time) ??
      [];

    return {
      myUserInfo: {
        userId: userData.userId,
        userName: userData.userName,
        avatarId: userData.avaId,
        age: userData.age,
        point: userData.point,
      },
      isRegisteredEmail: !!userData.email?.includes('@'),
      voiceCallWaiting: userData.voiceCallWaiting,
      videoCallWaiting: userData.videoCallWaiting,
      isAboutBonusAvailable,
      isAvatarBonusAvailable,
      isAgeBonusAvailable,
      isHobbyBonusAvailable,
      isBodytypeBonusAvailable,
      bannerList,
      checkTimeList,
      isFirstBonusCourseExist: !!bonusData?.canBuyFirstBonusCourse,
      isSecondBonusCourseExist: !!bonusData?.canBuySecondBonusCourse,
      isThirdBonusCourseExist: !!bonusData?.canBuyThirdBonusCourse,
      isFourthBonusCourseExist: !!bonusData?.canBuyFourthBonusCourse,
      isFifthBonusCourseExist: !!bonusData?.canBuyFifthBonusCourse,
      userDetail: userData,
      isOnboardingMissionCompleted,
      ...(userData.gclid && { gclid: userData.gclid }),
      ...(userData.ga4ClientId && { googleClientId: userData.ga4ClientId }),
    };
  }
}

export class ClientMyPageService implements MyPageService {
  constructor(private readonly client: HttpClient) {}

  async getInitialData(): Promise<MyPageInitialData> {
    const session = await getSession();
    if (!session) {
      throw new Error('Unauthorized');
    }

    const [userInfoRes, creditInfoRes, footprintRes, onboardingMissionRes] =
      await Promise.all([
        this.client.post<APIResponse<User>>(GET_USER_INFO, {}),
        this.client.post<APIResponse<CreditPurchaseCourse>>(
          GET_CREDIT_PURCHASE_COURSE_INFO,
          {},
        ),
        this.client.post<APIResponse<FootprintListResponse>>(
          HTTP_GET_FOOT_PRINT_LIST,
          {},
        ),
        this.client.post<ResponseData<OnboardingMissionResponseData>>(
          HTTP_GET_UTAGE_ONBOARDING_MISSION_PROGRESS,
          {
            isPwa: isPWA(),
          },
        ),
      ]);

    if (userInfoRes.code) {
      throw new Error('ユーザー情報の取得に失敗しました');
    }

    if (creditInfoRes.code) {
      throw new Error('クレジット情報の取得に失敗しました');
    }

    if (footprintRes.code) {
      throw new Error('足跡情報の取得に失敗しました');
    }

    const userData = userInfoRes.data;
    const bonusData = creditInfoRes.data;
    const footprintData = footprintRes.data;
    const onboardingMissionData =
      onboardingMissionRes.type === 'error'
        ? null
        : (onboardingMissionRes as OnboardingMissionResponseData);

    if (!userData || !bonusData || !footprintData) {
      throw new Error('必要なデータの取得に失敗しました');
    }

    const bonusFlag = userData.bonusFlag ?? 0;
    const isAboutBonusAvailable = isBonusAvailable(
      bonusFlag,
      profileIndexOfAbout,
    );
    const isAvatarBonusAvailable = isBonusAvailable(
      bonusFlag,
      profileIndexOfAvatar,
    );
    const isAgeBonusAvailable = isBonusAvailable(bonusFlag, profileIndexOfAge);
    const isHobbyBonusAvailable = isBonusAvailable(
      bonusFlag,
      profileIndexOfHobby,
    );
    const isBodytypeBonusAvailable = isBonusAvailable(
      bonusFlag,
      profileIndexOfBodytype,
    );

    const bannerList: Banner[] = [];

    if (bonusData?.canBuyFirstBonusCourse) {
      bannerList.push({ id: 'purchasezeroth', path: '/purchase' });
    } else if (bonusData?.canBuySecondBonusCourse) {
      bannerList.push({ id: 'purchasefirst', path: '/purchase' });
    } else if (bonusData?.canBuyThirdBonusCourse) {
      bannerList.push({ id: 'purchasesecond', path: '/purchase' });
    } else if (bonusData?.canBuyFourthBonusCourse) {
      bannerList.push({ id: 'purchasethird', path: '/purchase' });
    } else if (bonusData?.canBuyFifthBonusCourse) {
      bannerList.push({ id: 'purchasefourth', path: '/purchase' });
    }

    bannerList.push({
      id: 'fleamarketfooter' as const,
      path: '/lp/flea-market' as const,
    });

    const homeAppPath =
      userData.applicationId === '15' ? '/setting/iphone' : '/setting/android';

    bannerList.push(
      { id: 'dailybonusfooter' as const, path: '/premium-dailybonus' as const },
      {
        id: 'lovenseroulettefooter' as const,
        path: '/lovense_roulette' as const,
      },
      { id: 'lovensevideofooter' as const, path: '/lovense' as const },
      { id: 'paidyfooter' as const, path: '/purchase' as const },
      {
        id: 'homeAppFooter' as const,
        path: homeAppPath as '/setting/iphone' | '/setting/android',
      },
    );

    const isOnboardingMissionCompleted = onboardingMissionData
      ? checkMissionCompleted(onboardingMissionData)
      : false;

    const shouldShowOnboardingBanner = !isOnboardingMissionCompleted;

    if (shouldShowOnboardingBanner) {
      bannerList.push({
        id: 'onboardingnewfooter' as const,
        path: '/onboarding' as const,
      });
    }

    const checkTimeList =
      footprintData.list?.map(
        (data: FootprintListUserInfo) => data.checkTime,
      ) ?? [];

    return {
      myUserInfo: {
        userId: userData.userId,
        userName: userData.userName,
        avatarId: userData.avaId,
        age: userData.age,
        point: userData.point,
      },
      isRegisteredEmail: !!userData.email?.includes('@'),
      voiceCallWaiting: userData.voiceCallWaiting,
      videoCallWaiting: userData.videoCallWaiting,
      isAboutBonusAvailable,
      isAvatarBonusAvailable,
      isAgeBonusAvailable,
      isHobbyBonusAvailable,
      isBodytypeBonusAvailable,
      bannerList,
      checkTimeList,
      isFirstBonusCourseExist: !!bonusData?.canBuyFirstBonusCourse,
      isSecondBonusCourseExist: !!bonusData?.canBuySecondBonusCourse,
      isThirdBonusCourseExist: !!bonusData?.canBuyThirdBonusCourse,
      isFourthBonusCourseExist: !!bonusData?.canBuyFourthBonusCourse,
      isFifthBonusCourseExist: !!bonusData?.canBuyFifthBonusCourse,
      userDetail: userData,
      isOnboardingMissionCompleted,
      ...(userData.gclid && { gclid: userData.gclid }),
      ...(userData.ga4ClientId && { googleClientId: userData.ga4ClientId }),
    };
  }
}

export function createMyPageService(client: HttpClient): MyPageService {
  if (client.getContext() === Context.SERVER) {
    return new ServerMyPageService(client);
  } else {
    return new ClientMyPageService(client);
  }
}

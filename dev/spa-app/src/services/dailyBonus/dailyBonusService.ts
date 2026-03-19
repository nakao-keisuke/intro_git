import { getServerSession } from 'next-auth';
import {
  type CreditPurchaseCourseInfo,
  getCreditPurchaseCourseInfoRequest,
} from '@/apis/get-credit-purchase-course-info';
import {
  type GetUtageWebPointInfoResponseData,
  getUtageWebPointInfoRequest,
} from '@/apis/get-utage-web-point-info';
import {
  type UtageWebDailyBonusResponseData,
  utageWebDailyBonusRequest,
} from '@/apis/utage-web-daily-bonus';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
import type { DailyBonusResponse } from './type';

// APIレスポンスの実際の構造に対応する型定義
interface DailyBonusApiResponse {
  code?: number;
  data?: {
    addPoint?: number;
    doubleDailyBonusDays?: number; // キャメルケースに修正
    doubleBonusLimitDate?: string; // キャメルケースに修正
    // 後方互換性のためスネークケースも残す
    double_daily_bonus_days?: number;
    double_bonus_limit_date?: string;
  };
  add_point?: number;
  double_daily_bonus_days?: number;
  double_bonus_limit_date?: string;
}

// API URLは環境変数から取得
const API_URL = import.meta.env.API_URL || '';

export interface DailyBonusService {
  getInitialData: () => Promise<DailyBonusResponse>;
}

export class ServerDailyBonusService implements DailyBonusService {
  constructor(private readonly client: HttpClient) {}

  async getInitialData(): Promise<DailyBonusResponse> {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;

    if (!token) {
      throw new Error('Authentication required');
    }

    const request = utageWebDailyBonusRequest(token);
    const pointInfoRequest = getUtageWebPointInfoRequest(token);
    const creditRequest = getCreditPurchaseCourseInfoRequest(token);

    const [dailyBonusResponse, creditResponse, pointResponse] =
      await Promise.all([
        this.client.post<UtageWebDailyBonusResponseData>(API_URL, request),
        this.client.post<APIResponse<CreditPurchaseCourseInfo>>(
          API_URL,
          creditRequest,
        ),
        this.client.post<APIResponse<GetUtageWebPointInfoResponseData>>(
          API_URL,
          pointInfoRequest,
        ),
      ]);

    // レスポンスから実際のデータを抽出
    const dailyBonusData = dailyBonusResponse;
    const creditData = creditResponse.data;
    const pointData = pointResponse.data;
    type PointInfoResponse = GetUtageWebPointInfoResponseData & {
      isPurchased?: boolean;
    };
    const normalizedPointData = pointData as PointInfoResponse | undefined;

    // APIレスポンスの実際の構造に合わせて値を取得
    // レスポンスは { code: 0, data: { addPoint: 10 } } の形式
    const typedDailyBonusData = dailyBonusData as DailyBonusApiResponse;
    const actualAddPoint =
      typedDailyBonusData?.data?.addPoint ||
      typedDailyBonusData?.add_point ||
      0;

    // double_daily_bonus_daysとdouble_bonus_limit_dateの取得
    // ネスト構造（data.xxx）とルートレベル（xxx）の両方に対応
    const typedDailyBonusForDoubleBonus =
      dailyBonusData as DailyBonusApiResponse;
    const actualDoubleDailyBonusDays =
      typedDailyBonusForDoubleBonus?.data?.doubleDailyBonusDays ||
      typedDailyBonusForDoubleBonus?.data?.double_daily_bonus_days ||
      typedDailyBonusForDoubleBonus?.double_daily_bonus_days;
    const actualDoubleBonusLimitDate =
      typedDailyBonusForDoubleBonus?.data?.doubleBonusLimitDate ||
      typedDailyBonusForDoubleBonus?.data?.double_bonus_limit_date ||
      typedDailyBonusForDoubleBonus?.double_bonus_limit_date;
    const doubleDailyBonusData =
      actualDoubleDailyBonusDays && actualDoubleBonusLimitDate
        ? {
            doubleDailyBonusCount: actualDoubleDailyBonusDays,
            doubleDailyBonusLimitTime: actualDoubleBonusLimitDate,
          }
        : {};

    return {
      data: {
        isAddPoint: !!(actualAddPoint && actualAddPoint > 0),
        addPoint: actualAddPoint,
        isFirstBonusCourseExist: !!creditData?.canBuyFirstBonusCourse,
        isSecondBonusCourseExist: !!creditData?.canBuySecondBonusCourse,
        isThirdBonusCourseExist: !!creditData?.canBuyThirdBonusCourse,
        isFourthBonusCourseExist: !!creditData?.canBuyFourthBonusCourse,
        isFifthBonusCourseExist: !!creditData?.canBuyFifthBonusCourse,
        isPurchased: !!(
          normalizedPointData?.isPurchased ?? normalizedPointData?.is_purchased
        ),
        consumedPoint: normalizedPointData?.point || 0,
        shouldShowConfetti: !!(actualAddPoint && actualAddPoint > 0),
        ...doubleDailyBonusData,
        token,
      },
    };
  }
}

export class ClientDailyBonusService implements DailyBonusService {
  constructor(readonly _client: HttpClient) {}

  async getInitialData(): Promise<DailyBonusResponse> {
    throw new Error('Client-side getInitialData is not implemented');
  }
}

export function createDailyBonusService(client: HttpClient): DailyBonusService {
  if (client.getContext() === Context.SERVER) {
    return new ServerDailyBonusService(client);
  } else {
    return new ClientDailyBonusService(client);
  }
}

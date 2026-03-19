import {
  type GetCategoryRankingResponseData,
  getCategoryTwoShotRankingRequest,
} from '@/apis/get-category-ranking';
import {
  type CreditPurchaseCourseInfo,
  type GetCreditPurchaseCourseResponseData,
  getCreditPurchaseCourseInfoRequest,
} from '@/apis/get-credit-purchase-course-info';
import {
  type GetUtageWebBoardMessageResponseData,
  getUtageWebBoardMessageRequest,
} from '@/apis/get-utage-web-board-message';
import {
  convertToBroadcasterInfo,
  createGetActiveLiveRecordingRequest,
  createGetBroadcasterInfoRequest,
  type GetActiveLiveRecordingResponseData,
  type GetActiveLiveRecordingRouteData,
  type GetBroadcasterInfoResponseData,
} from '@/apis/http/liveRecording';
import {
  createMeetPeopleMoreClientRequest,
  type MeetPeopleMoreRouteResponse,
} from '@/apis/http/meetPeopleMore';
import {
  createRecentVideoCallUsersMoreClientRequest,
  type RecentVideoCallUsersMoreRouteResponse,
} from '@/apis/http/recentVideoCallUsersMore';
import {
  isAllMissionCompleted,
  type OnboardingMissionResponseData,
  onboardingMissionRequest,
} from '@/apis/onboarding-mission';
import {
  loginMeetPeopleRequest,
  type MeetPeopleResponseData,
} from '@/apis/utage-web-get-meet-people-exclude-video-call-channeler';
import type { QuickFilterType } from '@/app/[locale]/(tab-layout)/girls/all/constants/filterTypes';
import {
  APPLICATION_ID,
  getApplicationId,
  isNativeApplication,
} from '@/constants/applicationId';
import {
  GET_CREDIT_PURCHASE_COURSE_INFO,
  GET_LIVE_USERS,
  HTTP_GET_ACTIVE_LIVE_RECORDING,
  HTTP_GET_MY_USER_INFO,
  HTTP_GET_UTAGE_ONBOARDING_MISSION_PROGRESS,
  HTTP_MORE_MEET_PEOPLE_USERS,
  HTTP_MORE_RECENT_VIDEO_CALL_USERS,
} from '@/constants/endpoints';
import {
  DEFAULT_AVATAR_FLAG,
  DEFAULT_SHOWING_FACE,
  DEFAULT_SORT_TYPE,
  FLEA_MARKET_USERS_CACHE_DURATION,
  FLEA_MARKET_USERS_LIMIT,
  INSTANT_CALL_DATA_CACHE_DURATION,
  MATURE_FILTER_LOWER_AGE,
  MEET_PEOPLE_CACHE_DURATION,
  MEET_PEOPLE_INITIAL_LIMIT,
  RANKING_CACHE_DURATION,
  RECENT_VIDEO_CALL_USERS_CACHE_DURATION,
  RECENT_VIDEO_CALL_USERS_LIMIT,
} from '@/constants/homeCache';
import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import { MISSION_IDS } from '@/constants/missionIds';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
import { processRankingData } from '@/services/ranking/rankingData';
import type {
  InstantCallItem,
  RankedMeetPerson,
  RawRankingUser,
} from '@/services/ranking/type';
import type { ResponseData } from '@/types/NextApi';
import {
  extractInstantCallBoardList,
  extractInstantCallMeetPeopleList,
} from '@/utils/instantCallUtil';
import { region } from '@/utils/region';
import type { LiveChannels, MeetPeople } from '../shared/type';
import type {
  Banner,
  BannersWithCreditInfo,
  HomeData,
  InstantCallData,
  LiveUsersRequest,
  MeetPeopleRequest,
  MyUserInfoExtended,
  RecentVideoCallUser,
  RecentVideoCallUsersRequest,
} from './type';

export interface HomeService {
  getInitialData: (filterType?: QuickFilterType) => Promise<HomeData>;
  getLiveChannels: (token: string) => Promise<LiveChannels>;
  getRecentVideoCallUsers?: (
    applicationId: string,
  ) => Promise<RecentVideoCallUser[]>;
  getBanners?: (
    isPwa: boolean,
    token: string,
  ) => Promise<BannersWithCreditInfo>;
  getMoreMeetPeopleUsers?: (
    lastLoginTime: string | null,
  ) => Promise<MeetPeople[]>;
  getMyUserInfo?: (token: string) => Promise<MyUserInfoExtended>;
  getInstantCallData?: (token: string) => Promise<InstantCallData>;
  getCreditPurchaseCourseInfo?: (
    token: string,
  ) => Promise<CreditPurchaseCourseInfo>;
  getActiveLiveRecording?: (
    token: string,
  ) => Promise<GetActiveLiveRecordingRouteData | null>;
  getDailyTwoShotRankingRaw?: () => Promise<GetCategoryRankingResponseData[]>;
  getMeetPeopleUsers?: (filterType?: QuickFilterType) => Promise<MeetPeople[]>;
  getNewUsersExcludingSameRegion?: (token?: string) => Promise<MeetPeople[]>;
  getFleaMarketUsers?: () => Promise<MeetPeople[]>;
}

export class ServerHomeService implements HomeService {
  private readonly apiUrl: string = import.meta.env.API_URL || '';
  constructor(private readonly client: HttpClient) {}

  // 初回データ取得
  async getInitialData(
    _filterType: QuickFilterType = 'all',
  ): Promise<HomeData> {
    // この処理はISR処理で呼ばれるためローカルビルド時はAPI_URLが空になる
    if (this.apiUrl === '') {
      return {
        recentVideoCallUsers: [],
        videoCallRankingUsers: [],
      };
    }

    const [recentVideoCallUsers, videoCallRankingUsers] = await Promise.all([
      this.getRecentVideoCallUsers(APPLICATION_ID.WEB), // applicationId: 15固定（WEB版、tokenなしでリクエスト可能）
      this.getDailyTwoShotRanking(),
    ]);

    return {
      recentVideoCallUsers,
      videoCallRankingUsers,
    };
  }

  /**
   * 探す画面ユーザー一覧の取得（公開メソッド）
   * 認証不要 - Data Cache最適化
   * @param filterType フィルタータイプ（all, new, busty, mature）
   * @returns 探す画面ユーザー一覧
   */
  async getMeetPeopleUsers(
    filterType: QuickFilterType = 'all',
  ): Promise<MeetPeople[]> {
    return this.getMeetPeople(filterType);
  }

  /**
   * 新人ユーザー一覧の取得（同じ地域のユーザーを除外）
   * 認証時：ログインユーザーと同じ地域のユーザーを除外
   * 未認証時：フィルタリングなし
   * @param token ユーザートークン（オプション）
   * @returns 新人ユーザー一覧
   */
  async getNewUsersExcludingSameRegion(token?: string): Promise<MeetPeople[]> {
    // 新人ユーザーとユーザー情報を並列取得（逐次→並列で50-100ms短縮）
    const [newUsersResult, userInfoResult] = await Promise.all([
      this.getMeetPeople('new'),
      token
        ? this.getMyUserInfo(token).catch((error) => {
            console.error('Failed to get user info for filtering:', error);
            return null;
          })
        : Promise.resolve(null),
    ]);

    let newUsers = newUsersResult;

    // 認証時：同じ地域のユーザーを除外
    if (userInfoResult) {
      const userRegion = userInfoResult.region;

      // 地域情報が存在する場合、同じ地域のユーザーを除外
      if (userRegion && userRegion !== '未設定') {
        const { getRegionGroupName, getRegionPrefectureNumbers } = await import(
          '@/utils/region'
        );
        const regionGroupName = getRegionGroupName(userRegion);

        if (regionGroupName) {
          const regionNumbers = getRegionPrefectureNumbers(regionGroupName);
          newUsers = newUsers.filter(
            (user) => !regionNumbers.includes(user.region),
          );
        }
      }
    }

    return newUsers;
  }

  /**
   * フリマ出品中ユーザー一覧の取得
   * 認証不要 - unstable_cacheによるData Cache最適化
   * @returns フリマ出品中ユーザー一覧
   */
  async getFleaMarketUsers(): Promise<MeetPeople[]> {
    if (this.apiUrl === '') {
      return [];
    }

    const { unstable_cache: nextCache } = await import('next/cache');

    const fetchFleaMarketUsersRaw = async (): Promise<MeetPeople[]> => {
      const request: MeetPeopleRequest = {
        api: JAMBO_API_ROUTE.MEET_PEOPLE,
        limit: FLEA_MARKET_USERS_LIMIT,
        sort_type: DEFAULT_SORT_TYPE,
        default_avatar_flag: DEFAULT_AVATAR_FLAG,
        is_flea_market_on_sale: true,
      };

      const { code, data } = await this.client.post<APIResponse<MeetPeople[]>>(
        this.apiUrl,
        request,
      );

      if (code !== 0 || !data) {
        console.error('フリマ出品中ユーザー一覧の取得に失敗しました');
        return [];
      }

      return data;
    };

    const getCached = nextCache(
      fetchFleaMarketUsersRaw,
      ['flea_market_users'],
      {
        revalidate: FLEA_MARKET_USERS_CACHE_DURATION,
        tags: ['flea_market_users'],
      },
    );

    return getCached();
  }

  /**
   * 初回探す画面ユーザー一覧の取得（内部メソッド）
   * 認証不要 - tokenなしでもAPIは呼べるため、unstable_cacheで全ユーザー共通キャッシュ
   * @returns 探す画面ユーザー一覧
   */
  private async getMeetPeople(
    filterType: QuickFilterType = 'all',
  ): Promise<MeetPeople[]> {
    if (this.apiUrl === '') {
      return [];
    }

    const { unstable_cache: nextCache } = await import('next/cache');

    const apiUrl = this.apiUrl;
    const client = this.client;

    const fetchMeetPeopleRaw = async (): Promise<MeetPeople[]> => {
      // tokenなしでリクエスト（認証不要API、全ユーザー共通のキャッシュを実現）
      const request: MeetPeopleRequest = {
        api: JAMBO_API_ROUTE.MEET_PEOPLE,
        limit: MEET_PEOPLE_INITIAL_LIMIT,
        showing_face: DEFAULT_SHOWING_FACE,
        sort_type: DEFAULT_SORT_TYPE,
        default_avatar_flag: DEFAULT_AVATAR_FLAG,
      };

      // フィルタータイプに応じてパラメータを設定
      switch (filterType) {
        case 'new':
          request.is_new = true;
          delete request.showing_face; // 検索結果と同じく顔出し条件を外す
          break;
        case 'busty':
          request.is_big_breasts = true;
          break;
        case 'mature':
          request.lower_age = MATURE_FILTER_LOWER_AGE;
          break;
        default:
          // フィルターなし
          break;
      }

      const { code, data } = await client.post<APIResponse<MeetPeople[]>>(
        apiUrl,
        request,
      );

      if (code !== 0 || !data) {
        console.error('ユーザー一覧の取得に失敗しました');
        return [];
      }

      return data;
    };

    const getCached = nextCache(
      fetchMeetPeopleRaw,
      ['meet_people_users', filterType],
      {
        revalidate: MEET_PEOPLE_CACHE_DURATION,
        tags: ['meet_people_users'],
      },
    );

    return getCached();
  }

  async getLiveChannels(token: string): Promise<LiveChannels> {
    const request: LiveUsersRequest = {
      api: JAMBO_API_ROUTE.LIVE_USERS,
      token,
      call_type: 'live', // 探す画面配信待機中ユーザーはcall_typeをliveで固定
    };

    const { code, data } = await this.client.post<APIResponse<LiveChannels>>(
      this.apiUrl,
      request,
    );

    if (code !== 0 || !data)
      throw new Error('配信ユーザー一覧の取得に失敗しました');

    return data;
  }

  private getJstDayKey(): string {
    const now = new Date();
    const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const yyyy = jst.getUTCFullYear();
    const mm = String(jst.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(jst.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // ビデオ通話ランキング（日次キャッシュ、JST日付毎）
  private async getDailyTwoShotRanking(): Promise<RankedMeetPerson[]> {
    const { unstable_cache: nextCache } = await import('next/cache');

    const fetchTwoShotRankingRaw = async (): Promise<RankedMeetPerson[]> => {
      const request = getCategoryTwoShotRankingRequest(); // 無認証
      const { code, data } = await this.client.post<
        APIResponse<GetCategoryRankingResponseData[]>
      >(this.apiUrl, request);
      if (code !== 0 || !data) {
        return [];
      }
      const isCallWaiting = (_userId: string) => false; // 初期表示ではBOARD未マージ
      return processRankingData(
        (data || []) as unknown as RawRankingUser[],
        isCallWaiting,
      );
    };

    const jstKey = this.getJstDayKey();
    const getCached = nextCache(fetchTwoShotRankingRaw, ['rankings', jstKey], {
      revalidate: RANKING_CACHE_DURATION,
      tags: ['rankings'],
    });
    return getCached();
  }

  // ビデオ通話ランキング（生データ、Progressive Enhancement用）
  // 認証不要 - Data Cache最適化
  async getDailyTwoShotRankingRaw(): Promise<GetCategoryRankingResponseData[]> {
    if (this.apiUrl === '') {
      return [];
    }

    const { unstable_cache: nextCache } = await import('next/cache');

    const fetchRankingRaw = async (): Promise<
      GetCategoryRankingResponseData[]
    > => {
      const request = getCategoryTwoShotRankingRequest(); // tokenなし
      const { code, data } = await this.client.post<
        APIResponse<GetCategoryRankingResponseData[]>
      >(this.apiUrl, request);
      if (code !== 0 || !data) {
        return [];
      }
      return data;
    };

    const jstKey = this.getJstDayKey();
    const getCached = nextCache(fetchRankingRaw, ['rankings_raw', jstKey], {
      revalidate: RANKING_CACHE_DURATION,
      tags: ['rankings_raw'],
    });
    return getCached();
  }

  // 今すぐビデオ通話ができるユーザー（RECENT_VIDEO_CALL_USERS）
  // 無認証・短期キャッシュ（60〜180秒）で取得
  // 認証不要 - Data Cache最適化（applicationIdを使用）
  async getRecentVideoCallUsers(
    applicationId: string,
  ): Promise<RecentVideoCallUser[]> {
    if (this.apiUrl === '') {
      return [];
    }
    const { unstable_cache: nextCache } = await import('next/cache');

    const fetchRecentVideoCallUsersRaw = async () => {
      const request: RecentVideoCallUsersRequest = {
        api: JAMBO_API_ROUTE.RECENT_VIDEO_CALL_USERS,
        application_id: applicationId,
        limit: RECENT_VIDEO_CALL_USERS_LIMIT,
      };

      const { code, data } = await this.client.post<
        APIResponse<RecentVideoCallUser[]>
      >(this.apiUrl, request);

      if (code !== 0 || !data) {
        console.error('今すぐビデオ通話ユーザーの取得に失敗しました');
        return [];
      }
      return data;
    };

    const getCached = nextCache(
      fetchRecentVideoCallUsersRaw,
      ['recent_video_call_users', applicationId],
      {
        revalidate: RECENT_VIDEO_CALL_USERS_CACHE_DURATION,
        tags: ['recent_video_call_users'],
      },
    );

    return getCached();
  }

  // ユーザー情報取得（認証必要）
  async getMyUserInfo(token: string): Promise<MyUserInfoExtended> {
    if (this.apiUrl === '') {
      throw new Error('API_URLが設定されていません');
    }

    const request = {
      api: JAMBO_API_ROUTE.GET_USER_INFO,
      token,
    };

    const { code, data } = await this.client.post<
      APIResponse<MyUserInfoExtended & { region?: number }>
    >(this.apiUrl, request);

    if (code !== 0 || !data) {
      throw new Error('ユーザー情報の取得に失敗しました');
    }

    // APIから返されるregionは数値型なので、Region型（文字列）に変換
    // exactOptionalPropertyTypes対応: undefinedの場合はプロパティ自体を含めない
    return {
      ...data,
      ...(data.region !== undefined && {
        region:
          typeof data.region === 'number' ? region(data.region) : data.region,
      }),
    };
  }

  // クレジット購入コース情報取得（認証必要）
  async getCreditPurchaseCourseInfo(
    token: string,
  ): Promise<CreditPurchaseCourseInfo> {
    if (this.apiUrl === '') {
      throw new Error('API_URLが設定されていません');
    }

    const request = getCreditPurchaseCourseInfoRequest(token);

    const { code, data } = await this.client.post<
      APIResponse<GetCreditPurchaseCourseResponseData>
    >(this.apiUrl, request);

    if (code !== 0 || !data) {
      throw new Error('クレジット購入コース情報の取得に失敗しました');
    }

    // snake_case → camelCase 変換
    return {
      isCreditPurchaseLogExist: data.is_credit_purchase_log_exist ?? false,
      canBuyFirstBonusCourse: data.can_buy_first_bonus_course ?? false,
      canBuySecondBonusCourse: data.can_buy_second_bonus_course ?? false,
      canBuyThirdBonusCourse: data.can_buy_third_bonus_course ?? false,
      canBuyFourthBonusCourse: data.can_buy_fourth_bonus_course ?? false,
      canBuyFifthBonusCourse: data.can_buy_fifth_bonus_course ?? false,
    };
  }

  // アクティブライブ録画情報取得（認証必要）
  async getActiveLiveRecording(
    token: string,
  ): Promise<GetActiveLiveRecordingRouteData | null> {
    if (this.apiUrl === '') {
      return null;
    }

    const request = createGetActiveLiveRecordingRequest(token);

    const { code, data } = await this.client.post<
      APIResponse<GetActiveLiveRecordingResponseData | null>
    >(this.apiUrl, request);

    if (code !== 0 || !data) {
      return null;
    }

    // broadcasterInfo を取得
    const broadcasterInfoRequest = createGetBroadcasterInfoRequest(
      token,
      token, // userId（仮にtokenを使用）
      data.broadcasterId,
    );

    const broadcasterInfoResponse = await this.client.post<
      APIResponse<GetBroadcasterInfoResponseData>
    >(this.apiUrl, broadcasterInfoRequest);

    if (broadcasterInfoResponse.code === 0 && broadcasterInfoResponse.data) {
      const broadcasterInfo = convertToBroadcasterInfo(
        broadcasterInfoResponse.data,
        data.broadcasterId,
      );
      return {
        recordingId: data.recordingId,
        broadcasterId: data.broadcasterId,
        channelInfo: data.channelInfo,
        broadcasterInfo,
      };
    }

    return {
      recordingId: data.recordingId,
      broadcasterId: data.broadcasterId,
      channelInfo: data.channelInfo,
    };
  }

  // BOARD/LOGIN/ランキング統合取得（認証不要 - Data Cache最適化）
  async getInstantCallData(_token: string): Promise<InstantCallData> {
    if (this.apiUrl === '') {
      throw new Error('API_URLが設定されていません');
    }

    const { unstable_cache: nextCache } = await import('next/cache');

    const fetchInstantCallDataRaw = async (): Promise<InstantCallData> => {
      // Data Cacheを最大活用するため、すべてのAPIをtokenなしで呼び出す
      const boardRequest = getUtageWebBoardMessageRequest(); // tokenなし
      const loginRequest = loginMeetPeopleRequest; // tokenなし（元から）
      const twoshotRankingRequest = getCategoryTwoShotRankingRequest(); // tokenなし

      const [
        { code: boardCode, data: boardData },
        { code: loginCode, data: loginData },
        { code: twoshotRankingCode, data: twoshotRankingData },
      ] = await Promise.all([
        this.client.post<APIResponse<GetUtageWebBoardMessageResponseData[]>>(
          this.apiUrl,
          boardRequest,
        ),
        this.client.post<APIResponse<MeetPeopleResponseData[]>>(
          this.apiUrl,
          loginRequest,
        ),
        this.client.post<APIResponse<GetCategoryRankingResponseData[]>>(
          this.apiUrl,
          twoshotRankingRequest,
        ),
      ]);

      // エラーハンドリング
      if (boardCode !== 0 || loginCode !== 0 || twoshotRankingCode !== 0) {
        return {
          videoCallRankingUsers: [],
          boardData: [],
          loginData: [],
          boardInstantCallList: [],
          loginInstantCallList: [],
        };
      }

      const safeLoginData = loginData || [];
      const safeBoardData = boardData || [];

      // 通話待機中ユーザーリストを生成
      const boardInstantCallList = extractInstantCallBoardList(
        safeBoardData,
        safeLoginData,
      );
      const loginInstantCallList =
        extractInstantCallMeetPeopleList(safeLoginData);

      // isCallWaiting判定関数
      const isCallWaiting = (userId: string) =>
        boardInstantCallList.some(
          (e: InstantCallItem) => e.user_id === userId,
        ) ||
        loginInstantCallList.some((e: InstantCallItem) => e.user_id === userId);

      // ランキングデータ生成
      const videoCallRankingUsers = processRankingData(
        (twoshotRankingData || []) as unknown as RawRankingUser[],
        isCallWaiting,
      );

      return {
        videoCallRankingUsers,
        boardData: safeBoardData,
        loginData: safeLoginData,
        boardInstantCallList,
        loginInstantCallList,
      };
    };

    // 短期キャッシュ - リアルタイム性が必要なデータのため
    const getCached = nextCache(
      fetchInstantCallDataRaw,
      ['instant_call_data'],
      {
        revalidate: INSTANT_CALL_DATA_CACHE_DURATION,
        tags: ['instant_call_data'],
      },
    );

    return getCached();
  }

  // バナー情報取得（認証必要）- ServerHomeService版
  async getBanners(
    isPwa: boolean,
    token: string,
  ): Promise<BannersWithCreditInfo> {
    if (this.apiUrl === '') {
      throw new Error('API_URLが設定されていません');
    }

    const missionRequest = onboardingMissionRequest(token, isPwa);
    const creditRequest = getCreditPurchaseCourseInfoRequest(token);

    const [missionResponse, creditResponse] = await Promise.all([
      this.client.post<APIResponse<OnboardingMissionResponseData>>(
        this.apiUrl,
        missionRequest,
      ),
      this.client.post<APIResponse<CreditPurchaseCourseInfo>>(
        this.apiUrl,
        creditRequest,
      ),
    ]);

    if (missionResponse.code !== 0 || creditResponse.code !== 0) {
      throw new Error('バナー情報の取得に失敗しました');
    }

    const missionData = missionResponse.data;
    const creditData = creditResponse.data;

    if (!missionData || !creditData) {
      throw new Error('バナー情報の取得に失敗しました');
    }

    const {
      canBuyFirstBonusCourse,
      canBuySecondBonusCourse,
      canBuyThirdBonusCourse,
      canBuyFourthBonusCourse,
      canBuyFifthBonusCourse,
    } = creditData;

    // 全てのミッションのポイントを受け取ったかどうかをチェック
    const allMissionsCompleted = isAllMissionCompleted(missionData);
    const isNative = isNativeApplication();
    const shouldShowOnboardingBanner = !isNative && !allMissionsCompleted;

    // 各ボーナスコースのBannerオブジェクトを作成
    const bonusCourseBanners: Banner[] = [
      ...(canBuyFirstBonusCourse
        ? [
            {
              imagePath: '/banner/1stpurchase_massege_header.webp',
              link: '/purchase/1st-purchase-message',
            },
          ]
        : []),
      ...(canBuySecondBonusCourse
        ? [
            {
              imagePath: '/banner/2ndpurchase_massege_header.webp',
              link: '/purchase/2nd-purchase-message',
            },
          ]
        : []),
      ...(canBuyThirdBonusCourse
        ? [
            {
              imagePath: '/banner/3rdpurchase_massege_header.webp',
              link: '/purchase/3rd-purchase-message',
            },
          ]
        : []),
      ...(canBuyFourthBonusCourse
        ? [
            {
              imagePath: '/banner/4thpurchase_massege_header.webp',
              link: '/purchase/4th-purchase-message',
            },
          ]
        : []),
      ...(canBuyFifthBonusCourse
        ? [
            {
              imagePath: '/banner/5thpurchase_massege_header.webp',
              link: '/purchase/5th-purchase-message',
            },
          ]
        : []),
    ];

    const banners: Banner[] = [
      ...(shouldShowOnboardingBanner
        ? [
            {
              imagePath: '/banner/onboarding_new_header.webp',
              link: '/onboarding',
            },
          ]
        : []),
      ...bonusCourseBanners,
    ];

    // クレジット購入コース情報を返す
    const creditPurchaseCourseInfo: CreditPurchaseCourseInfo = {
      isCreditPurchaseLogExist: creditData.isCreditPurchaseLogExist ?? false,
      canBuyFirstBonusCourse: canBuyFirstBonusCourse ?? false,
      canBuySecondBonusCourse: canBuySecondBonusCourse ?? false,
      canBuyThirdBonusCourse: canBuyThirdBonusCourse ?? false,
      canBuyFourthBonusCourse: canBuyFourthBonusCourse ?? false,
      canBuyFifthBonusCourse: canBuyFifthBonusCourse ?? false,
    };

    return {
      banners,
      creditPurchaseCourseInfo,
    };
  }
}

export class ClientHomeService implements HomeService {
  constructor(private readonly client: HttpClient) {}

  // 定義のみ
  async getInitialData(_filterType?: QuickFilterType): Promise<HomeData> {
    return {};
  }

  async getLiveChannels(token: string): Promise<LiveChannels> {
    const request: LiveUsersRequest = {
      token,
      call_type: 'live', // 探す画面配信待機中ユーザーはcall_typeをliveで固定
    };

    const { code, data } = await this.client.post<APIResponse<LiveChannels>>(
      GET_LIVE_USERS,
      request,
    );

    if (code !== 0 || !data)
      throw new Error('配信ユーザー一覧の取得に失敗しました');

    return data;
  }

  async getRecentVideoCallUsers(
    applicationId: string,
  ): Promise<RecentVideoCallUser[]> {
    const request = createRecentVideoCallUsersMoreClientRequest(applicationId);

    const res = await this.client.post<RecentVideoCallUsersMoreRouteResponse>(
      HTTP_MORE_RECENT_VIDEO_CALL_USERS,
      request,
    );

    if (res.type === 'error') {
      console.error('今すぐビデオ通話ユーザーの取得に失敗しました');
      return [];
    }

    return res.data || [];
  }

  async getBanners(
    isPwa: boolean,
    token: string,
  ): Promise<BannersWithCreditInfo> {
    const request = {
      isPwa,
    };

    const [missionRes, creditRes] = await Promise.all([
      this.client.post<ResponseData<OnboardingMissionResponseData>>(
        HTTP_GET_UTAGE_ONBOARDING_MISSION_PROGRESS,
        request,
      ),
      this.client.post<ResponseData<CreditPurchaseCourseInfo>>(
        GET_CREDIT_PURCHASE_COURSE_INFO,
        getCreditPurchaseCourseInfoRequest(token),
      ),
    ]);

    if (missionRes.type === 'error')
      throw new Error('ミッションの取得に失敗しました');
    if (creditRes.type === 'error')
      throw new Error('クレジットの取得に失敗しました');

    const {
      canBuyFirstBonusCourse,
      canBuySecondBonusCourse,
      canBuyThirdBonusCourse,
      canBuyFourthBonusCourse,
      canBuyFifthBonusCourse,
      isCreditPurchaseLogExist,
    } = creditRes;

    // 全てのミッションのポイントを受け取ったかどうかをチェック
    const allMissionsCompleted = isAllMissionCompleted(missionRes);
    const isNative = isNativeApplication();
    const shouldShowOnboardingBanner = !isNative && !allMissionsCompleted;

    // ApplicationID 15（Web版）でクレカ登録ミッションがin_progressの場合にバナーを表示
    const isWebApp = getApplicationId() === APPLICATION_ID.WEB;
    const creditCardMission = missionRes.missions?.find(
      (mission) => mission.mission_id === MISSION_IDS.CREDIT_CARD_REGISTRATION,
    );
    const shouldShowCreditCardBanner =
      isWebApp && creditCardMission?.status === 'in_progress';

    // 各ボーナスコースのBannerオブジェクトを作成
    const bonusCourseBanners: Banner[] = [
      ...(canBuyFirstBonusCourse
        ? [
            {
              imagePath: '/banner/1stpurchase_massege_header.webp',
              link: '/purchase/1st-purchase-message',
            },
          ]
        : []),
      ...(canBuySecondBonusCourse
        ? [
            {
              imagePath: '/banner/2ndpurchase_massege_header.webp',
              link: '/purchase/2nd-purchase-message',
            },
          ]
        : []),
      ...(canBuyThirdBonusCourse
        ? [
            {
              imagePath: '/banner/3rdpurchase_massege_header.webp',
              link: '/purchase/3rd-purchase-message',
            },
          ]
        : []),
      ...(canBuyFourthBonusCourse
        ? [
            {
              imagePath: '/banner/4thpurchase_massege_header.webp',
              link: '/purchase/4th-purchase-message',
            },
          ]
        : []),
      ...(canBuyFifthBonusCourse
        ? [
            {
              imagePath: '/banner/5thpurchase_massege_header.webp',
              link: '/purchase/5th-purchase-message',
            },
          ]
        : []),
    ];

    // NOTE: バナー取得方針
    // - 基本的にバナー取得・追加ロジックはこちら（Service層）で実装する。
    // - ただし、CSRでの取得が必須なもの（window を使用した分岐ロジック等）に関しては
    //   Banners.tsx 側で配列に追加する（例: getApplicationId() を用いたプラットフォーム判定が必要なレビューキャンペーンバナー）。
    //   そのため、レビューキャンペーンバナーの追加判定は Banners.tsx に移行し、ここでは追加しない。

    const banners: Banner[] = [
      ...(shouldShowOnboardingBanner
        ? [
            {
              imagePath: '/banner/onboarding_new_header.webp',
              link: '/onboarding',
            },
          ]
        : []),
      ...(shouldShowCreditCardBanner
        ? [
            {
              imagePath: '/banner/onboarding_credit.webp',
              link: '/onboarding',
            },
          ]
        : []),
      ...bonusCourseBanners,
    ];

    // クレジット購入コース情報を返す
    const creditPurchaseCourseInfo: CreditPurchaseCourseInfo = {
      isCreditPurchaseLogExist: isCreditPurchaseLogExist ?? false,
      canBuyFirstBonusCourse: canBuyFirstBonusCourse ?? false,
      canBuySecondBonusCourse: canBuySecondBonusCourse ?? false,
      canBuyThirdBonusCourse: canBuyThirdBonusCourse ?? false,
      canBuyFourthBonusCourse: canBuyFourthBonusCourse ?? false,
      canBuyFifthBonusCourse: canBuyFifthBonusCourse ?? false,
    };

    return {
      banners,
      creditPurchaseCourseInfo,
    };
  }

  /**
   * 探す画面のユーザー追加読み込み
   *
   * 注意: 以前のfilterTypeパラメータは削除されました。
   * フィルタリングが必要な場合は、getMeetPeopleUsers()を使用してください。
   *
   * @param lastLoginTime 最後に取得したユーザーのログイン時刻
   * @returns 追加のユーザー一覧
   */
  async getMoreMeetPeopleUsers(
    lastLoginTime: string | null,
  ): Promise<MeetPeople[]> {
    const request = createMeetPeopleMoreClientRequest(lastLoginTime);

    const res = await this.client.post<MeetPeopleMoreRouteResponse>(
      HTTP_MORE_MEET_PEOPLE_USERS,
      request,
    );

    if (res.type === 'error') {
      console.error('ユーザー一覧の取得に失敗しました');
      return [];
    }

    return res.data || [];
  }

  // ユーザー情報取得（認証必要）- ClientHomeService版
  async getMyUserInfo(_token: string): Promise<MyUserInfoExtended> {
    const response = await this.client.post<ResponseData<MyUserInfoExtended>>(
      HTTP_GET_MY_USER_INFO,
      {},
    );

    if (response.type === 'error') {
      throw new Error('ユーザー情報の取得に失敗しました');
    }

    return response;
  }

  // クレジット購入コース情報取得（認証必要）- ClientHomeService版
  async getCreditPurchaseCourseInfo(
    _token: string,
  ): Promise<CreditPurchaseCourseInfo> {
    const response = await this.client.post<
      ResponseData<CreditPurchaseCourseInfo>
    >(GET_CREDIT_PURCHASE_COURSE_INFO, {});

    if (response.type === 'error') {
      throw new Error('クレジット購入コース情報の取得に失敗しました');
    }

    return response;
  }

  // アクティブライブ録画情報取得（認証必要）- ClientHomeService版
  async getActiveLiveRecording(
    _token: string,
  ): Promise<GetActiveLiveRecordingRouteData | null> {
    const response = await this.client.get<
      ResponseData<GetActiveLiveRecordingRouteData | null>
    >(HTTP_GET_ACTIVE_LIVE_RECORDING);

    if (response.type === 'error') {
      return null;
    }

    return response || null;
  }

  // BOARD/LOGIN/ランキング統合取得（認証必要）- ClientHomeService版
  // 注: クライアント側ではこの統合データ取得は通常使用しない想定
  async getInstantCallData(_token: string): Promise<InstantCallData> {
    throw new Error('getInstantCallData is not supported in ClientHomeService');
  }

  // ビデオ通話ランキング（生データ、Progressive Enhancement用）- ClientHomeService版
  // 注: 通常はSSR側で使用するが、CSRでも呼び出し可能にする
  async getDailyTwoShotRankingRaw(): Promise<GetCategoryRankingResponseData[]> {
    throw new Error(
      'getDailyTwoShotRankingRaw is not supported in ClientHomeService. Use SSR instead.',
    );
  }

  // 探す画面ユーザー一覧取得 - ClientHomeService版
  // 注: ClientHomeServiceではこのメソッドは使用しない想定（SSR専用）
  async getMeetPeopleUsers(
    _filterType?: QuickFilterType,
  ): Promise<MeetPeople[]> {
    throw new Error(
      'getMeetPeopleUsers is not supported in ClientHomeService. Use SSR instead.',
    );
  }
}

// ブラウザ・Nextサーバー用のServiceを生成して返すFactory関数
export function createHomeService(client: HttpClient): HomeService {
  if (client.getContext() === Context.SERVER) {
    return new ServerHomeService(client);
  } else {
    return new ClientHomeService(client);
  }
}

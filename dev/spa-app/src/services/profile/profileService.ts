import { getServerSession } from 'next-auth';
import { cache } from 'react';
// removed unused: get-category-ranking-for-utage-web
import {
  type GetChatFileArchiveResponseElementData,
  getChatFileArchiveRequest,
} from '@/apis/get-chat-file-archive-camel';
import { getRecommendedUsersRequest } from '@/apis/get-recommended-users';
import type { RecommendedUserData as GetRecommendedUsersResponseElementData } from '@/apis/get-recommended-users-camel';
import {
  getUserInfoForWebRequest,
  getUserInfoForWebWithUserIdRequest,
} from '@/apis/get-user-inf-for-web';
import { getUserReviewListRequest } from '@/apis/get-user-review-list';
import {
  createGetActiveLiveRecordingRequest,
  type GetActiveLiveRecordingResponse,
} from '@/apis/http/liveRecording';
import { secondAppsTargetUserListThumbnailForWebRequest } from '@/apis/second-apps-target-user-list-thumbnail-for-web';
import { utageWebGetLiveChannelsRequest } from '@/apis/utage-web-get-live-channels';
// removed unused: get-present-menu-list-camel
import {
  GET_PROFILE_IMAGES,
  HTTP_ADD_BOOKMARK,
  HTTP_ADD_FAVORITE,
  HTTP_DELETE_BOOKMARK,
  PURCHASE_IMAGE,
  PURCHASE_VIDEO,
} from '@/constants/endpoints';
import { DEFAULT_AVATAR_PATH } from '@/constants/image';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
import { formatDateYMD } from '@/utils/dateFormat';
import { imageUrl } from '@/utils/image';
import { region } from '@/utils/region';
import { maskUsername } from '@/utils/stringUtils';
import type { ActiveLiveChannels } from '../shared/type';
import type {
  ActiveLiveRecordingInfo,
  CamelCasedUserInfoResponse,
  ChatFileArchiveInfo,
  IdentificationStatusResponse,
  JamboReviewListResponse,
  LiveBroadcasterChannelData,
  ProfileActionResult,
  ProfileInitialData,
  ProfileInitialDataResponse,
  RecommendedUserInfo,
  RecommendedUsersDataResponse,
  ReviewItem,
  ReviewListDataResponse,
  ThumbnailInfo,
  UserInfo,
} from './type';
import { buildProfileMediaItems, mapThumbnailsToMedia } from './utils/media';

// プロフィール画像表示枚数の定数
const MAX_PROFILE_IMAGES = 2;

// ============================================================
// React.cache() によるリクエストスコープ内のデータ重複取得防止
// generateMetadata と Content コンポーネント間で同じAPIが
// 呼ばれる問題を解消する
// ============================================================

/**
 * getUserInfo のキャッシュ関数
 * 同一リクエストスコープ内で同じ userId/viewerUserId に対する
 * 重複リクエストを防止する
 */
const cachedGetUserInfo = cache(
  async (
    client: HttpClient,
    apiUrl: string,
    userId: string,
    viewerUserId?: string,
  ): Promise<UserInfo> => {
    const request = viewerUserId
      ? getUserInfoForWebWithUserIdRequest(viewerUserId, userId)
      : getUserInfoForWebRequest(userId);

    const response = await client.post<CamelCasedUserInfoResponse>(
      apiUrl,
      request,
    );

    if (response.code !== 0 || !response.data) {
      throw new Error(
        `Failed to get user info: code ${response.code}, userId ${userId}`,
      );
    }

    return response.data;
  },
);

/**
 * getInitialDataRaw のキャッシュ関数
 * live-broadcaster の generateMetadata (getLiveProfileMeta → getInitialDataRaw) と
 * Content (getLiveInitialData → getInitialDataRaw) の重複を防止する
 *
 * React.cache() のキー判定は引数の参照等価性に基づく。
 * client は serverHttpClient シングルトン、apiUrl は同一文字列のため、
 * 異なる ServerProfileService インスタンスからの呼び出しでもキャッシュヒットする。
 */
const cachedGetInitialDataRaw = cache(
  async (
    client: HttpClient,
    apiUrl: string,
    userId: string,
    viewerUserId?: string,
  ): Promise<ProfileInitialDataResponse> => {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);

    const request = secondAppsTargetUserListThumbnailForWebRequest(userId);

    const [userInfoResponse, thumbnailResponse, chatFileResponse] =
      await Promise.all([
        cachedGetUserInfo(client, apiUrl, userId, viewerUserId),
        client
          .post<APIResponse<ThumbnailInfo[]>>(apiUrl, request)
          .then((response) => {
            if (response.code !== 0 || !response.data) {
              console.warn(`Failed to get thumbnails: code ${response.code}`);
              return [];
            }
            return response.data.length > 0 ? response.data : [];
          })
          .catch((error) => {
            console.error('getThumbnailList error:', error);
            return [] as ThumbnailInfo[];
          }),
        session?.user?.token
          ? client
              .post<APIResponse<GetChatFileArchiveResponseElementData>>(
                apiUrl,
                getChatFileArchiveRequest(session.user.token, userId),
              )
              .then((response) => {
                if (response.code !== 0 || !response.data) return [];
                return response.data.filter(
                  (item) => !item.isOwn,
                ) as ChatFileArchiveInfo[];
              })
              .catch((error) => {
                console.error('getChatFileArchive error:', error);
                return [] as ChatFileArchiveInfo[];
              })
          : ([] as ChatFileArchiveInfo[]),
      ]);

    return {
      userInfo: userInfoResponse,
      thumbnailList: thumbnailResponse,
      chatFileArchive: chatFileResponse,
    };
  },
);

// ブラウザ・Nextサーバーの実装の差分を吸収する
export type ProfileService = {
  // 加工済み初期データ取得（ページ表示用）
  getInitialData: (
    userId: string,
    viewerUserId?: string,
  ) => Promise<ProfileInitialData>;

  // 生のユーザー情報取得（RSC/SSR専用）
  getUserInfo?: (userId: string, viewerUserId?: string) => Promise<UserInfo>;

  // メタデータ（title/description/regionName）生成
  getProfileMeta?: (
    userId: string,
    viewerUserId?: string,
  ) => Promise<{ title: string; description: string; regionName: string }>;

  // ライブ配信者用メタデータ生成（OG画像URL含む）
  getLiveProfileMeta?: (
    userId: string,
    viewerUserId?: string,
  ) => Promise<{
    title: string;
    description: string;
    regionName: string;
    ogImageUrl?: string;
    isLive: boolean;
  }>;

  // Suspense用の個別データ取得メソッド
  getIdentificationStatusData?: (
    userId: string,
  ) => Promise<IdentificationStatusResponse>;
  getRecommendedUsersData?: (
    token?: string,
  ) => Promise<RecommendedUsersDataResponse>;
  getReviewListData?: (userId: string) => Promise<ReviewListDataResponse>;

  // ライブ配信者データ取得（unbroadcasterパターンとの統一）
  getLiveBroadcasterData?: (
    partnerId: string,
    userInfo: UserInfo,
  ) => Promise<LiveBroadcasterChannelData>;

  // ライブ配信者用統合データ取得（getInitialData + getLiveBroadcasterData + getActiveLiveRecording）
  getLiveInitialData?: (
    userId: string,
    viewerUserId?: string,
  ) => Promise<
    ProfileInitialData & { liveBroadcasterData: LiveBroadcasterChannelData }
  >;

  // アクティブなライブ録画を取得（RSC/SSR専用）
  getActiveLiveRecording?: (
    broadcasterId: string,
    token?: string,
  ) => Promise<ActiveLiveRecordingInfo | null>;

  // プロフィール画像取得（メッセージ詳細用）
  getProfileImages?: (userId: string) => Promise<string[]>;

  // クライアント操作時
  addFavorite?: (partnerId: string) => Promise<ProfileActionResult>;
  addBookmark?: (partnerId: string) => Promise<ProfileActionResult>;
  deleteBookmark?: (partnerId: string) => Promise<ProfileActionResult>;
  viewImage?: (imageId: string) => Promise<ProfileActionResult>;
  viewVideo?: (videoId: string) => Promise<ProfileActionResult>;
};

// Nextサーバーの実装
export class ServerProfileService implements ProfileService {
  private readonly apiUrl: string = (() => {
    const url = import.meta.env.API_URL;
    if (!url) {
      throw new Error('API_URL environment variable is not set');
    }
    return url;
  })();

  constructor(private readonly client: HttpClient) {}

  private async getInitialDataRaw(
    userId: string,
    viewerUserId?: string,
  ): Promise<ProfileInitialDataResponse> {
    return cachedGetInitialDataRaw(
      this.client,
      this.apiUrl,
      userId,
      viewerUserId,
    );
  }

  /**
   * ページ表示用の加工済み初期データを取得
   * - ThumbnailInfo[] を MediaInfo[] に正規化
   * @param activeLiveRecording アクティブなライブ録画情報（getLiveInitialDataから渡される）
   */
  async getInitialData(
    userId: string,
    viewerUserId?: string,
    activeLiveRecording?: ActiveLiveRecordingInfo | null,
  ): Promise<ProfileInitialData> {
    const base = await this.getInitialDataRaw(userId, viewerUserId);
    const mediaList = mapThumbnailsToMedia(base.thumbnailList);
    const { items: mediaItems, hasMultipleImages } = buildProfileMediaItems(
      mediaList,
      base.chatFileArchive,
      DEFAULT_AVATAR_PATH,
      activeLiveRecording,
    );
    return {
      userInfo: base.userInfo,
      mediaList,
      mediaItems,
      hasMultipleImages,
    };
  }

  /**
   * プロフィールページ用のメタデータ(title/description/regionName)を生成
   * region(number) → region(string) の変換を含む
   */
  async getProfileMeta(
    userId: string,
    viewerUserId?: string,
  ): Promise<{ title: string; description: string; regionName: string }> {
    const userInfo = await this.getUserInfo(userId, viewerUserId);
    const userName = userInfo.userName;
    const age = userInfo.age;
    const regionName = region(userInfo.region);
    const title = `${userName}ちゃん ${age}歳 ${regionName}のプロフィール`;
    const description = `${userName}ちゃん ${age}歳 ${regionName}のアダルトプロフィール。素人感たっぷりのエロチャットで、リアルな見せあいややりとりを体験できます。`;
    return { title, description, regionName };
  }

  /**
   * ライブ配信者用メタデータを生成（OG画像URL、配信状態を含む）
   */
  async getLiveProfileMeta(
    userId: string,
    viewerUserId?: string,
  ): Promise<{
    title: string;
    description: string;
    regionName: string;
    ogImageUrl?: string;
    isLive: boolean;
  }> {
    // 基本メタデータを取得
    const { title, regionName } = await this.getProfileMeta(
      userId,
      viewerUserId,
    );
    const userName = title.split('ちゃん')[0];

    // ライブ配信データを取得（unbroadcasterパターンとの統一）
    let liveBroadcasterData: LiveBroadcasterChannelData | null = null;
    let userInfo: UserInfo | undefined;
    let avaId: string | undefined;
    try {
      // まず初期データを取得（userInfo と mediaList を含む）
      const initialDataRaw = await this.getInitialDataRaw(userId, viewerUserId);
      userInfo = initialDataRaw.userInfo;
      avaId = userInfo.avaId;

      // getLiveBroadcasterData を呼び出し
      liveBroadcasterData = await this.getLiveBroadcasterData(userId, userInfo);
    } catch (_error) {
      // ライブ配信データ取得失敗時は基本情報のみ返す
      liveBroadcasterData = null;
    }

    const isLive = liveBroadcasterData?.isInProgress ?? false;
    const liveScreenshotThumbnailId =
      liveBroadcasterData?.channelInfo?.thumbnailImageId;

    // OG画像: ライブ配信中ならスクリーンショット、それ以外はアバター
    const { imageUrlForAgoraScreenshot } = await import('@/utils/image');
    const ogImageUrl =
      isLive && liveScreenshotThumbnailId
        ? imageUrlForAgoraScreenshot(liveScreenshotThumbnailId)
        : avaId
          ? imageUrl(avaId)
          : undefined;

    // description: ライブ配信中なら専用メッセージ
    const description = isLive
      ? `${userName}ちゃんが現在ライブ配信中！素人感たっぷりのエロチャットで、リアルなやりとりを体験できます。`
      : `${userName}ちゃんのアダルトプロフィール。素人感たっぷりのエロチャットで、リアルな見せあいややりとりを体験できます。`;

    // exactOptionalPropertyTypes対応: undefinedの場合はプロパティを省略
    return ogImageUrl
      ? { title, description, regionName, ogImageUrl, isLive }
      : { title, description, regionName, isLive };
  }

  /**
   * ライブ配信者用統合データ取得
   * getInitialData()の結果をgetLiveBroadcasterData()に渡して統合
   *
   * 【実行順序】
   * 1. getInitialDataRaw() と getActiveLiveRecording() を並列実行
   * 2. 上記完了後、getLiveBroadcasterData() を実行（userInfoが必要なため）
   * 3. mediaItemsの構築時にactiveLiveRecordingを含める
   */
  async getLiveInitialData(
    userId: string,
    viewerUserId?: string,
  ): Promise<
    ProfileInitialData & { liveBroadcasterData: LiveBroadcasterChannelData }
  > {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;

    // Step 1: 初期データとライブ録画データを並列取得
    const [initialDataRaw, activeLiveRecording] = await Promise.all([
      this.getInitialDataRaw(userId, viewerUserId),
      this.getActiveLiveRecording(userId, token),
    ]);

    // Step 2: ライブ配信データを取得（userInfoが必要）
    const liveBroadcasterData = await this.getLiveBroadcasterData(
      userId,
      initialDataRaw.userInfo,
    );

    // Step 3: mediaItemsを構築（activeLiveRecordingを含める）
    const mediaList = mapThumbnailsToMedia(initialDataRaw.thumbnailList);
    const { items: mediaItems, hasMultipleImages } = buildProfileMediaItems(
      mediaList,
      initialDataRaw.chatFileArchive,
      DEFAULT_AVATAR_PATH,
      activeLiveRecording,
    );

    return {
      userInfo: initialDataRaw.userInfo,
      mediaList,
      mediaItems,
      hasMultipleImages,
      liveBroadcasterData,
    };
  }

  // データ加工ロジックはservice層に置かず、utilsを使用する方針（mapThumbnailsToMedia 参照）

  /**
   * 本人確認ステータスを取得（Suspense用）
   */
  async getIdentificationStatusData(
    userId: string,
  ): Promise<IdentificationStatusResponse> {
    const isApproved = await this.getIdentificationStatus(userId);
    return {
      identificationStatus: { isApproved },
    };
  }

  /**
   * おすすめユーザーを取得（Suspense用）
   */
  async getRecommendedUsersData(
    token?: string,
  ): Promise<RecommendedUsersDataResponse> {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const sessionToken = token || session?.user?.token;

    const recommendedUsers = await this.getRecommendedUsers(sessionToken);
    return { recommendedUsers };
  }

  /**
   * ライブ配信者データを取得（unbroadcasterパターンとの統一）
   * @param partnerId - 配信者のユーザーID
   * @param userInfo - getInitialData()で取得済みのユーザー情報（内部で使用、戻り値には含めない）
   * @param thumbnailList - getInitialData()で取得済みのサムネイルリスト（内部で使用、戻り値には含めない）
   * @returns ライブ配信特有の情報のみ（channelInfo, isInProgress, otherLiveChannelsなど）
   *
   * ⚠️ 重要: broadcaster情報は返さない（userInfoを使用するため、unbroadcasterと統一）
   */
  async getLiveBroadcasterData(
    partnerId: string,
    userInfo: UserInfo,
  ): Promise<LiveBroadcasterChannelData> {
    try {
      const { authOptions } = await import(
        '@/app/api/auth/[...nextauth]/options'
      );
      const session = await getServerSession(authOptions);
      const token = session?.user?.token;

      // ========================================
      // 1. ライブチャンネル一覧を取得（これのみ）
      // ========================================
      const request = utageWebGetLiveChannelsRequest();
      const liveChannelsResponse = await this.client.post<
        APIResponse<ActiveLiveChannels>
      >(this.apiUrl, request);

      if (liveChannelsResponse.code !== 0 || !liveChannelsResponse.data) {
        throw new Error('ライブチャンネル情報の取得に失敗しました');
      }

      // ========================================
      // 2. 対象ユーザーのチャンネルを検索
      // ========================================
      const allChannels = [
        ...(liveChannelsResponse.data.inLiveList || []),
        ...(liveChannelsResponse.data.standbyList || []),
      ];

      // 他の配信者リスト（LiveBroadcasterSidebarで必要な情報を含む）
      const otherLiveChannels = allChannels
        .filter((channel) => channel.broadcaster.userId !== partnerId)
        .map((channel) => ({
          userId: channel.broadcaster.userId,
          userName: channel.broadcaster.userName,
          avatarId: channel.broadcaster.avaId,
          age: channel.broadcaster.age,
          about: channel.broadcaster.abt, // LiveBroadcasterSidebarで使用
          region: channel.broadcaster.region, // 生データ（数値）のまま
          isLive: channel.broadcaster.isLiveNow,
          isNewUser: channel.broadcaster.isNewUser, // LiveBroadcasterSidebarで使用
          hasLovense: channel.broadcaster.hasLovense, // LiveBroadcasterSidebarで使用
          channelInfo: {
            rtcChannelToken: channel.channelInfo.rtcChannelToken,
            appId: channel.channelInfo.appId,
            channelId: channel.channelInfo.channelId,
            peerId: channel.broadcaster.userId,
            userCount: channel.channelInfo.userCount,
            thumbnailImageId: channel.channelInfo.thumbnailImageId,
          },
        }));

      const targetChannel = allChannels.find(
        (channel) => channel.broadcaster.userId === partnerId,
      );

      if (!targetChannel) {
        return {
          channelInfo: null,
          isLoggedIn: !!token,
          isFavorited: !!userInfo.isFav,
          isBookmarked: userInfo.bookmark ?? false,
          isInProgress: false,
          otherLiveChannels,
        };
      }

      // 配信中かどうかを判定
      const isLive = liveChannelsResponse.data.inLiveList.some(
        (channel) => channel.broadcaster.userId === partnerId,
      );

      // ========================================
      // 3. データ変換（ライブ配信特有の情報のみ）
      // ========================================
      const channelInfo = {
        rtcChannelToken: targetChannel.channelInfo.rtcChannelToken,
        appId: targetChannel.channelInfo.appId,
        channelId: targetChannel.channelInfo.channelId,
        peerId: targetChannel.broadcaster.userId,
        userCount: targetChannel.channelInfo.userCount,
        thumbnailImageId: targetChannel.channelInfo.thumbnailImageId,
      };

      // ========================================
      // 4. 最終データを返却（ライブ配信特有の情報のみ）
      // ========================================
      // ⚠️ userInfo はすでに getInitialData() で取得済みなので、
      //    ライブ配信特有の情報（channelInfo, isInProgress, otherLiveChannels）のみを返す
      return {
        channelInfo,
        isLoggedIn: !!token,
        isFavorited: !!userInfo.isFav,
        isBookmarked: userInfo.bookmark ?? false,
        isInProgress: isLive,
        otherLiveChannels,
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Unknown error occurred',
      );
    }
  }

  /**
   * アクティブなライブ録画を取得
   * @param broadcasterId - 配信者のユーザーID（フィルタリング用）
   * @param token - 認証トークン
   * @returns ライブ録画情報（該当broadcasterId の録画がある場合のみ）
   */
  async getActiveLiveRecording(
    broadcasterId: string,
    token?: string,
  ): Promise<ActiveLiveRecordingInfo | null> {
    if (!token) return null;

    try {
      const request = createGetActiveLiveRecordingRequest(token);
      const response = await this.client.post<GetActiveLiveRecordingResponse>(
        this.apiUrl,
        request,
      );

      if (response.code !== 0 || !response.data) {
        return null;
      }

      // 閲覧中のプロフィールユーザー（broadcasterId）の録画のみを返す
      if (response.data.broadcasterId !== broadcasterId) {
        return null;
      }

      return {
        recordingId: response.data.recordingId,
        broadcasterId: response.data.broadcasterId,
      };
    } catch (error) {
      console.error('getActiveLiveRecording error:', error);
      return null;
    }
  }

  // 各API通信の個別実装メソッド（private）
  // エラーハンドリング: 必須データは例外をスロー、オプショナルデータは空配列を返却
  async getUserInfo(userId: string, viewerUserId?: string): Promise<UserInfo> {
    return cachedGetUserInfo(this.client, this.apiUrl, userId, viewerUserId);
  }

  private async getThumbnailList(userId: string): Promise<ThumbnailInfo[]> {
    const request = secondAppsTargetUserListThumbnailForWebRequest(userId);

    try {
      // ServerHttpClientがcamelcaseKeys変換を自動で行うため、camelCase型で受け取る
      const response = await this.client.post<APIResponse<ThumbnailInfo[]>>(
        this.apiUrl,
        request,
      );

      if (response.code !== 0 || !response.data) {
        console.warn(`Failed to get thumbnails: code ${response.code}`);
        return []; // エラー時は空配列を返す
      }

      return response.data.length > 0 ? response.data : []; // データが空の場合も空配列を返す
    } catch (error) {
      console.error('getThumbnailList error:', error);
      return []; // 例外時も空配列を返す
    }
  }

  /**
   * メッセージ詳細ページ用にプロフィール画像のURLリストを取得
   * これはメッセージ詳細ページで使ってる
   * メッセージ詳細ページ以外では使ってない？
   * プロフィール詳細ページでは何使ってる？
   * @param userId ユーザーID
   * @returns 変換済みの画像URL配列（最大2枚）
   */
  async getProfileImages(userId: string): Promise<string[]> {
    try {
      const thumbnails = await this.getThumbnailList(userId);

      // 画像のみをフィルタリング
      const imageThumbnails = thumbnails.filter(
        (item) => item.type === 'image',
      );

      // 最初の指定枚数のみを取得してURL変換
      const imageUrls = imageThumbnails
        .slice(0, MAX_PROFILE_IMAGES)
        .map((item) => imageUrl(item.thumbnailUrl));

      return imageUrls;
    } catch (error) {
      console.error('getProfileImages error:', error);
      return [];
    }
  }

  // removed: getCategoryRanking() is no longer used
  // removed: getChatFileArchive() はcachedGetInitialDataRaw()に統合

  private async getRecommendedUsers(
    token?: string,
  ): Promise<RecommendedUserInfo[]> {
    if (!token) {
      return []; // トークンがない場合は空配列を返す
    }

    const request = getRecommendedUsersRequest(token);

    const response = await this.client.post<
      APIResponse<GetRecommendedUsersResponseElementData[]>
    >(this.apiUrl, request);

    if (response.code !== 0 || !response.data) {
      return []; // エラーでも空配列を返す
    }

    return response.data;
  }

  // removed: getVideoChatMenuList (未使用)

  private async getIdentificationStatus(userId: string): Promise<boolean> {
    if (!import.meta.env.TITANIA_URL) {
      console.warn('TITANIA_URL environment variable is not set');
      return false;
    }

    const url = `${import.meta.env.TITANIA_URL}/identificationPapers/approvedIdentificationUser?user_id=${encodeURIComponent(userId)}`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) {
        console.error(
          'Failed to fetch identification status:',
          res.status,
          res.statusText,
        );
        return false;
      }
      const data = await res.json().catch(() => undefined);
      return Boolean(data?.check_answer ?? false);
    } catch (error) {
      console.error('Failed to fetch identification status:', error);
      return false;
    }
  }

  /**
   * レビューリストを取得（Suspense用）
   */
  async getReviewListData(userId: string): Promise<ReviewListDataResponse> {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;

    if (!token) {
      return { reviewList: [], avgScore: 0, reviewCount: 0 };
    }

    const { reviews, avgScore, reviewCount } = await this.getReviewList(
      userId,
      token,
    );

    // データ加工（日付フォーマット、ユーザー名マスク）
    const processedReviews = reviews.map((review) => ({
      ...review,
      formattedDate: formatDateYMD(review.reviewInfo.createdAt),
      maskedUsername: maskUsername(review.reviewerUserInfo.userName),
    }));

    return {
      reviewList: processedReviews,
      avgScore,
      reviewCount,
    };
  }

  private async getReviewList(
    userId: string,
    token: string,
  ): Promise<{ reviews: ReviewItem[]; avgScore: number; reviewCount: number }> {
    const request = getUserReviewListRequest(token, userId);

    const response = await this.client.post<
      APIResponse<JamboReviewListResponse>
    >(this.apiUrl, request);

    if (response.code !== 0 || !response.data) {
      return { reviews: [], avgScore: 0, reviewCount: 0 };
    }

    return {
      reviews: response.data.reviews,
      avgScore: response.data.averageScore,
      reviewCount: response.data.reviewCount,
    };
  }
}

// ブラウザの実装
export class ClientProfileService implements ProfileService {
  constructor(private readonly client: HttpClient) {}

  async getInitialData(): Promise<ProfileInitialData> {
    // クライアント側では使用しない
    throw new Error(
      'getInitialData is only available on server-side. Use React Query or SWR for client-side data fetching.',
    );
  }

  async getReviewListData(): Promise<ReviewListDataResponse> {
    throw new Error('getReviewListData is only available on server-side.');
  }

  async addFavorite(partnerId: string): Promise<ProfileActionResult> {
    try {
      const request = {
        partnerId: partnerId,
      };

      const response = await this.client.post<{
        success: boolean;
        message?: string;
      }>(HTTP_ADD_FAVORITE, request);

      return {
        success: response.success,
        ...(response.message && { message: response.message }),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async addBookmark(partnerId: string): Promise<ProfileActionResult> {
    try {
      const request = {
        partnerId: partnerId,
      };

      const response = await this.client.post<{
        success: boolean;
        message?: string;
      }>(HTTP_ADD_BOOKMARK, request);

      return {
        success: response.success,
        ...(response.message && { message: response.message }),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async deleteBookmark(partnerId: string): Promise<ProfileActionResult> {
    try {
      const request = {
        partnerId: partnerId,
      };

      const response = await this.client.post<{
        success: boolean;
        message?: string;
      }>(HTTP_DELETE_BOOKMARK, request);

      return {
        success: response.success,
        ...(response.message && { message: response.message }),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async viewImage(imageId: string): Promise<ProfileActionResult> {
    try {
      const request = {
        imageId: imageId,
      };

      const response = await this.client.post<{
        success: boolean;
        message?: string;
      }>(PURCHASE_IMAGE, request);

      return {
        success: response.success,
        ...(response.message && { message: response.message }),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async viewVideo(videoId: string): Promise<ProfileActionResult> {
    try {
      const request = {
        videoId: videoId,
      };

      const response = await this.client.post<{
        success: boolean;
        message?: string;
      }>(PURCHASE_VIDEO, request);

      return {
        success: response.success,
        ...(response.message && { message: response.message }),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getProfileImages(userId: string): Promise<string[]> {
    try {
      const response = await this.client.post<{
        success: boolean;
        data?: string[];
        message?: string;
      }>(GET_PROFILE_IMAGES, { partnerId: userId });

      if (!response.success || !response.data) {
        console.warn('Failed to get profile images');
        return [];
      }

      return response.data;
    } catch (error) {
      console.error('getProfileImages error:', error);
      return [];
    }
  }
}

// ブラウザ・Nextサーバー用のServiceを生成して返すFactory関数
export function createProfileService(client: HttpClient): ProfileService {
  if (client.getContext() === Context.SERVER) {
    return new ServerProfileService(client);
  } else {
    return new ClientProfileService(client);
  }
}

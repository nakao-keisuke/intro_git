import { getServerSession } from 'next-auth';
import {
  type GetFleaMarketFavoriteListResponseData,
  getFleaMarketFavoriteListRequest,
} from '@/apis/get-flea-market-favorite-list';
import {
  type GetFleaMarketItemListResponseData,
  getFleaMarketItemListRequest,
} from '@/apis/get-flea-market-item-list';
import { getFleaMarketTransactionListRequest } from '@/apis/get-flea-market-transaction-list';
import type { GetUserInfoForWebResponseData } from '@/apis/get-user-inf-for-web';
import {
  GET_FLEA_MARKET_FAVORITE_LIST,
  GET_FLEA_MARKET_ITEM_LIST,
  GET_FLEA_MARKET_TRANSACTION_LIST,
  GET_USER_INF_FOR_WEB_WITH_USER_ID,
} from '@/constants/endpoints';
import type { HttpClient } from '@/libs/http/HttpClient';
import { Context } from '@/libs/http/type';
import type { TransactionWithItem } from '@/types/fleamarket/shared';
import type { JamboResponse } from '@/types/JamboApi';
import type { MyUserInfo } from '@/types/MyUserInfo';
import type { ResponseData } from '@/types/NextApi';
import { type Region, region } from '@/utils/region';
import type {
  FleaMarketFavoriteListResponse,
  FleaMarketItemsResponseCamel,
  FleaMarketItemWithFavoritedFlagCamel,
  FleaMarketItemWithFavoritesCamel,
  FleaMarketMainResponseCamel,
  FleaMarketSellerInfo,
  FleaMarketTransactionListResponse,
} from './type';

// API route response type for get-user-inf-for-web
type MyUserInfoWithBookmark = MyUserInfo & {
  bookmark: boolean;
  region: string;
  hLevel?: string;
  bustSize?: string;
};

// ブラウザ・Nextサーバーの実装の差分を吸収する
export type FleaMarketService = {
  // メインページデータ取得（全タブのデータを並行取得）
  getMainPageData: (
    token?: string,
    userId?: string,
  ) => Promise<FleaMarketMainResponseCamel>;

  // フリマ商品取得
  getFleaMarketItems: (
    sellerId: string,
    token?: string,
    options?: {
      category?: string;
      limit?: number;
      page?: number;
      salesStatus?: string;
      bookmarkOnly?: boolean;
      userId?: string;
    },
  ) => Promise<FleaMarketItemsResponseCamel>;

  // お気に入り商品取得
  getFavoriteItems: (
    token: string,
    options?: {
      page?: number;
      limit?: number;
      userId?: string;
    },
  ) => Promise<FleaMarketFavoriteListResponse>;

  // 取引履歴取得
  getTransactions: (
    token: string,
    userId: string,
    options?: {
      page?: number;
      limit?: number;
    },
  ) => Promise<FleaMarketTransactionListResponse>;

  // 出品者情報取得（Board実装と統一）
  getSellerInfo?: (
    userId: string,
    sellerId: string,
  ) => Promise<FleaMarketSellerInfo | null>;

  // 商品一覧をお気に入りフラグ付きで取得（データ加工含む）
  getFleaMarketItemsWithFavorites?: (
    sellerId: string,
    viewerUserId?: string,
    viewerToken?: string,
    options?: {
      category?: string;
      limit?: number;
      page?: number;
      salesStatus?: string;
    },
  ) => Promise<{ items: FleaMarketItemWithFavoritedFlagCamel[] }>;
};

// サーバーの実装
export class ServerFleaMarketService implements FleaMarketService {
  private readonly apiUrl: string = (() => {
    const url = import.meta.env.API_URL;
    if (!url) {
      throw new Error('API_URL environment variable is not set');
    }
    return url;
  })();

  constructor(private readonly client: HttpClient) {}

  async getMainPageData(
    token?: string,
    userId?: string,
  ): Promise<FleaMarketMainResponseCamel> {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const sessionToken = token || session?.user?.token;
    const sessionUserId = userId || session?.user?.id;

    try {
      const itemsPromise = this.getFleaMarketItems('', sessionToken, {
        category: 'all',
        limit: 10,
        page: 1,
        bookmarkOnly: false,
      });

      const favoritesPromise =
        sessionToken && sessionUserId
          ? this.getFavoriteItems(sessionToken, {
              limit: 10,
              page: 1,
              userId: sessionUserId,
            })
          : Promise.resolve({ favorites: [], totalCount: 0 });

      const transactionsPromise =
        sessionToken && sessionUserId
          ? this.getTransactions(sessionToken, sessionUserId, {
              limit: 10,
              page: 1,
            })
          : Promise.resolve({ transactions: [], totalCount: 0 });

      const [itemsResponse, favoritesResponse, transactionsResponse] =
        await Promise.all([
          itemsPromise,
          favoritesPromise,
          transactionsPromise,
        ]);

      // HTTPクライアントがsnake_case → camelCaseに自動変換するため、
      // favoritesも実際はcamelCase形式になっている
      return {
        items: itemsResponse.items,
        favorites:
          favoritesResponse.favorites as unknown as FleaMarketItemWithFavoritesCamel[],
        transactions: transactionsResponse.transactions,
        totalItems: itemsResponse.totalCount || 0,
        totalFavorites: favoritesResponse.totalCount || 0,
        totalTransactions: transactionsResponse.totalCount || 0,
      };
    } catch (error) {
      console.error(
        'Exception in ServerFleaMarketService.getMainPageData:',
        error,
      );
      console.error('Session token present:', !!sessionToken);
      console.error('Session user ID present:', !!sessionUserId);
      return {
        items: [],
        favorites: [],
        transactions: [],
        totalItems: 0,
        totalFavorites: 0,
        totalTransactions: 0,
      };
    }
  }

  async getFavoriteItems(
    token: string,
    options: { page?: number; limit?: number; userId?: string } = {},
  ): Promise<FleaMarketFavoriteListResponse> {
    const { page = 1, limit = 10, userId: optionsUserId } = options;

    try {
      const { authOptions } = await import(
        '@/app/api/auth/[...nextauth]/options'
      );
      const session = await getServerSession(authOptions);
      const userId = optionsUserId || session?.user?.id || '';

      if (!userId) {
        console.error(
          'ServerFleaMarketService.getFavoriteItems: No userId available',
        );
        return { favorites: [], totalCount: 0 };
      }

      const request = getFleaMarketFavoriteListRequest(
        token,
        userId,
        page,
        limit,
      );

      const response = await this.client.post<{
        code: number;
        data: GetFleaMarketFavoriteListResponseData;
        message?: string;
      }>(this.apiUrl, request);

      if (response.code !== 0 || !response.data) {
        console.error('ServerFleaMarketService.getFavoriteItems: API error', {
          code: response.code,
          message: response.message,
        });
        return { favorites: [], totalCount: 0 };
      }

      // Transform FavoriteItem[] to FleaMarketItemWithFavorites[]
      const transformedFavorites = response.data.map((favoriteItem) => ({
        item: favoriteItem.item_info,
        fav_count: favoriteItem.fav_count || 0,
      }));

      return {
        favorites: transformedFavorites,
        totalCount: response.data.length,
        hasMore: response.data.length >= limit,
      };
    } catch (error) {
      console.error(
        'Exception in ServerFleaMarketService.getFavoriteItems:',
        error,
      );
      return { favorites: [], totalCount: 0 };
    }
  }

  async getTransactions(
    token: string,
    userId: string,
    options: { page?: number; limit?: number } = {},
  ): Promise<FleaMarketTransactionListResponse> {
    const { page = 1, limit = 10 } = options;

    try {
      const request = getFleaMarketTransactionListRequest(
        token,
        userId,
        page,
        limit,
      );

      const response = await this.client.post<{
        code: number;
        data: {
          transactions: TransactionWithItem[];
          total: number;
        } | null;
        message?: string;
      }>(this.apiUrl, request);

      if (response.code !== 0 || !response.data) {
        console.error('ServerFleaMarketService.getTransactions: API error', {
          code: response.code,
          message: response.message,
        });
        return { transactions: [], totalCount: 0 };
      }

      return {
        transactions: response.data.transactions,
        totalCount: response.data.total,
        hasMore: response.data.transactions.length >= limit,
      };
    } catch (error) {
      console.error(
        'Exception in ServerFleaMarketService.getTransactions:',
        error,
      );
      return { transactions: [], totalCount: 0 };
    }
  }

  async getFleaMarketItems(
    sellerId: string,
    _token?: string,
    options: {
      category?: string;
      limit?: number;
      page?: number;
      salesStatus?: string;
      bookmarkOnly?: boolean;
      userId?: string;
    } = {},
  ): Promise<FleaMarketItemsResponseCamel> {
    const {
      category = 'all',
      limit = 8,
      page = 1,
      salesStatus = 'all',
      bookmarkOnly,
      userId,
    } = options;

    try {
      const request = getFleaMarketItemListRequest(
        category,
        limit,
        page,
        salesStatus === 'all' ? undefined : salesStatus,
        sellerId,
        bookmarkOnly,
        userId,
      );

      const response = await this.client.post<{
        code: number;
        data: GetFleaMarketItemListResponseData;
        message?: string;
      }>(this.apiUrl, request);

      if (response.code !== 0 || !response.data) {
        console.error('ServerFleaMarketService.getFleaMarketItems: API error', {
          code: response.code,
          message: response.message,
        });
        return { items: [] };
      }

      // HTTPクライアントがsnake_case → camelCaseに自動変換するため、
      // 実際のデータはcamelCase形式になっている
      return {
        items: response.data as unknown as FleaMarketItemWithFavoritesCamel[],
        totalCount: response.data.length,
        hasMore: response.data.length >= limit,
      };
    } catch (error) {
      console.error(
        'Exception in ServerFleaMarketService.getFleaMarketItems:',
        {
          sellerId,
          category,
          limit,
          page,
          salesStatus,
          bookmarkOnly,
          error: error instanceof Error ? error.message : error,
        },
      );
      return { items: [] };
    }
  }

  // 出品者情報取得（Board実装と統一パターン）
  async getSellerInfo(
    userId: string,
    sellerId: string,
  ): Promise<FleaMarketSellerInfo | null> {
    try {
      const response = await this.client.post<
        JamboResponse<GetUserInfoForWebResponseData>
      >(this.apiUrl, {
        api: 'get_user_inf_for_web',
        user_id: userId,
        req_user_id: sellerId,
      });

      if (response.code === 0 && response.data) {
        const userData = response.data;
        const sellerInfo: FleaMarketSellerInfo = {
          userId: userData.user_id,
          userName: userData.user_name || '名無し',
          avatarId: userData.ava_id || '',
          age: userData.age || 0,
          region: region(userData.region || 0),
        };

        if (userData.h_level) {
          sellerInfo.hLevel = userData.h_level;
        }
        if (userData.bust_size) {
          sellerInfo.bustSize = userData.bust_size;
        }

        return sellerInfo;
      }
    } catch (error) {
      console.error(
        'Exception in ServerFleaMarketService.getSellerInfo:',
        error,
      );
    }
    return null;
  }

  // お気に入り商品IDセット取得
  private async getFavoriteItemIds(
    userId: string,
    token?: string,
  ): Promise<Set<string>> {
    try {
      const { authOptions } = await import(
        '@/app/api/auth/[...nextauth]/options'
      );
      const session = await getServerSession(authOptions);
      const sessionToken = token || session?.user?.token;

      if (!sessionToken) {
        console.error(
          'ServerFleaMarketService.getFavoriteItemIds: No token available',
        );
        return new Set<string>();
      }

      const request = getFleaMarketFavoriteListRequest(
        sessionToken,
        userId,
        1,
        100,
      );

      const response = await this.client.post<{
        code: number;
        data: GetFleaMarketFavoriteListResponseData;
        message?: string;
      }>(this.apiUrl, request);

      if (response.code !== 0 || !response.data) {
        console.error('ServerFleaMarketService.getFavoriteItemIds: API error', {
          code: response.code,
          message: response.message,
        });
        return new Set<string>();
      }

      // item_id のセットを作成（item_info ではなく FavoriteItem 自体の item_id を使用）
      // 防御的に null/undefined をフィルタリング
      const itemIds = response.data
        .filter((favoriteItem) => favoriteItem?.item_id)
        .map((favoriteItem) => favoriteItem.item_id);
      return new Set<string>(itemIds);
    } catch (error) {
      console.error(
        'Exception in ServerFleaMarketService.getFavoriteItemIds:',
        error,
      );
      return new Set<string>();
    }
  }

  // 商品リストにお気に入りフラグを追加（private: 外部から直接呼び出し不要）
  private enrichItemsWithFavorites(
    items: FleaMarketItemWithFavoritesCamel[],
    favoriteIds: Set<string>,
  ): FleaMarketItemWithFavoritedFlagCamel[] {
    return items.map((itemInfo) => ({
      ...itemInfo,
      is_favorited: favoriteIds.has(itemInfo.item.itemId),
    }));
  }

  // 商品一覧をお気に入りフラグ付きで取得（データ加工含む）
  async getFleaMarketItemsWithFavorites(
    sellerId: string,
    viewerUserId?: string,
    viewerToken?: string,
    options: {
      category?: string;
      limit?: number;
      page?: number;
      salesStatus?: string;
    } = {},
  ): Promise<{ items: FleaMarketItemWithFavoritedFlagCamel[] }> {
    // 1. 商品一覧とお気に入り商品IDを並列取得
    const [{ items }, favoriteIds] = await Promise.all([
      this.getFleaMarketItems(sellerId, undefined, options),
      viewerUserId && viewerToken
        ? this.getFavoriteItemIds(viewerUserId, viewerToken)
        : Promise.resolve(new Set<string>()),
    ]);

    // 2. 商品にお気に入りフラグを付与
    const enrichedItems = this.enrichItemsWithFavorites(items, favoriteIds);

    return { items: enrichedItems };
  }
}

// ブラウザの実装
export class ClientFleaMarketService implements FleaMarketService {
  constructor(private readonly client: HttpClient) {}

  async getMainPageData(
    token?: string,
    userId?: string,
  ): Promise<FleaMarketMainResponseCamel> {
    try {
      const itemsPromise = this.getFleaMarketItems('', token, {
        category: 'all',
        limit: 10,
        page: 1,
      });

      const favoritesPromise =
        token && userId
          ? this.getFavoriteItems(token, { limit: 10, page: 1, userId })
          : Promise.resolve({ favorites: [], totalCount: 0 });

      const transactionsPromise =
        token && userId
          ? this.getTransactions(token, userId, { limit: 10, page: 1 })
          : Promise.resolve({ transactions: [], totalCount: 0 });

      const [itemsResponse, favoritesResponse, transactionsResponse] =
        await Promise.all([
          itemsPromise,
          favoritesPromise,
          transactionsPromise,
        ]);

      // HTTPクライアントがsnake_case → camelCaseに自動変換するため、
      // favoritesも実際はcamelCase形式になっている
      return {
        items: itemsResponse.items,
        favorites:
          favoritesResponse.favorites as unknown as FleaMarketItemWithFavoritesCamel[],
        transactions: transactionsResponse.transactions,
        totalItems: itemsResponse.totalCount || 0,
        totalFavorites: favoritesResponse.totalCount || 0,
        totalTransactions: transactionsResponse.totalCount || 0,
      };
    } catch (error) {
      console.error(
        'Exception in ClientFleaMarketService.getMainPageData:',
        error,
      );
      return {
        items: [],
        favorites: [],
        transactions: [],
        totalItems: 0,
        totalFavorites: 0,
        totalTransactions: 0,
      };
    }
  }

  async getFavoriteItems(
    token: string,
    options: { page?: number; limit?: number; userId?: string } = {},
  ): Promise<FleaMarketFavoriteListResponse> {
    const { page = 1, limit = 10, userId = '' } = options;

    try {
      const request = getFleaMarketFavoriteListRequest(
        token,
        userId,
        page,
        limit,
      );

      const response = await this.client.post<{
        code: number;
        data: GetFleaMarketFavoriteListResponseData;
        message?: string;
      }>(GET_FLEA_MARKET_FAVORITE_LIST, request);

      if (response.code !== 0 || !response.data) {
        return { favorites: [], totalCount: 0 };
      }

      // Transform FavoriteItem[] to FleaMarketItemWithFavorites[]
      const transformedFavorites = response.data.map((favoriteItem) => ({
        item: favoriteItem.item_info,
        fav_count: favoriteItem.fav_count || 0,
      }));

      return {
        favorites: transformedFavorites,
        totalCount: response.data.length,
        hasMore: response.data.length >= limit,
      };
    } catch (error) {
      console.error(
        'Exception in ClientFleaMarketService.getFavoriteItems:',
        error,
      );
      return { favorites: [], totalCount: 0 };
    }
  }

  async getTransactions(
    token: string,
    userId: string,
    options: { page?: number; limit?: number } = {},
  ): Promise<FleaMarketTransactionListResponse> {
    const { page = 1, limit = 10 } = options;

    try {
      const request = getFleaMarketTransactionListRequest(
        token,
        userId,
        page,
        limit,
      );

      const response = await this.client.post<{
        code: number;
        data: {
          transactions: TransactionWithItem[];
          total: number;
        } | null;
        message?: string;
      }>(GET_FLEA_MARKET_TRANSACTION_LIST, request);

      if (response.code !== 0 || !response.data) {
        return { transactions: [], totalCount: 0 };
      }

      return {
        transactions: response.data.transactions,
        totalCount: response.data.total,
        hasMore: response.data.transactions.length >= limit,
      };
    } catch (error) {
      console.error(
        'Exception in ClientFleaMarketService.getTransactions:',
        error,
      );
      return { transactions: [], totalCount: 0 };
    }
  }

  async getFleaMarketItems(
    sellerId: string,
    _token?: string,
    options: {
      category?: string;
      limit?: number;
      page?: number;
      salesStatus?: string;
      bookmarkOnly?: boolean;
      userId?: string;
    } = {},
  ): Promise<FleaMarketItemsResponseCamel> {
    const {
      category = 'all',
      limit = 8,
      page = 1,
      salesStatus = 'all',
      bookmarkOnly,
      userId,
    } = options;

    try {
      const request = getFleaMarketItemListRequest(
        category,
        limit,
        page,
        salesStatus === 'all' ? undefined : salesStatus,
        sellerId,
        bookmarkOnly,
        userId,
      );

      const response = await this.client.post<{
        code: number;
        data: GetFleaMarketItemListResponseData;
        message?: string;
      }>(GET_FLEA_MARKET_ITEM_LIST, request);

      if (response.code !== 0 || !response.data) {
        return { items: [] };
      }

      // HTTPクライアントがsnake_case → camelCaseに自動変換するため、
      // 実際のデータはcamelCase形式になっている
      return {
        items: response.data as unknown as FleaMarketItemWithFavoritesCamel[],
        totalCount: response.data.length,
        hasMore: response.data.length >= limit,
      };
    } catch (error) {
      console.error(
        'Exception in ClientFleaMarketService.getFleaMarketItems:',
        {
          sellerId,
          category,
          limit,
          page,
          salesStatus,
          bookmarkOnly,
          error: error instanceof Error ? error.message : error,
        },
      );
      return { items: [] };
    }
  }

  // 出品者情報取得（Board実装と統一パターン）
  async getSellerInfo(
    userId: string,
    sellerId: string,
  ): Promise<FleaMarketSellerInfo | null> {
    try {
      const response = await this.client.post<
        ResponseData<MyUserInfoWithBookmark>
      >(GET_USER_INF_FOR_WEB_WITH_USER_ID, {
        myId: userId,
        partnerId: sellerId,
      });

      if (response.type === 'success' && response.userId) {
        const sellerInfo: FleaMarketSellerInfo = {
          userId: response.userId,
          userName: response.userName || '名無し',
          avatarId: response.avatarId || '',
          age: response.age || 0,
          region: response.region as Region, // API returns string region name, cast to Region type
        };

        if (response.hLevel) {
          sellerInfo.hLevel = response.hLevel;
        }
        if (response.bustSize) {
          sellerInfo.bustSize = response.bustSize;
        }

        return sellerInfo;
      }
    } catch (error) {
      console.error(
        'Exception in ClientFleaMarketService.getSellerInfo:',
        error,
      );
    }
    return null;
  }
}

// ブラウザ・Nextサーバー用のServiceを生成して返すFactory関数
export function createFleaMarketService(client: HttpClient): FleaMarketService {
  if (client.getContext() === Context.SERVER) {
    return new ServerFleaMarketService(client);
  } else {
    return new ClientFleaMarketService(client);
  }
}

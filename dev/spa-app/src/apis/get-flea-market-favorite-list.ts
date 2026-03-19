import type { FavoriteItem } from '@/types/fleamarket/favorite';
import type { JamboRequest } from '@/types/JamboApi';

type GetFleaMarketFavoriteListRequest = JamboRequest & {
  readonly api: 'get_flea_market_favorite_list';
  readonly token: string;
  readonly user_id: string;
  readonly page?: number;
  readonly limit?: number;
};

export type GetFleaMarketFavoriteListResponseData = FavoriteItem[];

export const getFleaMarketFavoriteListRequest = (
  token: string,
  userId: string,
  page: number = 1,
  limit: number = 20,
): GetFleaMarketFavoriteListRequest => ({
  api: 'get_flea_market_favorite_list',
  token,
  user_id: userId,
  page,
  limit,
});

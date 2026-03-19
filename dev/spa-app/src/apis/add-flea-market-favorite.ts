import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type AddFleaMarketFavoriteRequest = JamboRequest & {
  readonly api: 'add_flea_market_favorite';
  readonly token: string;
  readonly user_id: string;
  readonly item_id: string;
};

export type AddFleaMarketFavoriteResponseData = JamboResponseData & {};

export const addFleaMarketFavoriteRequest = (
  token: string,
  userId: string,
  itemId: string,
): AddFleaMarketFavoriteRequest => ({
  api: 'add_flea_market_favorite',
  token,
  user_id: userId,
  item_id: itemId,
});

import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type RemoveFleaMarketFavoriteRequest = JamboRequest & {
  readonly api: 'remove_flea_market_favorite';
  readonly token: string;
  readonly user_id: string;
  readonly item_id: string;
};

export type RemoveFleaMarketFavoriteResponseData = JamboResponseData & {};

export const removeFleaMarketFavoriteRequest = (
  token: string,
  userId: string,
  itemId: string,
): RemoveFleaMarketFavoriteRequest => ({
  api: 'remove_flea_market_favorite',
  token,
  user_id: userId,
  item_id: itemId,
});

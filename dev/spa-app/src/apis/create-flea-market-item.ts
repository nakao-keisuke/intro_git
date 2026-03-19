import type { JamboResponseData } from '@/types/JamboApi';

export type CreateFleaMarketItemResponseData = JamboResponseData & {};

export function createFleaMarketItemRequest(
  token: string,
  title: string,
  description: string,
  images: string[],
  price: number,
  category: string,
) {
  return {
    api: 'create_flea_market_item',
    token: token,
    title: title,
    description: description,
    images: images,
    price: price,
    category: category,
  };
}

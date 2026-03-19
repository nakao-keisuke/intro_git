import type { ResponseData } from '@/types/NextApi';

export type StampImage = {
  readonly url: string;
  readonly categoryId: string;
  readonly name: string;
  readonly number: number;
};

export type StickerRouteResponse = ResponseData<{
  readonly stickers: StampImage[];
  readonly timestamp: number;
}>;

import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type GetGalleryItemsRequest = JamboRequest & {
  readonly api: 'get_gallery_items';
  readonly token: string;
  is_image: boolean;
  take: number;
  skip: number;
};

export type GetGalleryItemsResponseElementData = JamboResponseData & {
  readonly favorite_gallery_list: Array<{
    readonly opened_content: {
      readonly purchased_time: string;
      readonly file_id: string;
      readonly purchaser_id: string;
      readonly author_id: string;
    };
    readonly gallery_user: {
      readonly abt: string;
      readonly is_blocked: boolean;
      readonly user_id: string;
      readonly user_name: string;
      readonly instant_call_waiting: boolean;
      readonly voice_call_waiting: boolean;
      readonly ava_id: string;
      readonly region: number;
      readonly age: number;
      readonly video_call_waiting: boolean;
    };
  }>;
  readonly non_favorite_gallery_list: Array<{
    readonly opened_content: {
      readonly purchased_time: string;
      readonly file_id: string;
      readonly purchaser_id: string;
      readonly author_id: string;
    };
    readonly gallery_user: {
      readonly abt: string;
      readonly is_blocked: boolean;
      readonly user_id: string;
      readonly user_name: string;
      readonly instant_call_waiting: boolean;
      readonly voice_call_waiting: boolean;
      readonly ava_id: string;
      readonly region: number;
      readonly age: number;
      readonly video_call_waiting: boolean;
    };
  }>;
};

export const getGalleryRequest = (
  token: string,
  is_image: boolean,
): GetGalleryItemsRequest => {
  return {
    api: 'get_gallery_items',
    token: token,
    is_image: is_image,
    take: 100,
    skip: 0,
  };
};

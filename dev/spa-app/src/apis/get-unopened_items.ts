import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { JamboRequest } from '@/types/JamboApi';

type GetUnOpenItemsRequest = JamboRequest & {
  readonly api: typeof JAMBO_API_ROUTE.GET_UNOPENED_ITEM;
  readonly token: string;
  readonly is_image: boolean;
  readonly skip?: number;
  readonly take?: number;
};

export type GetUnOpenGalleryItemsResponseElementData = Array<{
  unopened_content: {
    duration: number;
    favorites: number;
    file_id: string;
    sent_date: string;
    views: number;
  };
  user: {
    abt: string;
    is_blocked: boolean;
    user_id: string;
    user_name: string;
    instant_call_waiting: boolean;
    voice_call_waiting: boolean;
    ava_id: string;
    region: number;
    age: number;
    video_call_waiting: boolean;
  };
}>;

export const getUnOpenGalleryRequest = (
  token: string,
  is_image: boolean,
  skip: number,
  take: number,
): GetUnOpenItemsRequest => {
  return {
    api: JAMBO_API_ROUTE.GET_UNOPENED_ITEM,
    token: token,
    is_image: is_image,
    skip,
    take,
  };
};

import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type ChangeGalleryItemFavoriteStatusRequest = JamboRequest & {
  readonly api: typeof JAMBO_API_ROUTE.CHANGE_GALLERY_ITEM_FAVORITE_STATUS;
  readonly token: string;
  readonly is_favorite: boolean;
  readonly file_id: string;
};

export type ChangeGalleryItemFavoriteStatusResponseElementData =
  JamboResponseData & {};

export const getGalleryItemFavoriteRequest = (
  token: string,
  is_favorite: boolean,
  file_id: string,
): ChangeGalleryItemFavoriteStatusRequest => {
  return {
    api: JAMBO_API_ROUTE.CHANGE_GALLERY_ITEM_FAVORITE_STATUS,
    token: token,
    is_favorite: is_favorite,
    file_id: file_id,
  };
};

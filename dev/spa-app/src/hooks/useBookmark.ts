import { useState } from 'react';
import type { BookmarkRouteResponse } from '@/apis/http/bookmark';
import { HTTP_ADD_BOOKMARK, HTTP_DELETE_BOOKMARK } from '@/constants/endpoints';
import { event } from '@/constants/ga4Event';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import { trackEvent } from '@/utils/eventTracker';

type UseBookmarkReturn = {
  isBookmarked: boolean;
  bookmarkCooldown: boolean;
  addBookmark: () => Promise<void>;
  removeBookmark: () => Promise<void>;
};

/**
 * ブックマーク機能のCustom Hook
 * @param partnerId - パートナーID
 * @param initialBookmark - 初期ブックマーク状態
 * @param userId - ユーザーID（GA4トラッキング用）
 */
export function useBookmark(
  partnerId: string,
  initialBookmark: boolean = false,
  userId?: string,
): UseBookmarkReturn {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmark);
  const [bookmarkCooldown, setBookmarkCooldown] = useState(false);

  const addBookmark = async () => {
    if (bookmarkCooldown) return;

    setIsBookmarked(true);
    setBookmarkCooldown(true);

    try {
      const client = new ClientHttpClient();
      const response = await client.post<BookmarkRouteResponse>(
        HTTP_ADD_BOOKMARK,
        { partnerId },
      );
      if (response.type === 'error') {
        alert(response.message);
        setIsBookmarked(false);
      } else {
        trackEvent(event.ADD_FAVORITE, {
          partner_id: partnerId,
          user_id: userId,
        });
      }
    } catch (error) {
      console.error('Bookmark addition failed', error);
      setIsBookmarked(false);
    } finally {
      setTimeout(() => setBookmarkCooldown(false), 1000);
    }
  };

  const removeBookmark = async () => {
    if (bookmarkCooldown) return;

    setIsBookmarked(false);
    setBookmarkCooldown(true);

    try {
      const client = new ClientHttpClient();
      const response = await client.post<BookmarkRouteResponse>(
        HTTP_DELETE_BOOKMARK,
        { partnerId },
      );
      if (response.type === 'error') {
        alert(response.message);
        setIsBookmarked(true);
      } else {
        trackEvent(event.REMOVE_FAVORITE, {
          partner_id: partnerId,
          user_id: userId,
        });
      }
    } catch (error) {
      console.error('Bookmark removal failed', error);
      setIsBookmarked(true);
    } finally {
      setTimeout(() => setBookmarkCooldown(false), 1000);
    }
  };

  return { isBookmarked, bookmarkCooldown, addBookmark, removeBookmark };
}

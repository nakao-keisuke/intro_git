import { useCallback, useEffect, useState } from 'react';
import {
  incrementMessageCount,
  resetUserCount,
} from '@/utils/favoriteAlertStorage';

export type UseFavoriteAlertParams = {
  partnerId: string;
  isBookmarked: boolean;
};

export type UseFavoriteAlertReturn = {
  showModal: boolean;
  closeModal: () => void;
  handleMessageSent: () => void;
  handleBookmarkAdded: () => void;
};

/**
 * お気に入りアラート機能のカスタムフック
 *
 * @param partnerId - 送信先のユーザーID
 * @param isBookmarked - 相手がお気に入り登録されているか
 *
 */
export const useFavoriteAlert = ({
  partnerId,
  isBookmarked,
}: UseFavoriteAlertParams): UseFavoriteAlertReturn => {
  const [showModal, setShowModal] = useState(false);

  /**
   * メッセージ送信時の処理
   * お気に入り未登録の場合のみカウントし、3通目でモーダル表示
   */
  const handleMessageSent = useCallback(() => {
    if (isBookmarked) {
      return;
    }

    // incrementMessageCount内でlastShownDateが自動的に設定される
    const shouldShowModal = incrementMessageCount(partnerId);

    if (shouldShowModal) {
      setShowModal(true);
    }
  }, [partnerId, isBookmarked]);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleBookmarkAdded = useCallback(() => {
    resetUserCount(partnerId);
    setShowModal(false);
  }, [partnerId]);

  useEffect(() => {
    if (isBookmarked) {
      setShowModal(false);
    }
  }, [isBookmarked]);

  return {
    showModal,
    closeModal,
    handleMessageSent,
    handleBookmarkAdded,
  };
};

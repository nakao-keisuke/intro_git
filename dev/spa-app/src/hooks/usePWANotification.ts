import { useCallback, useEffect, useState } from 'react';
import { isPWA } from '@/libs/isPWA';
import { getCookie, setCookie } from '@/utils/clientCookie';
import { getCurrentDateInJapan } from '@/utils/timeUti';

/**
 * PWA起動時に通知許可モーダルを表示するカスタムフック
 */
export const usePWANotification = () => {
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const checkShouldShowModal = useCallback((): boolean => {
    // 1. PWA起動チェック
    const isPWACheck = isPWA();
    if (!isPWACheck) {
      return false;
    }

    // 2. 通知APIサポートチェック
    const notificationSupported = typeof Notification !== 'undefined';
    if (!notificationSupported) {
      return false;
    }

    // 3. 通知許可状態チェック（許可済みの場合は表示しない）
    const permission = Notification.permission;
    if (permission === 'granted') {
      return false;
    }

    // 4. 1日1回チェック
    const today = getCurrentDateInJapan();
    const lastShownDate = getCookie('lastPWANotificationDate');

    if (lastShownDate === today) {
      return false;
    }

    return true;
  }, []);

  useEffect(() => {
    // 表示条件チェック
    const shouldShowModal = checkShouldShowModal();

    if (shouldShowModal) {
      setShowNotificationModal(true);
    }
  }, [checkShouldShowModal]);

  const handleModalClose = (): void => {
    setShowNotificationModal(false);

    // 表示日を記録（モーダルを閉じた時点で記録）
    const today = getCurrentDateInJapan();
    setCookie('lastPWANotificationDate', today);
  };

  const setShowNotificationModalDirectly = useCallback(
    (value: boolean): void => {
      setShowNotificationModal(value);
    },
    [],
  );

  return {
    showNotificationModal,
    handleModalClose,
    setShowNotificationModalDirectly,
  };
};

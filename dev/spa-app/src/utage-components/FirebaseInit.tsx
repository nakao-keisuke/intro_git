import { useSession } from '#/hooks/useSession';
import { useEffect } from 'react';
import { isNativeApplication } from '@/constants/applicationId';
import { registerFCMServiceWorker } from '@/utils/fcm';

export const FirebaseInit = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    // サービスワーカーを登録する条件
    // ネイティブアプリ（WebView）の場合はスキップ
    // → ネイティブ側でAPNs/FCMトークンを管理するため、Web FCMトークンの登録は不要
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      status !== 'authenticated' ||
      !session ||
      isNativeApplication()
    ) {
      return;
    }

    // 通知許可済みユーザー: 自動的にFCMトークンを再登録
    // 通知未許可ユーザー: PWA起動時の自作モーダル経由で登録（重複防止）
    if (
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted'
    ) {
      registerFCMServiceWorker();
    }
  }, [status, session]);

  return null;
};

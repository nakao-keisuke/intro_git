import { getMessaging, getToken } from 'firebase/messaging';
import { HTTP_UPDATE_FCM_TOKEN } from '@/constants/endpoints';
import { trackEvent } from './eventTracker';
import { firebaseApp } from './firebase';
import { postToNext } from './next';

/**
 * 通知許可を取得
 * @returns {NotificationPermission} 通知許可
 */
const getNotificationPermission = async (): Promise<NotificationPermission> => {
  // 通知がサポートされていない場合は拒否
  if (typeof Notification === 'undefined') {
    return 'denied';
  }

  // 通知設定表示可能な状態の場合、Reproイベントを送信
  if (Notification.permission === 'default') {
    trackEvent('SHOW_NOTIFICATION_PERMISSION');
  }

  const permission = await Notification.requestPermission();
  return permission;
};

/**
 * FCMトークンを生成
 * @returns {Promise<string | null>} FCMトークン
 */
const generateFCMToken = async (): Promise<string | null> => {
  try {
    // トークンを取得
    const token = await getToken(getMessaging(firebaseApp), {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY as string,
    });

    if (token) {
      // トークンが変更された場合のみ更新, DBにFCMトークンを保存
      const response = await postToNext<Record<string, never>>(
        HTTP_UPDATE_FCM_TOKEN,
        {
          fcmToken: token,
        },
      );
      if (response.type === 'success') {
        localStorage.setItem('fcmToken', token);
        return token;
      }
      console.error('Failed to update FCM token:', response);
    }
  } catch (error) {
    console.error('Error registering service worker:', error);
  }
  return null;
};

/**
 * 現在のページがマイページかどうかを判定
 * @returns {boolean} マイページならtrue
 */
const _isMyPage = (): boolean => {
  // クライアントサイドでない場合は早期リターン
  if (typeof window === 'undefined') return false;

  const pathname = window.location.pathname;
  // マイページのパスにマッチするかチェック
  return pathname.match(/^\/my-page(\/.*)?$/) !== null;
};

/**
 * FCMサービスワーカーを登録
 */
export const registerFCMServiceWorker = async () => {
  try {
    // サービスワーカーを登録
    await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/firebase-cloud-messaging-push-scope',
    });
    // 通知許可を取得
    const permission = await getNotificationPermission();
    const storedPermission = localStorage.getItem('notificationPermission');

    // 許可状態をローカルストレージに保存（'grant'が保存済みの場合は上書きしない）
    if (storedPermission !== 'grant') {
      localStorage.setItem('notificationPermission', permission);
    }

    if (permission === 'granted') {
      // 通知許可のReproイベントを送信
      if (storedPermission !== 'grant') {
        localStorage.setItem('notificationPermission', 'grant');
        trackEvent('APPROVE_NOTIFICATION');
      }
      // FCMトークンを生成
      await generateFCMToken();
    }
  } catch (error) {
    console.error('FCMサービスワーカー登録エラー:', error);
  }
};

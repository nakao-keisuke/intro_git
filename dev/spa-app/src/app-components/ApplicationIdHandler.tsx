import { useSession } from '#/hooks/useSession';
import { useEffect } from 'react';
import {
  APPLICATION_ID,
  APPLICATION_ID_STORAGE_KEY,
  getNativeApplicationIdFromUserAgent,
  setApplicationId,
} from '@/constants/applicationId';
import { useResolveNativeApplicationId } from '@/hooks/useResolveNativeApplicationId';

/**
 * 認証状態に応じてapplicationIdをlocalStorageで管理するコンポーネント
 * - 認証済みかつapplicationIdが未設定の場合のみ設定
 * - ReactNativeWebView内ではデバイス判定してiOS(72)/Android(76)を正しく設定
 * - それ以外ではWeb版(15)を設定
 * - 一度設定されたapplicationIdは変更しない（ログアウト時も保持）
 */
export const ApplicationIdHandler = () => {
  const { status } = useSession();
  const resolveNativeAppId = useResolveNativeApplicationId();

  useEffect(() => {
    if (status !== 'authenticated') return;
    const currentId = localStorage.getItem(APPLICATION_ID_STORAGE_KEY);
    if (currentId) return;

    if (window.ReactNativeWebView) {
      // デバイス判定してiOS(72)/Android(76)を正しくセット
      resolveNativeAppId()
        .then(setApplicationId)
        .catch(() => {
          // フォールバック: User-Agentベースで判定
          setApplicationId(getNativeApplicationIdFromUserAgent());
        });
    } else {
      setApplicationId(APPLICATION_ID.WEB);
    }
  }, [status, resolveNativeAppId]);

  return null;
};

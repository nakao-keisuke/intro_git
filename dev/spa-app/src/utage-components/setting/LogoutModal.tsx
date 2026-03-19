import { useRouter } from 'next/router';
import { useAuthStore } from '#/stores/authStore';
import { memo, type ReactNode, useState } from 'react';
import {
  isNativeApplication,
  NATIVE_LOGIN_PATH,
} from '@/constants/applicationId';
import styles from '@/styles/setting/LogoutModal.module.css';

type Props = {
  onClose: () => void;
  children?: ReactNode;
};

const LogoutModal: React.FC<Props> = memo(({ onClose }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const router = useRouter();

  const onClickLogout = async () => {
    if (isLoggingOut) return; // 重複実行を防ぐ

    setIsLoggingOut(true);
    setError(null);

    try {
      await signOut({
        redirect: false, // リダイレクトを無効にして手動でリダイレクト
      });

      // ログアウト成功時のみリダイレクト
      const redirectUrl = isNativeApplication() ? NATIVE_LOGIN_PATH : '/';
      router.push(redirectUrl);
    } catch (error) {
      console.error('ログアウトエラー:', error);
      setError(
        'ログアウトに失敗しました。しばらく時間をおいて再度お試しください。',
      );
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleClickOutside}>
      <div className={styles.modalContent}>
        <center>
          <p className={styles.top}>ログアウトしてもよろしいですか？</p>
        </center>

        {error && (
          <div style={{ color: 'red', fontSize: '14px', margin: '10px 0' }}>
            {error}
          </div>
        )}

        <p className={styles.list}>
          <a
            onClick={onClickLogout}
            className={styles.logout}
            style={{
              opacity: isLoggingOut ? 0.6 : 1,
              pointerEvents: isLoggingOut ? 'none' : 'auto',
            }}
          >
            {isLoggingOut ? 'ログアウト中...' : 'ログアウトする'}
          </a>

          <a
            onClick={onClose}
            className={styles.close}
            style={{
              opacity: isLoggingOut ? 0.6 : 1,
              pointerEvents: isLoggingOut ? 'none' : 'auto',
            }}
          >
            閉じる
          </a>
        </p>
      </div>
    </div>
  );
});

LogoutModal.displayName = 'LogoutModal';

export default LogoutModal;

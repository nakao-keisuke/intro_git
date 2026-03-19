// Image component removed (use <img> directly);
// TODO: i18n - import { useTranslations } from '#/i18n';
import GoogleLogo from 'public/logo_google.webp';
import type React from 'react';
import { useAuth } from '@/hooks/useAuth';
import styles from '@/styles/signup/SignupPage.module.css';

export const GoogleAuthComponent = ({
  setErrorMessage,
  setFormType,
  setLoading,
}: {
  setErrorMessage: (errorMessage: string | null) => void;
  setFormType: (formType: 'phone' | 'google' | undefined) => void;
  setLoading: (loading: boolean) => void;
  icon?: React.ReactNode;
}) => {
  const { handleGoogleAuth } = useAuth();
  const t = useTranslations('signup');

  return (
    <button
      className={`${styles.authButton} ${styles.googleButton}`}
      onClick={() => {
        setFormType('google');
        setLoading(true);
        handleGoogleAuth({
          setErrorMessage,
          setLoading,
          setFormType,
        });
      }}
    >
      <span className={styles.googleButtonIcon}>
        <Image src={GoogleLogo} alt="Google" width={25} height={25} />
      </span>
      <span className={styles.googleButtonText}>{t('googleRegister')}</span>
    </button>
  );
};

import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import liff from '@line/liff';
// Image component removed (use <img> directly);
import router from 'next/router';
import { getSession, signIn, useSession } from 'next-auth/react';
import { useLocale, useTranslations } from '#/i18n/stub';
import type { SealedDataType } from '@/apis/http/unseal';
import {
  UNSEAL_FINGER_PRINT_DATA,
  UPDATE_CALL_WAITING,
} from '@/constants/endpoints';
import { getGoogleClientId } from '@/libs/googleApi';
import styles from '@/styles/signup/SignupPage.module.css';
import { getCmCodeFromCookie } from '@/utils/cmCode';
import { postToNext } from '@/utils/next';
import { generateRandomUserName } from '@/utils/randomUserName';
import { fireRegistrationEvents } from '@/utils/registration';

export const LineRegisterButton = ({
  setErrorMessage,
  setFormType,
  setLoading,
}: {
  setErrorMessage: (errorMessage: string) => void;
  setFormType: (formType: 'phone' | 'google' | undefined) => void;
  setLoading: (loading: boolean) => void;
}) => {
  const t = useTranslations('signup');
  const locale = useLocale();
  const { getData } = useVisitorData(
    {},
    {
      immediate: false,
    },
  );
  const { data: session } = useSession();

  return (
    <button
      className={styles.lineButton}
      onClick={async () => {
        setLoading(true);
        await liff.init({
          liffId: import.meta.env.VITE_LINE_LIFF_ID as string,
        });

        if (!liff.isLoggedIn()) {
          return liff.login({
            redirectUri: `${window.location.origin}/line/callback?regType=register`,
          });
        }

        const profile = await liff.getProfile();

        // 登録処理
        const fpData = await getData({ ignoreCache: false });
        const unsealedFpData = await postToNext<{
          data: SealedDataType;
        }>(UNSEAL_FINGER_PRINT_DATA, {
          sealedData: fpData.sealedResult,
        });

        const visitorId =
          unsealedFpData.type === 'success'
            ? unsealedFpData.data.visitorId
            : undefined;

        const cmCode = getCmCodeFromCookie();
        const googleClientId = await getGoogleClientId();
        const result = await signIn('register', {
          redirect: false,
          age: 20,
          region: '東京',
          name: generateRandomUserName(locale),
          cmCode,
          visitorId,
          applicationId: '15',
          googleClientId,
          lineId: profile.userId,
        });

        if (result?.error) {
          setErrorMessage(result.error);
          setFormType(undefined);
          setLoading(false);
          return;
        }

        const updatedSession = await getSession();
        if (
          typeof window !== 'undefined' &&
          window.webkit?.messageHandlers?.nativeHandler
        ) {
          const message = {
            type: 'REGISTER_SUCCESS',
            payload: { userId: updatedSession?.user?.id },
          };
          // IOSネイティブアプリにユーザーIDを送信
          window.webkit.messageHandlers.nativeHandler.postMessage(message);
        }

        // ローカルストレージに登録情報を保存する
        if (session) {
          fireRegistrationEvents(session);
        }

        //探す画面への遷移・チュートリアルモーダルの表示
        await router.replace('/?showTutoModal=true'); // ページ遷移を待つ

        try {
          const response = await postToNext(UPDATE_CALL_WAITING, {
            voiceCallWaiting: true,
            videoCallWaiting: true,
          });
          if (response.type === 'error') {
            alert(response.message);
            return;
          }
        } catch (error) {
          console.error('Failed to update voice call waiting', error);
        }
      }}
    >
      <Image src="/logo_line.webp" alt="LINE" width={24} height={24} />
      {t('lineRegister')}
    </button>
  );
};

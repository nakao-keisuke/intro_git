import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { setGoogleAnalyticsUserId } from '@/app/components/GoogleAnalytics';
import { APPLICATION_ID, setApplicationId } from '@/constants/applicationId';
import { getGoogleClientId } from '@/libs/googleApi';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import { createClientSignupService } from '@/services/signup/signupService';
import { useAuthStore } from '@/stores/authStore';
import { getCmCodeFromCookie } from '@/utils/cmCode';
import { auth, provider } from '@/utils/firebase';
import { sendFingConversion } from '@/utils/ga4';
import { generateRandomUserName } from '@/utils/randomUserName';
import { fireRegistrationEvents } from '@/utils/registration';
import { trackTikTokCompleteRegistration } from '@/utils/tiktokTracking';
import { useSession } from './useSession';

/**
 * 認証関連のフック
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const locale = 'ja'; // SPA版ではデフォルトロケールを使用
  const { getData } = useVisitorData(
    {},
    {
      immediate: false,
    },
  );
  const { data: session } = useSession();
  const authStore = useAuthStore();

  // Services
  const httpClient = new ClientHttpClient();
  const signupService = createClientSignupService(httpClient);

  /**
   * Googleで登録する
   */
  const handleGoogleAuth = async ({
    setLoading,
    setErrorMessage,
    setFormType,
  }: {
    setLoading: (loading: boolean) => void;
    setErrorMessage: (errorMessage: string | null) => void;
    setFormType: (formType: 'phone' | 'google' | undefined) => void;
  }) => {
    try {
      setApplicationId(APPLICATION_ID.WEB);
      const cred = await signInWithPopup(auth, provider);
      if (!cred.user) {
        setErrorMessage('Googleでの登録に失敗しました。');
        setFormType(undefined);
        return;
      }

      // フィンガープリントから返却された暗号化データを復号化（エラーは無視）
      let visitorId: string | undefined;
      try {
        const fpData = await getData({ ignoreCache: false });
        const unsealedFpResult = await signupService.unsealFingerprintData(
          fpData.sealedResult || '',
        );

        if (!unsealedFpResult.success) {
          console.warn('FingerprintJS復号化に失敗:', unsealedFpResult.message);
        }
        visitorId = unsealedFpResult.data?.visitorId;
      } catch (fpError) {
        console.warn('FingerprintJS取得エラー（処理は継続）:', fpError);
        visitorId = undefined;
      }

      const cmCode = getCmCodeFromCookie();
      const googleClientId = await getGoogleClientId();

      // SPA版: APIに直接登録リクエストを送信
      const API_URL =
        import.meta.env.VITE_API_URL || 'http://app.stg-jambo.com:9119';
      const registerResponse = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: 20,
          region: '東京',
          name: generateRandomUserName(locale),
          cmCode,
          visitorId,
          applicationId: '15',
          googleAccountId: cred.user.uid,
          googleClientId,
          email: cred.user.email ?? '',
        }),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json().catch(() => null);
        setErrorMessage(
          errorData?.message || 'Googleでの登録に失敗しました。',
        );
        setFormType(undefined);
        return;
      }

      const registerData = await registerResponse.json();

      // 認証ストアを更新
      if (registerData.token) {
        await authStore.autoLogin(registerData.token);
      }

      const updatedSession = authStore.getSession();

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

      // GA4にユーザーIDを設定
      if (updatedSession?.user?.id) {
        sessionStorage.setItem('ga_user_id', updatedSession.user.id);
        setGoogleAnalyticsUserId(updatedSession.user.id);
      }

      // TikTok Pixel: 会員登録完了イベント送信
      await trackTikTokCompleteRegistration(updatedSession?.user?.id);

      // Fing広告: コンバージョン送信（エラーは無視）
      try {
        await sendFingConversion(updatedSession?.user?.id);
      } catch (error) {
        console.error('Fing conversion failed:', error);
        // ユーザー登録処理は継続
      }

      //探す画面への遷移
      navigate('/girls/all');

      try {
        const updateResult = await signupService.updateCallWaiting(true, true);
        if (!updateResult.success) {
          alert(updateResult.message);
          return;
        }
      } catch (error) {
        console.error('Failed to update voice call waiting', error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleGoogleAuth,
  };
};

import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconCake,
  IconDeviceMobile,
  IconKey,
  IconLock,
  IconMapPin,
  IconX,
} from '@tabler/icons-react';
import Head from 'next/head';
// Image component removed (use <img> directly);
import { useNavigate } from '@tanstack/react-router';
import { getSession, signIn, useSession } from 'next-auth/react';
import { useLocale, useTranslations } from '#/i18n/stub';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ZodError } from 'zod';
import SuccessModal from '@/app/[locale]/(auth)/phone-verification/components/SuccessModal';
import { setGoogleAnalyticsUserId } from '@/app/components/GoogleAnalytics';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import { createPhoneVerificationService } from '@/services/phone-verification/phoneVerificationService';
import { createClientSignupService } from '@/services/signup/signupService';
import { getCmCodeFromCookie } from '@/utils/cmCode';
import { sendFingConversion } from '@/utils/ga4';
import { generateRandomUserName } from '@/utils/randomUserName';
import { displayRegionArray } from '@/utils/region';
import { fireRegistrationEvents } from '@/utils/registration';
import { trackTikTokCompleteRegistration } from '@/utils/tiktokTracking';
import Footer from '../Footer';
import Picker from './Picker';

const bannerPic = '/banner/signup_bonus_banner_1200pt.webp';
const logoPic = '/header/utage_logo.webp';

import { APPLICATION_ID, setApplicationId } from '@/constants/applicationId';
import { getGoogleClientId } from '@/libs/googleApi';
import {
  createSignupSchema,
  type SignupFormData,
  signupSchema,
} from '@/libs/validations/signupValidation';

const RESEND_COOLDOWN_SECONDS = 60;

export const PhoneAuthComponent = ({
  setErrorMessage,
  setFormType,
}: {
  setErrorMessage: (errorMessage: string | null) => void;
  setFormType: (formType: 'phone' | 'google' | undefined) => void;
}) => {
  const t = useTranslations('signup');
  const locale = useLocale();

  const localizedSchema = useMemo(
    () =>
      createSignupSchema({
        phoneRequired: t('validation.phoneRequired'),
        phoneMin: t('validation.phoneMin'),
        phoneMax: t('validation.phoneMax'),
        phoneDigitsOnly: t('validation.phoneDigitsOnly'),
        passwordMin: t('validation.passwordMin'),
        verificationCodeRequired: t('validation.verificationCodeRequired'),
        verificationCodeInvalid: t('validation.verificationCodeInvalid'),
        nameMin: t('validation.nameMin'),
        nameMax: t('validation.nameMax'),
        ageMinValue: t('validation.ageMinValue'),
        ageMaxValue: t('validation.ageMaxValue'),
        agreeTerms: t('validation.agreeTerms'),
      }),
    [t],
  );

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(localizedSchema),
    defaultValues: {
      phoneNumber: '',
      password: '',
      verificationCode: '',
      name: generateRandomUserName(locale),
      region: '東京',
      age: 20,
      agreeTerms: false,
    },
  });
  const router = useRouter();
  const { data: session } = useSession();
  const [codeSent, setCodeSent] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<{
    title: string;
    message: string;
  }>({
    title: '',
    message: '',
  });

  // Services
  const httpClient = new ClientHttpClient();
  const signupService = createClientSignupService(httpClient);
  const phoneVerificationService = createPhoneVerificationService(httpClient);

  // ページを閉じる処理
  const handleClose = () => {
    // 直前のページがある場合は戻る、ない場合はホームに移動
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  // 背景クリック時の処理
  const handleBackgroundClick = (e: React.MouseEvent) => {
    // クリックされた要素が背景の場合のみ閉じる
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };
  const [isRegionModalOpen, setRegionModalOpen] = useState(false);
  const [isAgeModalOpen, setAgeModalOpen] = useState(false);
  //   const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [errorDialog, setErrorDialog] = useState<{
    isOpen: boolean;
    message: string;
    showLoginButton: boolean;
  }>({
    isOpen: false,
    message: '',
    showLoginButton: false,
  });

  const closeErrorDialog = () => {
    setErrorDialog({ isOpen: false, message: '', showLoginButton: false });
  };
  const submissionLock = useRef(false);
  const { getData } = useVisitorData(
    {},
    {
      immediate: false,
    },
  );

  // クールダウンタイマーの管理
  useEffect(() => {
    if (cooldownTime <= 0) return;

    const timer = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownTime]);

  /**
   * 電話番号認証コードを送信するAPI
   * @param phoneNumber 電話番号
   * @returns APIレスポンス
   */
  const sendPhoneAuthCode = async (phoneNumber: string) => {
    try {
      const response =
        await phoneVerificationService.sendPhoneAuthCode(phoneNumber);
      return response;
    } catch (error) {
      console.error('電話番号認証コード送信エラー:', error);
      throw error;
    }
  };

  /**
   * 電話番号認証コードを検証するAPI
   * @param phoneNumber 電話番号
   * @param authCode 認証コード
   * @returns APIレスポンス
   */
  const verifyPhoneAuthCode = async (phoneNumber: string, authCode: string) => {
    try {
      const response = await phoneVerificationService.verifyPhoneAuthCode(
        phoneNumber,
        authCode,
      );
      return response;
    } catch (error) {
      console.error('認証コード検証エラー:', error);
      throw error;
    }
  };

  const isFormValid = () => {
    return (
      watch('phoneNumber') &&
      watch('phoneNumber').length >= 10 &&
      watch('password') &&
      watch('region') &&
      watch('age') &&
      watch('agreeTerms')
    );
  };

  const validateAndShowErrors = () => {
    if (!watch('phoneNumber') || watch('phoneNumber').length < 10) {
      setErrorMessage(t('enterValidPhone'));
      return;
    }
    if (!watch('password')) {
      setErrorMessage(t('enterPassword'));
      return;
    }
    if (!watch('region')) {
      setErrorMessage(t('selectRegion'));
      return;
    }
    if (!watch('age')) {
      setErrorMessage(t('selectAge'));
      return;
    }
    if (!watch('agreeTerms')) {
      setErrorMessage(t('agreeToTermsRequired'));
      return;
    }
  };

  const onSubmit = useCallback(
    async (data: SignupFormData) => {
      if (submissionLock.current) {
        return;
      }

      submissionLock.current = true; // 即座にフラグを設定

      try {
        setErrorMessage(null);
        setApplicationId(APPLICATION_ID.WEB);

        // フィンガープリントから返却された暗号化データを復号化（エラーは無視）
        let visitorId: string | undefined;
        try {
          const fpData = await getData({ ignoreCache: false });
          const unsealedFpResult = await signupService.unsealFingerprintData(
            fpData.sealedResult || '',
          );

          if (!unsealedFpResult.success) {
            console.warn(
              'FingerprintJS復号化に失敗:',
              unsealedFpResult.message,
            );
          }
          visitorId = unsealedFpResult.data?.visitorId;
        } catch (fpError) {
          console.warn('FingerprintJS取得エラー（処理は継続）:', fpError);
          visitorId = undefined;
        }

        // データのバリデーション
        signupSchema.parse(data);

        const cmCode = getCmCodeFromCookie();
        const googleClientId = await getGoogleClientId();
        const result = await signIn('register', {
          redirect: false,
          age: data.age,
          region: data.region,
          name: data.name,
          cmCode,
          visitorId,
          applicationId: '15',
          phoneNumber: data.phoneNumber,
          password: data.password,
          googleClientId,
        });

        if (result?.error) {
          setErrorMessage(result.error);
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
        router.replace('/girls/all');

        try {
          const updateResult = await signupService.updateCallWaiting(
            true,
            true,
          );
          if (!updateResult.success) {
            alert(updateResult.message);
            return;
          }
        } catch (error) {
          console.error('Failed to update voice call waiting', error);
        }
      } catch (error) {
        if (error instanceof ZodError) {
          // フォーム全体のエラーメッセージとして設定
          console.error('ZodError:', error);
          // エラーのフィールドとメッセージをログに出力
          Object.entries(error.formErrors.fieldErrors).forEach(
            ([field, messages]) => {
              console.error(`Field: ${field}, Messages: ${messages}`);
            },
          );

          setErrorMessage(
            error.formErrors.fieldErrors.name?.[0] ||
              error.formErrors.fieldErrors.region?.[0] ||
              error.formErrors.fieldErrors.age?.[0] ||
              error.formErrors.fieldErrors.phoneNumber?.[0] ||
              error.formErrors.fieldErrors.verificationCode?.[0] ||
              error.formErrors.fieldErrors.password?.[0] ||
              t('inputError'),
          );
        } else {
          console.error('その他のエラー:', error);
          setErrorMessage(t('registrationError'));
        }
      } finally {
        submissionLock.current = false; // フラグを解除
      }
    },
    [getData, router, session],
  );

  const handleSendVerification = useCallback(
    async (phoneNumber: string) => {
      try {
        setErrorMessage(null);

        // 入力画面での全フィールドのバリデーション（認証コード以外）
        const formData = {
          phoneNumber,
          password: watch('password'),
          verificationCode: '', // 空文字でOK（この時点では検証しない）
          name: watch('name'),
          region: watch('region'),
          age: watch('age'),
          agreeTerms: watch('agreeTerms'),
        };

        try {
          // phoneNumber, password, region, age, agreeTermsのみをバリデーション
          const requiredFieldsSchema = signupSchema.pick({
            phoneNumber: true,
            password: true,
            region: true,
            age: true,
            agreeTerms: true,
          });

          requiredFieldsSchema.parse(formData);
        } catch (error) {
          if (error instanceof ZodError) {
            console.error('入力バリデーションエラー:', error.errors);
            setErrorMessage(
              error.errors[0]?.message || t('inputValidationError'),
            );
            return;
          }
        }

        // APIを呼び出して認証コードを送信
        const result = await sendPhoneAuthCode(phoneNumber);

        if (result.code !== 0) {
          if (result.message === 'すでに登録されている電話番号です') {
            setErrorDialog({
              isOpen: true,
              message: result.message || '',
              showLoginButton: true,
            });
          } else {
            setErrorMessage(result.message || null);
          }
          return;
        }

        // 成功
        setCodeSent(true);
        setCooldownTime(RESEND_COOLDOWN_SECONDS);
        setSuccessMessage({
          title: t('verificationCodeSentTitle'),
          message: t('verificationCodeSentMessage', { phoneNumber }),
        });
        setShowSuccessModal(true);
      } catch (error) {
        console.error('認証コード送信エラー:', error);
        setErrorMessage(t('sendCodeFailed'));
      }
    },
    [watch],
  );

  const handleResendVerification = useCallback(
    async (phoneNumber: string) => {
      try {
        setErrorMessage(null);

        const formData = {
          phoneNumber,
        };

        try {
          const requiredFieldsSchema = signupSchema.pick({
            phoneNumber: true,
          });

          requiredFieldsSchema.parse(formData);
        } catch (error) {
          if (error instanceof ZodError) {
            console.error('入力バリデーションエラー:', error.errors);
            setErrorMessage(
              error.errors[0]?.message || t('inputValidationError'),
            );
            return;
          }
        }

        const result =
          await phoneVerificationService.resendPhoneAuthCode(phoneNumber);

        // APIレスポンスをチェック（成功時はcodeが0）
        if (result.code !== 0) {
          setErrorMessage(result.message || t('resendCodeFailed'));
          return;
        }

        // 60秒のクールダウンタイマーを開始
        setCooldownTime(RESEND_COOLDOWN_SECONDS);
      } catch (_error) {
        setErrorMessage(t('resendCodeFailed'));
      }
    },
    [phoneVerificationService, setErrorMessage],
  );

  const handleVerifyCode = useCallback(
    async (data: { verificationCode: string }) => {
      try {
        setErrorMessage(null);

        const phoneNumber = watch('phoneNumber');
        const authCode = data.verificationCode;

        // スキーマでのバリデーションを試みる
        try {
          signupSchema.shape.verificationCode.parse(authCode);
        } catch (validationError) {
          if (validationError instanceof ZodError) {
            console.error('認証コード検証エラー:', validationError.errors);
            setErrorMessage(
              validationError.errors[0]?.message ||
                t('verificationCodeInvalid'),
            );
            return;
          }
        }

        // APIを呼び出して認証コードを検証
        const result = await verifyPhoneAuthCode(phoneNumber, authCode);

        if (result.code !== 0) {
          setErrorMessage(result.message || null);
          return;
        }

        // 認証成功したら直接登録処理を行う
        // フォームデータを取得して登録処理を実行
        const formData = {
          phoneNumber,
          password: watch('password'),
          verificationCode: authCode,
          name: watch('name'),
          region: watch('region'),
          age: watch('age'),
          agreeTerms: watch('agreeTerms'),
        };

        // 登録処理を実行
        await onSubmit(formData);
      } catch (error) {
        console.error('認証コード検証エラー:', error);
        setErrorMessage(t('verificationFailed'));
      }
    },
    [watch, onSubmit],
  );

  const renderPhoneStep = () => (
    <>
      <div className="mx-auto my-[5px] block h-auto w-full max-w-full">
        <Image
          src={bannerPic}
          width={500}
          height={100}
          alt="banner"
          className="h-auto w-full"
        />
      </div>

      <div className="mb-5 w-full max-w-[500px]">
        <div className="mt-4 mb-2 flex items-center">
          <div className="mr-2 min-w-[24px] text-[#44c2eb] text-[20px]">
            <IconDeviceMobile size={24} />
          </div>
          <label htmlFor="phoneNumber" className="text-gray-600 text-sm">
            {t('phoneNumberLabel')}
          </label>
        </div>

        <Controller
          name="phoneNumber"
          control={control}
          render={({ field }) => (
            <div>
              <input
                id="phoneNumber"
                {...field}
                className="w-full rounded border border-gray-300 bg-white p-3 text-base outline-[#fc999f]"
                placeholder="09012345678"
                disabled={isSubmitting}
              />
              {errors.phoneNumber && (
                <span className="mt-2.5 block px-5 text-center text-red-500">
                  {errors.phoneNumber.message}
                </span>
              )}
            </div>
          )}
        />
        <div className="mt-1 text-gray-500 text-xs">{t('phoneNumberHint')}</div>
      </div>

      <div className="mb-5 w-full max-w-[500px]">
        <div className="mb-2 flex items-center">
          <div className="mr-2 min-w-[24px] text-[#44c2eb] text-[20px]">
            <IconLock size={24} />
          </div>
          <label htmlFor="password" className="text-gray-600 text-sm">
            {t('passwordLabel')}
          </label>
        </div>

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <div>
              <input
                id="password"
                type="password"
                {...field}
                className="w-full rounded border border-gray-300 bg-white p-3 text-base outline-[#fc999f]"
                placeholder="例) 0A124ca"
                disabled={isSubmitting}
              />
              {errors.password && (
                <span className="mt-2.5 block px-5 text-center text-red-500">
                  {errors.password.message}
                </span>
              )}
            </div>
          )}
        />
        <div className="mt-1 text-gray-500 text-xs">{t('passwordHint')}</div>
      </div>

      {locale === 'ja' && (
        <div className="mb-5 w-full max-w-[500px]">
          <div className="mb-2 flex items-center">
            <div className="mr-2 min-w-[24px] text-[#44c2eb] text-[20px]">
              <IconMapPin size={24} />
            </div>
            <label htmlFor="region" className="text-gray-600 text-sm">
              {t('regionLabel')}
            </label>
          </div>

          <Controller
            name="region"
            control={control}
            render={({ field }) => (
              <div>
                <input
                  id="region"
                  readOnly
                  onClick={() => setRegionModalOpen(true)}
                  value={field.value}
                  className="w-full rounded border border-gray-300 bg-white p-3 text-base outline-[#fc999f]"
                  disabled={isSubmitting}
                />
                {errors.region && (
                  <span className="mt-2.5 block px-5 text-center text-red-500">
                    {errors.region.message}
                  </span>
                )}
              </div>
            )}
          />
        </div>
      )}

      <div className="mb-5 w-full max-w-[500px]">
        <div className="mb-2 flex items-center">
          <div className="mr-2 min-w-[24px] text-[#44c2eb] text-[20px]">
            <IconCake size={24} />
          </div>
          <label htmlFor="age" className="text-gray-600 text-sm">
            {t('ageLabel')}
          </label>
        </div>

        <Controller
          name="age"
          control={control}
          render={({ field }) => (
            <div>
              <input
                id="age"
                readOnly
                onClick={() => setAgeModalOpen(true)}
                value={field.value}
                className="w-full rounded border border-gray-300 bg-white p-3 text-base outline-[#fc999f]"
                disabled={isSubmitting}
              />
              {errors.age && (
                <span className="mt-2.5 block px-5 text-center text-red-500">
                  {errors.age.message}
                </span>
              )}
            </div>
          )}
        />
      </div>

      <div className="mb-5 w-full px-3">
        <Controller
          name="agreeTerms"
          control={control}
          render={({ field }) => (
            <div className="relative mb-4 flex w-full items-center">
              <label className="flex cursor-pointer items-center text-[#666] text-sm">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="mr-2.5 h-[18px] w-[18px] accent-[#f69b9d]"
                  disabled={isSubmitting}
                />
                <span className="leading-[1.4]">
                  {t('agreeOver18Prefix')}
                  <a
                    href="/tos"
                    target="_blank"
                    className="text-[#1f5cc9] text-[13px]"
                    rel="noopener"
                  >
                    {t('terms')}
                  </a>
                  ,
                  <a
                    href="/privacy"
                    target="_blank"
                    className="text-[#1f5cc9] text-[13px]"
                    rel="noopener"
                  >
                    {t('privacy')}
                  </a>
                  {t('agreeTermsSuffix')}
                </span>
              </label>
              {errors.agreeTerms && (
                <span className="mt-2.5 block px-5 text-center text-red-500">
                  {errors.agreeTerms.message}
                </span>
              )}
            </div>
          )}
        />
      </div>
    </>
  );

  const renderVerificationStep = () => (
    <>
      <div className="mt-4 mb-4 text-center font-bold text-[#44c2eb] text-lg">
        {t('enterVerificationCode')}
      </div>
      <div className="mb-6 text-center text-gray-600 text-sm">
        {t('verificationSentDescription', {
          phoneNumber: watch('phoneNumber'),
        })}
      </div>

      <div className="mb-5 w-full max-w-[500px]">
        <div className="mb-2 flex items-center">
          <div className="mr-2 min-w-[24px] text-[#44c2eb] text-[20px]">
            <IconKey size={24} />
          </div>
          <label htmlFor="verificationCode" className="text-gray-600 text-sm">
            {t('verificationCodeLabel')}
          </label>
        </div>

        <Controller
          name="verificationCode"
          control={control}
          render={({ field }) => (
            <div>
              <input
                id="verificationCode"
                {...field}
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full rounded border border-gray-300 bg-white p-3 text-base outline-[#fc999f]"
                placeholder={t('verificationCodePlaceholder')}
                disabled={isSubmitting || !codeSent}
              />
              {errors.verificationCode && (
                <span className="mt-2.5 block px-5 text-center text-red-500">
                  {errors.verificationCode.message}
                </span>
              )}
            </div>
          )}
        />
      </div>

      <button
        type="button"
        className="mt-5 w-full rounded-[30px] border-none bg-gradient-to-l from-[#fc999f] to-[#44c2eb] p-3 font-bold text-base text-white tracking-wider shadow-sm disabled:cursor-not-allowed disabled:bg-gradient-to-b disabled:from-gray-400 disabled:to-gray-300 disabled:opacity-70"
        onClick={() => {
          const code = watch('verificationCode');

          try {
            // 認証画面では認証コードのみをバリデーション
            if (!code) {
              setErrorMessage(t('verificationCodeRequired'));
              return;
            }

            // 認証コードが数字のみで構成されているか確認
            if (!/^\d{6}$/.test(code)) {
              setErrorMessage(t('verificationCodeInvalid'));
              return;
            }

            // 認証コードの検証処理を実行
            handleVerifyCode({ verificationCode: code });
          } catch (error) {
            console.error('認証処理エラー:', error);
            setErrorMessage(t('verificationError'));
          }
        }}
        disabled={isSubmitting || !codeSent || !watch('verificationCode')}
      >
        {t('verify')}
      </button>

      {cooldownTime === 0 && (
        <button
          type="button"
          className="mt-3 w-full cursor-pointer border-none bg-transparent p-2 text-[#44c2eb] text-sm underline transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:text-gray-300 disabled:no-underline"
          onClick={() => handleResendVerification(watch('phoneNumber'))}
          disabled={isSubmitting}
        >
          {t('resendVerificationCode')}
        </button>
      )}

      {cooldownTime > 0 && (
        <div className="mt-3 w-full p-2 text-center text-[#666] text-sm">
          {t('resendCooldown', { seconds: cooldownTime })}
        </div>
      )}
    </>
  );

  return (
    <>
      {errorDialog.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(55,55,55,0.876)]">
          <div className="z-[2] w-auto animate-popup rounded-[10px] bg-white p-4 text-center max-sm:w-[300px]">
            <div className="mb-5 font-bold text-[#888] text-base">
              {errorDialog.message}
            </div>
            <div className="mt-5 flex justify-center gap-[15px]">
              <button
                className="min-w-[100px] cursor-pointer rounded-[30px] border-none bg-[#f0f0f0] px-5 py-2.5 font-bold text-[#888] text-[15px] tracking-wider shadow-[0_1px_2px_rgba(0,0,0,0.342)] hover:bg-[#e0e0e0]"
                onClick={closeErrorDialog}
              >
                {t('okButton')}
              </button>
              {errorDialog.showLoginButton && (
                <button
                  className="min-w-[100px] cursor-pointer rounded-[30px] border-none bg-gradient-to-l from-[#fc999f] to-[#44c2eb] px-5 py-2.5 font-bold text-[15px] text-white tracking-wider shadow-[0_1px_2px_rgba(0,0,0,0.342)] hover:opacity-90"
                  onClick={() => {
                    closeErrorDialog();
                    router.push('/login');
                  }}
                >
                  {t('loginButton')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <div
        className="relative m-0 h-screen w-screen bg-[url('/miseai_livechat_utage_screen.webp')] bg-center bg-cover bg-no-repeat p-0 text-left font-['Noto_Sans_JP',sans-serif] text-[#444] after:absolute after:inset-0 after:bg-black/50 after:content-['']"
        onClick={handleBackgroundClick}
      >
        {isRegionModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setRegionModalOpen(false)}
          >
            <div
              className="absolute top-1/2 left-1/2 z-[101] w-4/5 max-w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-[10px] bg-white p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <Picker
                options={displayRegionArray}
                onSelect={(option: string) => {
                  // 地域選択のロジックを修正
                  setValue('region', option);
                  setRegionModalOpen(false);
                }}
                onCancel={() => setRegionModalOpen(false)}
              />
            </div>
          </div>
        )}

        {isAgeModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setAgeModalOpen(false)}
          >
            <div
              className="absolute top-1/2 left-1/2 z-[101] w-4/5 max-w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-[10px] bg-white p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <Picker
                options={Array.from({ length: 73 }, (_, i) =>
                  (18 + i).toString(),
                )}
                onSelect={(option: string) => {
                  // 年齢選択のロジックを修正
                  setValue('age', parseInt(option, 10));
                  setAgeModalOpen(false);
                }}
                onCancel={() => setAgeModalOpen(false)}
              />
            </div>
          </div>
        )}
        <div className="absolute top-1/2 left-1/2 z-[1] max-h-[90vh] w-[90%] max-w-[500px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[10px] bg-white px-0 py-5">
          {/* 閉じるボタン */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              zIndex: 10,
              padding: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconX size={20} />
          </button>
          <Head>
            <title>{t('userRegistration')} | UTAGE</title>
          </Head>
          <center className="mt-[1%]">
            <Image src={logoPic} width={140} height={60} alt="Utage" />
            <div className="mb-[3px] font-bold text-[#696969] text-sm tracking-[0.1em]">
              {t('userRegistration')}
            </div>
          </center>

          <div className="mx-auto flex w-[90%] max-w-[500px] flex-col items-center justify-center overflow-x-hidden rounded-[10px] p-2">
            <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
              {renderPhoneStep()}
              <button
                type="button"
                // ButtonをDisabledにするとクリックが反応しなく、バリデーションが効かないため、CSSでDisabled風にしている
                className={
                  isFormValid()
                    ? 'mt-5 w-full rounded-[30px] border-none bg-gradient-to-l from-[#fc999f] to-[#44c2eb] p-3 font-bold text-base text-white tracking-wider shadow-[0_1px_2px_rgba(0,0,0,0.342)]'
                    : 'mt-5 w-full cursor-not-allowed rounded-[30px] border-none bg-gradient-to-b from-gray-400 to-gray-300 p-3 font-bold text-[#eaeaea] text-base tracking-wider opacity-70'
                }
                onClick={() => {
                  if (!isFormValid()) {
                    validateAndShowErrors();
                    return;
                  }
                  handleSendVerification(watch('phoneNumber'));
                }}
              >
                {t('sendVerificationCode')}
              </button>
              {renderVerificationStep()}
              <div
                style={{
                  marginTop: '10px',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <button
                  type="button"
                  style={{
                    backgroundColor: '#44c2eb',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setFormType(undefined);
                  }}
                >
                  {t('backToSelection')}
                </button>
              </div>
            </form>
          </div>

          <SuccessModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            onConfirm={() => setShowSuccessModal(false)}
            title={successMessage.title}
            message={successMessage.message}
            alignment="bottom"
          />

          <Footer />

          {isSubmitting && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70">
              <div className="absolute top-1/2 left-1/2 z-10 h-[25px] w-[25px] -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-[#4545455f] border-[3px] border-t-transparent"></div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

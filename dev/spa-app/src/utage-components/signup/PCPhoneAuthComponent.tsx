import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconCake,
  IconDeviceMobile,
  IconKey,
  IconLock,
  IconMapPin,
} from '@tabler/icons-react';
import Head from 'next/head';
// Image component removed (use <img> directly);
import { useLocale } from '#/i18n/stub';
import { useCallback, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ZodError, z } from 'zod';
import styles from '@/styles/signup/PCSignupPage.module.css';
import { generateRandomUserName } from '@/utils/randomUserName';
import { displayRegionArray } from '@/utils/region';
import Picker from './Picker';

const bannerPic = '/banner/signup_bonus_banner_1200pt.webp';

import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { useRouter } from 'next/router';
import { getSession, signIn, useSession } from 'next-auth/react';
import type { SealedDataType } from '@/apis/http/unseal';
import {
  HTTP_SEND_PHONE_AUTH_CODE,
  HTTP_VERIFY_PHONE_AUTH_CODE,
  UNSEAL_FINGER_PRINT_DATA,
  UPDATE_CALL_WAITING,
} from '@/constants/endpoints';
import { getGoogleClientId } from '@/libs/googleApi';
import { getCmCodeFromCookie } from '@/utils/cmCode';
import { postToNext } from '@/utils/next';
import { fireRegistrationEvents } from '@/utils/registration';

const logoPic = '/header/utage_logo.webp';

const schema = z.object({
  phoneNumber: z
    .string()
    .min(1, '電話番号を入力してください。')
    .min(10, '電話番号は10桁以上で入力してください。')
    .max(11, '電話番号は11桁以内で入力してください。')
    .regex(/^[0-9]+$/, '電話番号は数字のみで入力してください。'),
  password: z.string().min(4, 'パスワードは4文字以上で入力してください。'),
  verificationCode: z
    .string()
    .min(1, '認証コードを入力してください。')
    .regex(/^\d{6}$/, '認証コードは6桁の数字で入力してください。'),
  name: z
    .string()
    .min(1, '名前は1文字以上で入力してください。')
    .max(20, '名前は20文字以内で入力してください。'),
  region: z.string(),
  age: z
    .number()
    .min(18, '年齢は18歳以上で入力してください。')
    .max(90, '年齢は90歳以下で入力してください。'),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: '利用規約に同意する必要があります。',
  }),
});

type RegistrationStep = 'phone' | 'verification';

export const PCPhoneAuthComponent = ({
  setErrorMessage,
  setFormType,
}: {
  setErrorMessage: (errorMessage: string | null) => void;
  setFormType: (formType: 'phone' | 'google' | undefined) => void;
}) => {
  const locale = useLocale();
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
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
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('phone');
  const [isRegionModalOpen, setRegionModalOpen] = useState(false);
  const [isAgeModalOpen, setAgeModalOpen] = useState(false);
  //   const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [_verificationTimer, setVerificationTimer] = useState(0);
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

  /**
   * 電話番号認証コードを送信するAPI
   * @param phoneNumber 電話番号
   * @returns APIレスポンス
   */
  const sendPhoneAuthCode = useCallback(async (phoneNumber: string) => {
    try {
      const response = await postToNext<{ code: number }>(
        HTTP_SEND_PHONE_AUTH_CODE,
        {
          phoneNumber,
        },
      );

      return response;
    } catch (error) {
      console.error('電話番号認証コード送信エラー:', error);
      throw error;
    }
  }, []);

  /**
   * 電話番号認証コードを検証するAPI
   * @param phoneNumber 電話番号
   * @param authCode 認証コード
   * @returns APIレスポンス
   */
  const verifyPhoneAuthCode = useCallback(
    async (phoneNumber: string, authCode: string) => {
      try {
        const response = await postToNext<{ code: number }>(
          HTTP_VERIFY_PHONE_AUTH_CODE,
          {
            phoneNumber,
            authCode,
          },
        );

        return response;
      } catch (error) {
        console.error('認証コード検証エラー:', error);
        throw error;
      }
    },
    [],
  );

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
      setErrorMessage('正しい電話番号を入力してください');
      return;
    }
    if (!watch('password')) {
      setErrorMessage('パスワードを入力してください');
      return;
    }
    if (!watch('region')) {
      setErrorMessage('地域を選択してください');
      return;
    }
    if (!watch('age')) {
      setErrorMessage('年齢を選択してください');
      return;
    }
    if (!watch('agreeTerms')) {
      setErrorMessage('利用規約に同意する必要があります');
      return;
    }
  };

  const onSubmit = useCallback(
    async (data: z.infer<typeof schema>) => {
      if (submissionLock.current) {
        return;
      }

      submissionLock.current = true; // 即座にフラグを設定

      try {
        setErrorMessage(null);

        // フィンガープリントから返却された暗号化データを復号化
        const fpData = await getData({ ignoreCache: false });
        const unsealedFpData = await postToNext<{ data: SealedDataType }>(
          UNSEAL_FINGER_PRINT_DATA,
          {
            sealedData: fpData.sealedResult,
          },
        );

        const visitorId =
          unsealedFpData.type === 'success'
            ? unsealedFpData.data.visitorId
            : undefined;

        // データのバリデーション
        schema.parse(data);

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
              '入力にエラーがあります。',
          );
        } else {
          console.error('その他のエラー:', error);
          setErrorMessage(
            '登録中にエラーが発生しました。もう一度お試しください。',
          );
        }
      } finally {
        submissionLock.current = false; // フラグを解除
      }
    },
    [getData, router, session, setErrorMessage],
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
          const requiredFieldsSchema = z.object({
            phoneNumber: schema.shape.phoneNumber,
            password: schema.shape.password,
            region: schema.shape.region,
            age: schema.shape.age,
            agreeTerms: schema.shape.agreeTerms,
          });

          requiredFieldsSchema.parse(formData);
        } catch (error) {
          if (error instanceof ZodError) {
            console.error('入力バリデーションエラー:', error.errors);
            setErrorMessage(
              error.errors[0]?.message || '入力内容に誤りがあります',
            );
            return;
          }
        }

        // APIを呼び出して認証コードを送信
        const result = await sendPhoneAuthCode(phoneNumber);

        if (result.type === 'error') {
          if (result.message === 'すでに登録されている電話番号です') {
            setErrorDialog({
              isOpen: true,
              message: result.message,
              showLoginButton: true,
            });
          } else {
            setErrorMessage(result.message);
          }
          return;
        }

        // 成功
        setCurrentStep('verification');
        setVerificationTimer(60);
      } catch (error) {
        console.error('認証コード送信エラー:', error);
        setErrorMessage(
          '認証コードの送信に失敗しました。ネットワーク接続を確認してください',
        );
      }
    },
    [watch, sendPhoneAuthCode, setErrorMessage],
  );

  const handleVerifyCode = useCallback(
    async (data: { verificationCode: string }) => {
      try {
        setErrorMessage(null);

        const phoneNumber = watch('phoneNumber');
        const authCode = data.verificationCode;

        // スキーマでのバリデーションを試みる
        try {
          schema.shape.verificationCode.parse(authCode);
        } catch (validationError) {
          if (validationError instanceof ZodError) {
            console.error('認証コード検証エラー:', validationError.errors);
            setErrorMessage(
              validationError.errors[0]?.message || '認証コードが無効です',
            );
            return;
          }
        }

        // APIを呼び出して認証コードを検証
        const result = await verifyPhoneAuthCode(phoneNumber, authCode);

        if (result.type === 'error') {
          setErrorMessage(result.message);
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
        setErrorMessage(
          '認証に失敗しました。ネットワーク接続を確認してください',
        );
      }
    },
    [watch, onSubmit, setErrorMessage, verifyPhoneAuthCode],
  );

  const renderProgressIndicator = () => {
    const progressWidth = currentStep === 'phone' ? '50%' : '100%';

    return (
      <div className={styles.stepIndicator}>
        <div className={styles.stepProgress} style={{ width: progressWidth }} />
        <div
          className={styles.stepNumber}
          style={{ color: currentStep === 'phone' ? '#fff' : '#ffffff99' }}
        >
          1. 入力
        </div>
        <div
          className={styles.stepNumber}
          style={{ color: currentStep === 'verification' ? '#fff' : '#666' }}
        >
          2. 確認
        </div>
      </div>
    );
  };

  const renderPhoneStep = () => (
    <>
      <div className={styles.banner}>
        <Image src={bannerPic} alt="banner" layout="responsive" />
      </div>

      <div className={styles.inputGroup}>
        <div className={styles.inputIcon}>
          <IconDeviceMobile size={24} className="isIdentifiedClass" />
        </div>
        <div className={styles.inputWrapper}>
          <label htmlFor="phoneNumber">電話番号</label>
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <div className={styles.inputContainer}>
                <input
                  id="phoneNumber"
                  {...field}
                  className={styles.input}
                  placeholder="09012345678"
                  disabled={isSubmitting}
                />
                {errors.phoneNumber && (
                  <span className={styles.error}>
                    {errors.phoneNumber.message}
                  </span>
                )}
              </div>
            )}
          />
          <div className={styles.inputNote}>
            ※ハイフンなしで入力してください
          </div>
        </div>
      </div>

      <div className={styles.inputGroup}>
        <div className={styles.inputIcon}>
          <IconLock size={24} />
        </div>
        <div className={styles.inputWrapper}>
          <label htmlFor="password">パスワード</label>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <div className={styles.inputContainer}>
                <input
                  id="password"
                  type="password"
                  {...field}
                  className={styles.input}
                  placeholder="例) 0A124ca"
                  disabled={isSubmitting}
                />
                {errors.password && (
                  <span className={styles.error}>
                    {errors.password.message}
                  </span>
                )}
              </div>
            )}
          />
          <div className={styles.inputNote}>
            ※半角英数字4文字以上で入力してください。
          </div>
        </div>
      </div>

      {locale === 'ja' && (
        <div className={styles.inputGroup}>
          <div className={styles.inputIcon}>
            <IconMapPin size={24} />
          </div>
          <div className={styles.inputWrapper}>
            <label htmlFor="region">地域</label>
            <Controller
              name="region"
              control={control}
              render={({ field }) => (
                <div className={styles.inputContainer}>
                  <input
                    id="region"
                    readOnly
                    onClick={() => setRegionModalOpen(true)}
                    value={field.value}
                    className={styles.input}
                    disabled={isSubmitting}
                  />
                  {errors.region && (
                    <span className={styles.error}>
                      {errors.region.message}
                    </span>
                  )}
                </div>
              )}
            />
          </div>
        </div>
      )}

      <div className={styles.inputGroup}>
        <div className={styles.inputIcon}>
          <IconCake size={24} />
        </div>
        <div className={styles.inputWrapper}>
          <label htmlFor="age">年齢</label>
          <Controller
            name="age"
            control={control}
            render={({ field }) => (
              <div className={styles.inputContainer}>
                <input
                  id="age"
                  readOnly
                  onClick={() => setAgeModalOpen(true)}
                  value={field.value}
                  className={styles.input}
                  disabled={isSubmitting}
                />
                {errors.age && (
                  <span className={styles.error}>{errors.age.message}</span>
                )}
              </div>
            )}
          />
        </div>
      </div>

      <div className={styles.checkboxContainer}>
        <Controller
          name="agreeTerms"
          control={control}
          render={({ field }) => (
            <div className={styles.inputContainer}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className={styles.checkbox}
                  disabled={isSubmitting}
                />
                <span>
                  18歳以上であり、
                  <a
                    href="/tos"
                    target="_blank"
                    className={styles.termsLink}
                    rel="noopener"
                  >
                    利用規約
                  </a>
                  ,
                  <a
                    href="/privacy"
                    target="_blank"
                    className={styles.termsLink}
                    rel="noopener"
                  >
                    プライバシーポリシー
                  </a>
                  に同意します
                </span>
              </label>
              {errors.agreeTerms && (
                <span className={styles.error}>
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
      <div className={styles.banner}>
        <Image src={bannerPic} alt="banner" layout="responsive" />
      </div>

      <div className={styles.stepTitle}>認証コードを入力</div>
      <div className={styles.stepDescription}>
        電話番号 {watch('phoneNumber')}
        に送信された6桁の認証コードを入力してください
      </div>

      <div className={styles.inputGroup}>
        <div className={styles.inputIcon}>
          <IconKey size={24} />
        </div>
        <div className={styles.inputWrapper}>
          <label htmlFor="verificationCode">認証コード</label>
          <Controller
            name="verificationCode"
            control={control}
            render={({ field }) => (
              <div className={styles.inputContainer}>
                <input
                  id="verificationCode"
                  {...field}
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={styles.input}
                  placeholder="6桁の認証コード"
                  disabled={isSubmitting}
                />
                {errors.verificationCode && (
                  <span className={styles.error}>
                    {errors.verificationCode.message}
                  </span>
                )}
              </div>
            )}
          />
        </div>
      </div>

      <button
        type="button"
        className={styles.button}
        onClick={() => {
          const code = watch('verificationCode');

          try {
            // 認証画面では認証コードのみをバリデーション
            if (!code) {
              setErrorMessage('認証コードを入力してください');
              return;
            }

            // 認証コードが数字のみで構成されているか確認
            if (!/^\d{6}$/.test(code)) {
              setErrorMessage('認証コードは6桁の数字を入力してください');
              return;
            }

            // 認証コードの検証処理を実行
            handleVerifyCode({ verificationCode: code });
          } catch (error) {
            console.error('認証処理エラー:', error);
            setErrorMessage('認証中にエラーが発生しました');
          }
        }}
        disabled={isSubmitting || !watch('verificationCode')}
      >
        認証してログイン
      </button>
    </>
  );

  return (
    <>
      {errorDialog.isOpen && (
        <div className={styles.errorDialogOverlay}>
          <div className={styles.errorDialog}>
            <div className={styles.errorMessage}>{errorDialog.message}</div>
            <div className={styles.errorDialogButtons}>
              <button
                className={styles.errorDialogButton}
                onClick={closeErrorDialog}
              >
                OK
              </button>
              {errorDialog.showLoginButton && (
                <button
                  className={styles.errorDialogLoginButton}
                  onClick={() => {
                    closeErrorDialog();
                    router.push('/login');
                  }}
                >
                  ログイン
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <div>
        {isRegionModalOpen && (
          <div
            className={styles.modalOverlay}
            onClick={() => setRegionModalOpen(false)}
          >
            <div
              className={styles.modalContent}
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
            className={styles.modalOverlay}
            onClick={() => setAgeModalOpen(false)}
          >
            <div
              className={styles.modalContent}
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
        <div className={styles.page}>
          <Head>
            <title>ユーザー登録 | UTAGE</title>
          </Head>
          <center className={styles.logo}>
            <Image src={logoPic} width={140} height={60} alt="Utage" />
            <div className={styles.title}>ユーザー登録</div>
          </center>

          <div className={styles.container}>
            {renderProgressIndicator()}

            <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
              {currentStep === 'phone' && renderPhoneStep()}
              {currentStep === 'verification' && renderVerificationStep()}
              {currentStep === 'phone' && (
                <button
                  type="button"
                  // ButtonをDisabledにするとクリックが反応しなく、バリデーションが効かないため、CSSでDisabled風にしている
                  className={`${styles.button} ${
                    !isFormValid() ? styles.buttonDisabled : ''
                  }`}
                  onClick={() => {
                    if (!isFormValid()) {
                      validateAndShowErrors();
                      return;
                    }
                    handleSendVerification(watch('phoneNumber'));
                  }}
                >
                  登録する
                </button>
              )}
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
                  選択画面に戻る
                </button>
              </div>
            </form>
          </div>

          {isSubmitting && (
            <div className={styles.overlay}>
              <div className={styles.loader}></div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

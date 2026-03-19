import { zodResolver } from '@hookform/resolvers/zod';
// Image component removed (use <img> directly);
import { useRouter } from 'next/router';
import { useLocale } from '#/i18n/stub';
import type React from 'react';
import { memo, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ZodError, z } from 'zod';
import { useUIStore } from '@/stores/uiStore';
import styles from '@/styles/profile/RegisterModal.module.css';
import { generateRandomUserName } from '@/utils/randomUserName';

const RefleshPic = '/reflesh_p.webp';

import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { signIn, useSession } from 'next-auth/react';
import { getGoogleClientId } from '@/libs/googleApi';
import { getCmCodeFromCookie } from '@/utils/cmCode';

const schema = z.object({
  name: z
    .string()
    .min(1, '名前は1文字以上で入力してください。')
    .max(20, '名前は20文字以内で入力してください。'),
});

const RegisterModal = memo(() => {
  const locale = useLocale();

  useEffect(() => {
    FingerprintJS.load()
      .then((fp) => fp.get())
      .then((_result) => {});
  }, []);

  const { handleSubmit, control } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: generateRandomUserName(locale),
      region: '東京',
      age: 20,
    },
  });
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isRegistering, setRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const isToShowModal = useUIStore((s) => s.isRegisterModalOpen);
  const closeRegisterModal = useUIStore((s) => s.closeRegisterModal);
  const openLoginModal = useUIStore((s) => s.openLoginModal);

  const onClickLogin = () => {
    closeRegisterModal();
    openLoginModal();
  };

  const onClickExistedUserLogin = async () => {
    const result = await update({ type: 'oneTapLogin' });
    if (result) {
      router.reload();
    }
  };
  if (!isToShowModal) return null;

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeRegisterModal();
    }
  };

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setLoading(true);
    try {
      schema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        alert(error.formErrors.fieldErrors);
      }
      return;
    }
    if (isRegistering) return;
    setRegistering(true);
    const cmCode = getCmCodeFromCookie();
    const googleClientId = await getGoogleClientId();
    const result = await signIn('register', {
      redirect: false,
      age: 20,
      region: '東京',
      name: data.name,
      cmCode,
      googleClientId,
    });

    closeRegisterModal();

    // エラーがある場合はカスタムダイアログを表示して終了
    if (result?.error) {
      setErrorDialog({
        isOpen: true,
        message: result.error,
        showLoginButton: result.error === 'すでに登録されています',
      });
      setRegistering(false);
      setLoading(false);
      return;
    }

    // ローカルストレージに登録情報を保存する
    localStorage.setItem('isRegistered', 'true');
    localStorage.setItem('registeredAt', new Date().toISOString());
    localStorage.setItem(
      'isFirstRegister',
      `${!!session?.user?.isFirstRegister}`,
    );

    // 画面遷移までの時間が早すぎると、イベントが送信されないため、少し待機
    setTimeout(() => {
      // ホーム画面、ダミーメッセージ画面の場合はチュートリアルモーダルを表示、それ以外はリロード
      if (
        router.pathname === '/' ||
        router.pathname === '/message' ||
        router.pathname === '/message/erina'
      ) {
        window.location.href = '/?showTutoModal=true';
      } else {
        router.reload();
      }
    }, 500);
  };

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
      {isToShowModal && (
        <div className={styles.overlay} onClick={handleClickOutside}>
          <div>
            <div className={styles.modal}>
              {session && (
                <div className={styles.session}>
                  <center className={styles.title}>
                    以前のアカウントでログイン
                  </center>
                  <button
                    type="button"
                    className={styles.tosite}
                    onClick={onClickExistedUserLogin}
                  >
                    {session.user?.name}さん
                    <br />
                    <span className={styles.tositelogin}>としてログイン</span>
                  </button>
                </div>
              )}
              <center className={styles.title}>アカウントの作成</center>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className={styles.container}
              >
                <div className={styles.label}>ニックネーム</div>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <div className={styles.inputContainer}>
                      <input {...field} className={styles.input} />
                      <button
                        type="button"
                        className={styles.random}
                        onClick={() => field.onChange(generateRandomUserName())}
                      >
                        <Image
                          src={RefleshPic}
                          alt="switcher"
                          width={20}
                          height={20}
                        />
                      </button>
                    </div>
                  )}
                />
                <div className={styles.atode}>
                  ニックネームはあとで変更できます。
                </div>

                {loading && <div className={styles.loader}></div>}
                <button type="submit" className={styles.button}>
                  無料ではじめる
                </button>
              </form>
            </div>
            {!session && (
              <div>
                <button
                  type="button"
                  onClick={onClickLogin}
                  className={styles.login}
                >
                  ログイン
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});
export default RegisterModal;
RegisterModal.displayName = 'RegisterModal';

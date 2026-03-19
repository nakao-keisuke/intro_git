import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import { type FormEvent, useEffect, useState } from 'react';
import ContactModal from '@/components/mypage/ContactModal';
import { useUIStore } from '@/stores/uiStore';
import styles from '@/styles/profile/LoginModal.module.css';

const LoginModal = (_props: {}) => {
  const { data: session, status, update } = useSession();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isManualLoginSuccess, setIsManualLoginSuccess] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const _togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isToShowModal = useUIStore((s) => s.isLoginModalOpen);
  const closeLoginModal = useUIStore((s) => s.closeLoginModal);
  const openRegisterModal = useUIStore((s) => s.openRegisterModal);

  const onClickRegister = () => {
    closeLoginModal();
    openRegisterModal();
  };

  useEffect(() => {
    if (!isManualLoginSuccess) return;
    if (status === 'authenticated') {
      localStorage.setItem('isRegistered', 'true');
      localStorage.setItem(
        'isFirstRegister',
        `${!!session?.user?.isFirstRegister}`,
      );
      router.push('/');
    }
  }, [status, session, isManualLoginSuccess]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    if (isUpdating) return;
    setIsUpdating(true);

    event.preventDefault();

    const email = (
      event.currentTarget.elements.namedItem('email') as HTMLInputElement
    ).value;
    const password = (
      event.currentTarget.elements.namedItem('password') as HTMLInputElement
    ).value;

    const result = await signIn('login', {
      redirect: false,
      email,
      password,
    });
    closeLoginModal();
    if (result?.error) {
      setIsUpdating(false);
      setLoading(false);
      alert(result.error);
      return;
    }

    setIsManualLoginSuccess(true);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeLoginModal();
    }
  };

  return isToShowModal ? (
    <>
      <div className={styles.overlay} onClick={handleClickOutside}>
        <div>
          <div className={styles.modal}>
            <center>
              <div className={styles.title}>ログイン</div>
              <form onSubmit={handleSubmit}>
                <div className={styles.adress}>メールアドレス</div>
                <input
                  className={styles.address}
                  type="email"
                  name="email"
                  required
                />
                <div className={styles.pass}>パスワード</div>
                <div className={styles.passinput}>
                  <input
                    className={styles.password}
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                  />
                </div>

                <center>
                  {loading && <div className={styles.loader}></div>}
                  <button type="submit" className={styles.button}>
                    ログイン
                  </button>
                  <br />
                </center>
                <div className={styles.contact}>
                  パスワードをお忘れの方は
                  <span className={styles.kotira} onClick={handleModalOpen}>
                    こちら
                  </span>
                </div>
              </form>
            </center>
          </div>
          {!session && (
            <div>
              <button
                type="button"
                className={styles.login}
                onClick={onClickRegister}
              >
                無料ではじめる
              </button>
            </div>
          )}
        </div>
      </div>
      {isModalOpen && (
        <ContactModal
          onClose={handleModalClose}
          userId={'null'}
          userName={'null'}
          courseAmount={''}
        ></ContactModal>
      )}
    </>
  ) : null;
};

export default LoginModal;

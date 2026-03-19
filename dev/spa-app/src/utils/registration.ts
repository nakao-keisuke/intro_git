import type { Session } from 'next-auth';

/**
 * ユーザー登録完了時の共通処理
 */

/**
 * 登録完了時にローカルストレージに情報を保存する
 * @param session セッション情報
 */
export const fireRegistrationEvents = (session: Session) => {
  localStorage.setItem('isRegistered', 'true');
  localStorage.setItem('registeredAt', new Date().toISOString());
  localStorage.setItem(
    'isFirstRegister',
    `${!!session?.user?.isFirstRegister}`,
  );
  localStorage.setItem('userId', session?.user?.id || 'USER_ID');
  localStorage.setItem('userEmail', session?.user?.email || '');
};

import { APPLICATION_ID } from '@/constants/applicationId';

/**
 * localStorageに保存されたapplicationIdからUtageアプリかどうかを判定
 */

const STORAGE_KEY = 'applicationId';

/**
 * localStorageからapplicationIdを取得
 * @returns applicationIdの値、エラー時またはSSR時はUtageのapplication_id（'15'）を返す
 */
const getApplicationIdFromStorage = (): string => {
  if (typeof window === 'undefined') return APPLICATION_ID.WEB;

  try {
    return localStorage.getItem(STORAGE_KEY) || APPLICATION_ID.WEB;
  } catch (error) {
    console.error('Failed to access localStorage:', error);
    return APPLICATION_ID.WEB;
  }
};

/**
 * localStorageに保存されたapplicationIdからUtageアプリかどうかを判定
 * @returns applicationIdが'15'ならtrue、それ以外はfalse
 */
export const separateApp = (): boolean => {
  const applicationId = getApplicationIdFromStorage();
  return applicationId === APPLICATION_ID.WEB;
};

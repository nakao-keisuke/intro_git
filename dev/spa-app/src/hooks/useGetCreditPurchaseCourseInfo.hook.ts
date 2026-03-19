import { useSession } from '#/hooks/useSession';
import { useEffect, useState } from 'react';
import type { CreditPurchaseCourseInfo } from '@/apis/get-credit-purchase-course-info';
import { CREDIT_PURCHASE_INFO } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';

// キャッシュの有効期限（5分）
const CACHE_DURATION = 5 * 60 * 1000;

// グローバルキャッシュ
let globalCreditCourseCache: {
  data: CreditPurchaseCourseInfo;
  timestamp: number;
  token: string;
} | null = null;

/**
 * クレジット購入コース情報のキャッシュをクリアする関数
 * 決済完了後などに呼び出して、最新の購入可否情報を取得させる
 * @param token オプション。指定した場合、そのトークンのキャッシュのみクリア（マルチアカウント対応）
 */
export const clearCreditPurchaseCourseCache = (token?: string) => {
  if (token && globalCreditCourseCache?.token !== token) {
    return; // 異なるユーザーのキャッシュは触らない
  }
  globalCreditCourseCache = null;
};

export const useGetCreditPurchaseCourseInfo = () => {
  const { data: session } = useSession();
  const [creditPurchaseCourseInfo, setCreditPurchaseCourseInfo] = useState<
    CreditPurchaseCourseInfo | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCreditPurchaseCourseInfo = async () => {
      // キャッシュの有効性を確認
      const now = Date.now();
      if (
        globalCreditCourseCache &&
        session?.user?.token === globalCreditCourseCache.token &&
        now - globalCreditCourseCache.timestamp < CACHE_DURATION
      ) {
        // 有効なキャッシュがある場合はAPIを呼ばない
        setCreditPurchaseCourseInfo(globalCreditCourseCache.data);
        setLoading(false);
        return;
      }

      // セッションがない場合は取得しない
      if (!session?.user?.token) {
        setLoading(false);
        return;
      }

      try {
        const client = new ClientHttpClient();
        const response = await client.post<CreditPurchaseCourseInfo>(
          CREDIT_PURCHASE_INFO,
          {},
        );
        setCreditPurchaseCourseInfo(response);
        setError(null);

        // グローバルキャッシュを更新
        globalCreditCourseCache = {
          data: response,
          timestamp: now,
          token: session.user.token,
        };
      } catch (error) {
        if (import.meta.env.NODE_ENV === 'development') {
          console.error('Failed to fetch credit purchase course info:', error);
        }
        setCreditPurchaseCourseInfo(undefined);
        setError('クレジット情報の取得でエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    fetchCreditPurchaseCourseInfo();
  }, [session?.user?.token]);

  return { creditPurchaseCourseInfo, loading, error };
};

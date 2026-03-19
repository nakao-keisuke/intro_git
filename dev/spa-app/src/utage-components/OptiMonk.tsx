import Script from 'next/script';
import { useSession } from '#/hooks/useSession';
import { useEffect, useState } from 'react';
import { isNativeApplication } from '@/constants/applicationId';

const OPTIMONK_ACCOUNT_ID = '264086';

const OptiMonk = () => {
  const { status } = useSession();
  // applicationIdの初期化を待ち、OptiMonkを読み込むかどうかを判定
  const [shouldLoadOptiMonk, setShouldLoadOptiMonk] = useState<boolean | null>(
    null,
  );
  // applicationIdをチェックして、OptiMonkを読み込むかどうかを判定
  useEffect(() => {
    const isProd = import.meta.env.NODE_ENV === 'production';

    // 本番環境かつ認証済みの場合のみ初期化ロジックを動作させる
    if (!isProd || status !== 'authenticated') {
      setShouldLoadOptiMonk(false);
      return;
    }

    const checkApplicationId = () => {
      // iOS (72) または Android (76) の場合はOptiMonkを読み込まない
      setShouldLoadOptiMonk(!isNativeApplication());
    };
    // 初回チェック
    checkApplicationId();
    // サーバーサイドでは何もしない
    if (typeof window === 'undefined') return;
    // localStorageの変化を監視（他のタブでの変更を検知）
    const handleStorageChange = () => {
      checkApplicationId();
    };
    // URLの変化を監視
    const handleUrlState = () => {
      checkApplicationId();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('popstate', handleUrlState);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('popstate', handleUrlState);
    };
  }, [status]);
  // 初期化中
  if (shouldLoadOptiMonk === null) return null;
  // Native版（applicationId: 72, 76）の場合はOptiMonkスクリプトを読み込まない
  if (!shouldLoadOptiMonk) return null;

  return (
    <Script
      id="optimonk"
      strategy="lazyOnload"
      src={`https://onsite.optimonk.com/script.js?account=${OPTIMONK_ACCOUNT_ID}`}
    />
  );
};

export default OptiMonk;

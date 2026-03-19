// Sentryクライアント側初期化（Next.js 16対応）
import '../../../sentry.client.config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { SessionProvider, useSession } from 'next-auth/react';
import { Suspense, useEffect, useState } from 'react';
import { AuthErrorBoundary } from '@/components/AuthErrorBoundary';
// import Clarity from '@/components/Clarity';
import { LiveNotificationModal } from '@/components/LiveNotificationModal';
import OptiMonk from '@/components/OptiMonk';
import { PaymentCustomerDataInitializer } from '@/components/PaymentCustomerDataInitializer';
import { ReproTracker } from '@/libs/repro';
import { LiveNotificationProvider } from '@/providers/LiveNotificationProvider';
import { UnifiedPollingProvider } from '@/providers/UnifiedPollingProvider';
import {
  getClientPlatformWithRetry,
  setClientPlatformCookie,
} from '@/utils/sentry/clientPlatform';
import { ApplicationIdHandler } from './ApplicationIdHandler';
import AppRouterGoogleAnalytics from './GoogleAnalytics';
import InComingCallHandler from './InComingCallHandler';
import { NativeBridgeListener } from './NativeBridgeListener';
import ProvidersView from './ProvidersView';
import TikTokPixelProvider from './TikTokPixelProvider';

const FirebaseInit = dynamic(
  () =>
    import('@/components/FirebaseInit').then((mod) => ({
      default: mod.FirebaseInit,
    })),
  { ssr: false },
);

// QueryClient設定の定数化（保守性と再利用性の向上）
const QUERY_CLIENT_CONFIG = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分間は新鮮なデータとして扱う
      gcTime: 30 * 60 * 1000, // 30分間キャッシュを保持 (BFCache対応)
      refetchOnWindowFocus: false, // ウィンドウフォーカス時の自動再取得を無効化
      refetchOnMount: false, // マウント時の自動再取得を無効化
      refetchOnReconnect: false, // 再接続時の自動再取得を無効化
      retry: 1, // リトライ回数を1回に制限
    },
  },
} as const;

/**
 * ポーリングプロバイダーラッパー
 *
 * SessionProvider内でuseSessionを使用してユーザートークンを取得
 * トークンが存在する場合のみUnifiedPollingProviderをレンダリング
 */
function PollingProviderWrapper() {
  const { data: session } = useSession();
  const userToken = session?.user?.token;
  const userId = session?.user?.id;

  // トークンが存在しない場合は何もレンダリングしない
  if (!userToken) {
    return null;
  }

  return (
    <UnifiedPollingProvider
      enabled={true}
      userToken={userToken}
      getParams={(key) => {
        const base = { token: userToken } as Record<string, unknown>;
        if (key === 'myPoint') {
          return { ...base, user_id: userId };
        }
        return base;
      }}
    />
  );
}

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  // useStateで1度だけ生成（コンポーネントライフサイクル中に1回のみ）
  const [queryClient] = useState(() => new QueryClient(QUERY_CLIENT_CONFIG));

  useEffect(() => {
    const applyClientCookie = async () => {
      const client = await getClientPlatformWithRetry({
        timeoutMs: 5000,
        intervalMs: 1000,
      });
      setClientPlatformCookie(client);
    };

    void applyClientCookie();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <PollingProviderWrapper />
        <AuthErrorBoundary>
          <ProvidersView>{children}</ProvidersView>
        </AuthErrorBoundary>
        <LiveNotificationProvider />
        <LiveNotificationModal />
        <ApplicationIdHandler />
        <NativeBridgeListener />
        <FirebaseInit />
        <InComingCallHandler />
        <AppRouterGoogleAnalytics />
        <Suspense fallback={null}>
          <TikTokPixelProvider />
        </Suspense>
        {/* <Clarity /> */}
        <OptiMonk />
        <PaymentCustomerDataInitializer />
        <ReproTracker />
      </SessionProvider>
    </QueryClientProvider>
  );
}

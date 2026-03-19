import { useSession } from '#/hooks/useSession';
import { UnifiedPollingProvider } from '@/providers/UnifiedPollingProvider';

/**
 * ポーリングプロバイダーラッパー
 *
 * SessionProvider内でuseSessionを使用してユーザートークンを取得
 * トークンが存在する場合のみUnifiedPollingProviderをレンダリング
 */
export function PollingProviderWrapper() {
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

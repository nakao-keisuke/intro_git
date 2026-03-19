import 'server-only';

export type AfterFn = (cb: () => void | Promise<void>) => void;

type NextServerAfterModule = {
  unstable_after?: AfterFn;
  after?: AfterFn;
};

/**
 * getAfterFn
 * Next.js の after/unstable_after を動的に取得するヘルパー。
 * サーバー環境でのみ使用。
 * 購入フロー等のログ記録などで、ログ記録によるコク入フローの遅延を防ぐために使用
 */
export async function getAfterFn(): Promise<AfterFn | undefined> {
  const modUnknown = await import('next/server');
  const mod = modUnknown as unknown as NextServerAfterModule;
  return mod.unstable_after ?? mod.after;
}

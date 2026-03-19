/**
 * Nativeアプリ向けのエラーローディング画面
 * エラーバウンダリで自動復帰処理中に表示される
 */
export default function NativeErrorLoading() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center space-y-4">
        <div
          className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
          aria-label="読み込み中"
        />
        <p className="text-gray-600 text-sm">しばらくお待ちください</p>
      </div>
    </div>
  );
}

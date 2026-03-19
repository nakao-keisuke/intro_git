import { ClipLoader } from 'react-spinners';

/**
 * フルスクリーンオーバーレイローディング
 * 背景灰色の半透明オーバーレイで画面全体を覆い、中央にスピナーを表示
 */
export default function FullScreenLoading() {
  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50"
      role="status"
      aria-live="polite"
    >
      <ClipLoader size={50} color="#ff69b4" />
    </div>
  );
}

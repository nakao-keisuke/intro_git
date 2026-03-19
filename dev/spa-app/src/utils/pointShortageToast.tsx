import type { ReactNode } from 'react';
import { toast } from 'react-toastify';
import { usePointStore } from '@/stores/pointStore';

const POINT_SHORTAGE_PATTERN =
  /(ポイント不足|ポイントが不足|所持ポイントが不足)/;
const POINT_HIGHLIGHT_PATTERN = /(\d+\s*pt|ポイント)/i;

const renderPointShortageMessage = (message: string): ReactNode => {
  const match = POINT_HIGHLIGHT_PATTERN.exec(message);
  if (!match?.[0]) {
    return message;
  }

  const highlightedText = match[0];
  const startIndex = match.index;
  const endIndex = startIndex + highlightedText.length;

  const before = message.slice(0, startIndex);
  const after = message.slice(endIndex);

  return (
    <>
      {before}
      <span className="point-shortage-highlight">{highlightedText}</span>
      {after}
    </>
  );
};

export const showPointAwareErrorToast = (message: string): void => {
  if (!POINT_SHORTAGE_PATTERN.test(message)) {
    toast.error(message);
    return;
  }

  // トースト表示後にポイント不足アラートをトリガー（PointCardが点滅する）
  // react-toastifyのアニメーション完了を待ってから点滅を開始
  setTimeout(() => {
    usePointStore.getState().triggerPointShortageAlert();
  }, 300);

  toast.error(
    <div className="point-shortage-toast-message">
      {renderPointShortageMessage(message)}
    </div>,
    {
      className: 'point-shortage-toast',
      icon: false,
      closeOnClick: true,
      pauseOnHover: true,
    },
  );
};

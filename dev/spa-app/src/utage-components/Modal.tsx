import type React from 'react';
import type { FC, ReactNode } from 'react';
import ReactModal from 'react-modal';

type ReactModalProps = React.ComponentProps<typeof ReactModal>;

interface ModalProps
  extends Omit<
    ReactModalProps,
    'isOpen' | 'onRequestClose' | 'children' | 'className' | 'overlayClassName'
  > {
  isOpen: boolean;
  onClose: () => void; // 引数なしで統一
  title?: string;
  children: ReactNode;
  className?: string; // content用（Tailwind）
  overlayClassName?: string; // overlay用（Tailwind）
}
/**
 * 汎用モーダルコンポーネント
 * これをラップして各モーダルを作成する
 */
export const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  overlayClassName,
  ...rest
}) => {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
      ariaHideApp={false} // 最小実装: SSR考慮は省略
      contentLabel={title ?? 'Modal'}
      overlayClassName={
        overlayClassName ??
        'fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100000]'
      }
      className={
        className ?? 'w-full max-w-md rounded-2xl bg-white p-6 shadow-xl'
      }
      {...rest}
    >
      {(title || true) && (
        <div className="relative mb-4">
          {title && (
            <h2 className="text-center font-semibold text-lg">{title}</h2>
          )}
        </div>
      )}

      <div className="max-h-[70vh] overflow-auto">{children}</div>
    </ReactModal>
  );
};

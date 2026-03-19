import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { MediaPermissionTarget } from '@/libs/nativeBridge';

type Props = {
  isOpen: boolean;
  deniedPermissions: MediaPermissionTarget[];
  onClose: () => void;
  onOpenSettings: () => void;
  isNativeApp: boolean;
};

export const NativePermissionModal = ({
  isOpen,
  deniedPermissions,
  onClose,
  onOpenSettings,
  isNativeApp,
}: Props) => {
  // SSR対応: クライアントサイドでのみportalTargetをセット
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  if (!isOpen || !portalTarget) return null;

  const permissionText =
    deniedPermissions.includes('camera') &&
    deniedPermissions.includes('microphone')
      ? 'カメラとマイク'
      : deniedPermissions.includes('camera')
        ? 'カメラ'
        : 'マイク';

  const description = isNativeApp
    ? '設定画面から許可を変更できます。'
    : 'ブラウザのアドレスバーにある鍵アイコン（またはサイト設定）から許可を変更してください。';

  const modalContent = (
    <div className="fixed inset-0 z-[200000] flex items-center justify-center bg-black/50 pb-[10vh]">
      <div className="mx-4 w-[calc(100%-32px)] max-w-sm rounded-xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
        <p className="mb-4 text-center text-gray-900 text-sm">
          通話するには{permissionText}の許可が必要です。
          <br />
          {description}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-gray-200 p-3 font-medium text-gray-700"
          >
            閉じる
          </button>
          {isNativeApp && (
            <button
              onClick={onOpenSettings}
              className="flex-1 rounded-lg bg-teal-500 p-3 font-medium text-white"
            >
              設定を開く
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, portalTarget);
};

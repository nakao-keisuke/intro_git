import type React from 'react';
import { useEffect, useState } from 'react';
import { useUIStore } from '@/stores/uiStore';

type InstallButtonProps = {
  props?: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >;
  children?: React.ReactNode;
};

/**
 * PWAのインストールボタン
 * @param props ボタンのプロパティ
 * @param children ボタンの子要素
 */
export const InstallButton = ({ props, children }: InstallButtonProps) => {
  // インストールボタンの表示
  const [isVisible, setIsVisible] = useState(false);
  // インストールボタンをクリックしたときのイベント
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  // インストールモーダルの表示
  const openInstallModal = useUIStore((s) => s.openInstallModal);

  useEffect(() => {
    if (!window) return;

    // ディスプレイモードがstandaloneの場合は非表示
    setIsVisible(!window.matchMedia('display-mode: standalone').matches);

    // インストールボタンをクリックしたときの処理
    const handler = async (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', (e) => {
      handler(e);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  return (
    <button
      onClick={() => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
        } else {
          openInstallModal();
        }
      }}
      style={{
        display: isVisible ? 'block' : 'block',
      }}
      {...props}
    >
      {children}
    </button>
  );
};

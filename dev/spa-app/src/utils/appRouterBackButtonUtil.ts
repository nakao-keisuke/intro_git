import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

// iOS Safari判定関数
const isIOSSafari = (): boolean => {
  if (typeof window === 'undefined') return false;

  const userAgent = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isSafari =
    /Safari/.test(userAgent) && !/Chrome|CriOS|FxiOS/.test(userAgent);

  return isIOS && isSafari;
};

export const conditionalBack = (
  router: AppRouterInstance,
  path: string,
): void => {
  try {
    // iOS Safariの場合は常にrouter.back()を使用
    // iOS SafariのBFCache（Back-Forward Cache）を活用してページの再レンダリングを防ぐ
    if (isIOSSafari()) {
      router.back();
      return;
    }

    const referrer = document.referrer;
    let isExternalReferrer = false;

    if (referrer) {
      try {
        const referrerUrl = new URL(referrer);
        const currentUrl = new URL(window.location.href);
        isExternalReferrer = referrerUrl.hostname !== currentUrl.hostname;
      } catch {
        isExternalReferrer = true;
      }
    } else {
      isExternalReferrer = true;
    }

    if (isExternalReferrer || window.history.length <= 1) {
      router.push(path);
    } else {
      router.back();
    }
  } catch {
    router.push(path);
  }
};

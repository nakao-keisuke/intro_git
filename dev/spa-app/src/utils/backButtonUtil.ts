export const conditionalBack = (router: any, path: string): void => {
  try {
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

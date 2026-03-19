import { useRouter } from 'next/router';
import { useEffect } from 'react';

const useRedirectToAndroid = () => {
  const router = useRouter();

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/android/.test(userAgent)) {
      router.replace('/phone/android');
    }
  }, []);
};

export default useRedirectToAndroid;

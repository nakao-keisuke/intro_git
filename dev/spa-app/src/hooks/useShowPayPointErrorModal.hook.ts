import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export const useShowPayPointErrorModal = () => {
  const router = useRouter();
  const [payPointError, setPayPointError] = useState('');
  useEffect(() => {
    const handleRouteChangeComplete = () => {
      if (sessionStorage.getItem('payPointError')) {
        setPayPointError(sessionStorage.getItem('payPointError') as string);
        sessionStorage.removeItem('payPointError');
      }
    };
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router.events]);
  return [payPointError, setPayPointError] as const;
};

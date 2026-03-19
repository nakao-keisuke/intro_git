import { useEffect, useState } from 'react';

export function useFirstCall() {
  const [isFirstCall, setIsFirstCall] = useState(true);

  useEffect(() => {
    const firstCallDone = localStorage.getItem('firstCall') === 'done';
    setIsFirstCall(!firstCallDone);
  }, []);

  return isFirstCall;
}

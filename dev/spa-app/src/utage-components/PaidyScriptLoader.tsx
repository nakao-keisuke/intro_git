import { useEffect } from 'react';

export const PaidyScriptLoader = () => {
  useEffect(() => {
    if (window.Paidy) {
      console.info('Paidy script was loaded more than once');
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://apps.paidy.com/';
    script.async = true;

    script.onerror = () => {
      console.error('Failed to load Paidy script');
    };

    document.body.appendChild(script);
  }, []);

  return null;
};

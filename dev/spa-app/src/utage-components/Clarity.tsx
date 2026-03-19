import Script from 'next/script';
import { useSession } from '#/hooks/useSession';
import { useEffect, useRef } from 'react';
import { isProduction } from '@/app/components/GoogleAnalytics';

// ユーザーの行動分析を行うためのツール
// https://clarity.microsoft.com/
const Clarity = () => {
  const CLARITY_ID = 'qfrqnwprlw';
  const { data: session } = useSession();
  const identifyCalled = useRef(false);

  useEffect(() => {
    if (
      session?.user?.id &&
      !identifyCalled.current &&
      typeof window !== 'undefined' &&
      (window as any).clarity
    ) {
      (window as any).clarity('identify', session.user.id);
      identifyCalled.current = true;
    }
  }, [session]);

  return (
    <>
      {isProduction && (
        <Script
          id="microsoft-clarity"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${CLARITY_ID}");
            `,
          }}
        />
      )}
    </>
  );
};

export default Clarity;

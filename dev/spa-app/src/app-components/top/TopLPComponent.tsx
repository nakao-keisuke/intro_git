import dynamic from 'next/dynamic';
// Image component removed (use <img> directly);
// TODO: i18n - import { useTranslations } from '#/i18n';
import type React from 'react';

const signPic = '/tuto/signup.webp';

import { Link } from '@tanstack/react-router';

// LPコンポーネントのインポート - SSRを有効化してパフォーマンス改善
import { Home } from '@/app/[locale]/lp/components/home';
import { RenkaSmartBanner } from '@/app/[locale]/lp/components/RenkaSmartBanner';
import Footer from '@/components/Footer';

const About = dynamic(() => import('@/app/[locale]/lp/components/About'), {
  loading: () => null,
});
const Howto = dynamic(() => import('@/app/[locale]/lp/components/Howto'), {
  loading: () => null,
});
const Videochat = dynamic(
  () => import('@/app/[locale]/lp/components/Videochat'),
  {
    loading: () => null,
  },
);
const Search = dynamic(() => import('@/app/[locale]/lp/components/Search'), {
  loading: () => null,
});
const System = dynamic(() => import('@/app/[locale]/lp/components/System'), {
  loading: () => null,
});
const Fleama = dynamic(() => import('@/app/[locale]/lp/components/Fleama'), {
  loading: () => null,
});

// トップページLPコンポーネント
export const TopLPComponent: React.FC = () => {
  const t = useTranslations('lp');

  return (
    <div className="fixed top-0 right-0 bottom-0 left-0 z-[9999] items-center justify-center bg-transparent text-xs leading-[1.1em]">
      <div className="relative flex h-full w-full animate-[popup_0.3s_cubic-bezier(0.22,1,0.36,1)_1_forwards] flex-col overflow-x-hidden overflow-y-scroll bg-transparent shadow-[0_1px_10px_0_rgba(0,0,0,0.219)]">
        <RenkaSmartBanner />
        <div className="relative w-full">
          <Home />
        </div>

        {/* メインコンテンツ */}
        <div className="mx-auto flex w-full flex-col md:max-w-full md:flex-row md:items-start md:gap-8 md:px-4 lg:max-w-[1200px] lg:justify-center">
          {/* 右側コンテンツ（モバイルでは上、PCでは右） */}
          <div className="order-1 w-full md:order-2 md:max-w-[calc(100%-362px)] md:flex-1 md:overflow-x-hidden">
            <Search />
            <About />
            <Howto />
            <Videochat />
            <Fleama />
          </div>

          {/* 左側コンテンツ（モバイルでは下、PCでは左） */}
          <div className="order-2 w-full md:sticky md:top-5 md:order-1 md:w-[330px] md:min-w-[330px] md:rounded-lg md:bg-white md:p-6 md:shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
            <System />
          </div>
        </div>

        {/* フッター */}
        <div className="mb-2.5">
          <Footer />
        </div>

        {/* 登録ボタン */}
        <div className="static m-2.5 flex justify-center">
          <Link
            href={'/signup'}
            className="block transition-transform duration-300 ease-in-out hover:translate-y-[-2px]"
          >
            <Image
              src={signPic}
              alt={t('signupCta.alt')}
              width={340}
              height={160}
              priority={false}
              loading="lazy"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

import { Noto_Sans_JP } from 'next/font/google';

/**
 * デフォルトフォントにNoto Sans JPを使用する
 */
export const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-noto-sans-jp',
});

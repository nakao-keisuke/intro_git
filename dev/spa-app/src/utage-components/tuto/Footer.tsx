import { Link } from '@tanstack/react-router';
import type React from 'react';
import { useUIStore } from '@/stores/uiStore';

type FooterProps = {
  style?: React.CSSProperties;
};

const Footer: React.FC<FooterProps> = ({ style }) => {
  const isPCState = useUIStore((s) => s.isPC);

  const getPrivacyUrl = (): string => {
    return isPCState ? '/privacy/pc' : '/privacy';
  };

  const getTosUrl = (): string => {
    return isPCState ? '/tos/pc' : '/tos';
  };

  return (
    <footer
      className="bg-white py-2.5 text-[#9c9c9c] text-[10px] mb-[200px] w-full"
      style={style}
    >
      <div>
        <nav>
          <ul className="flex justify-center items-center gap-x-6 list-none mx-0 mb-2 p-2">
            <li>
              <Link href={getTosUrl()} passHref>
                <span>利用規約</span>
              </Link>
            </li>
            <li>
              <Link href="/commerce" passHref>
                <span>特定商取引法に基づく表示</span>
              </Link>
            </li>
            <li>
              <Link href={getPrivacyUrl()} passHref>
                <span>プライバシーポリシー</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <p className="text-center -mt-[5px] text-[#9c9c9c] font-extralight text-[10px]">
        Copyright Utage All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;

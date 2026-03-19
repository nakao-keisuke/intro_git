import { useRouter } from 'next/router';
import { memo, useState } from 'react';
import styles from '@/styles/setting/TutoModal.module.css';

const _onePic = '/tuto/6.webp';
const _twoPic = '/tuto/7.webp';
const _threePic = '/tuto/8.webp';
const _fivePic = '/tuto/5.webp';
const _tenPic = '/tuto/10.webp';
const _utagePic = '/header/utage_logo.webp';
const _safePic = '/tuto/29.webp';
const _dayPic = '/tuto/30.webp';
const _checkPic = '/tuto/31.webp';
const _cardPic = '/point_howto/card.webp';

import About from '@/app/[locale]/(header-footer-layout)/tuto/components/About';
import Howto from '@/app/[locale]/(header-footer-layout)/tuto/components/Howto';
import System from '@/app/[locale]/(header-footer-layout)/tuto/components/System';
import Videochat from '@/app/[locale]/(header-footer-layout)/tuto/components/Videochat';
import Footer from '../Footer';
import Search from '../tuto/Search';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
type Props = {
  isOpenModal: boolean;
  onClose: () => void;
  isScrolled?: boolean;
};

const TutoModal: React.FC<Props> = memo(({ isOpenModal, onClose }) => {
  const router = useRouter();
  const [back, setBack] = useState(false);
  const _backClick = () => {
    if (!back) {
      router.back();
      setBack(true);
    }
  };

  return (
    <div
      className={styles.modalBackdrop}
      onClick={onClose}
      style={{ display: isOpenModal ? '' : 'none' }}
    >
      <div>
        <button className={styles.close} onClick={onClose}>
          ×
        </button>
      </div>

      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <About />
        <Howto />
        <Videochat />
        <Search />
        <System />
        <Footer />
      </div>
    </div>
  );
});

TutoModal.displayName = 'TutoModal';

export default TutoModal;

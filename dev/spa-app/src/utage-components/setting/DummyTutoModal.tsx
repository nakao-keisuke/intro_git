// Image component removed (use <img> directly);
import { useRouter } from 'next/router';
import { memo, useState } from 'react';
import styles from '@/styles/setting/TutoModal.module.css';

const ninePic = '/tuto/9.jpg';
const _twoPic = '/tuto/7.webp';
const threePic = '/tuto/3.jpeg';
const fivePic = '/tuto/5.webp';
const fourPic = '/tuto/4.jpg';

import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import {
  MIN_POINT_FOR_VIDEO_CHAT_VIEWING,
  PRICING_INFO,
  type PricingInfo,
  type PricingLabel,
} from '@/constants/pricing';

type Props = {
  onClose: () => void;
};

const formatPricingInfo = (pricing: PricingInfo) => {
  const { price, unit } = pricing;
  const priceText = typeof price === 'number' ? `${price}` : price;

  return unit ? `${priceText}${unit}` : priceText;
};

const formatPricingText = (label: PricingLabel, fallback: string) => {
  const pricing = PRICING_INFO.find((info) => info.label === label);
  if (!pricing) return fallback;

  return formatPricingInfo(pricing);
};

const DummyTutoModal: React.FC<Props> = memo(({ onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const _router = useRouter();

  const chatPointText = formatPricingText('メッセージ送信', '60pt/通');
  const videoChatViewPointText = formatPricingText(
    'ビデオチャット視聴',
    `${MIN_POINT_FOR_VIDEO_CHAT_VIEWING}pt/分`,
  );

  const slides = [
    <div key="slide1">
      <div className={styles.title}>
        <span>01</span>　　　　どんなサイト？
      </div>
      <div className={styles.p}>
        <span className={styles.pink}>気になる女性ユーザー</span>
        とチャットや通話でやりとりを楽しむサイトです！
        <br />
        <br />
        ◎こんな方におすすめ◎
        <li>・暇つぶしがしたい</li>
        <li>・全国の色々な人と 話ししたい</li>
        <li>・ 人見知りをなおしたい</li>
        寂しいのが苦手...誰かとつながっていたい！
        <li>・ 人見知りをなおしたい</li>
        <Image
          src={threePic}
          alt="goBack"
          width={330}
          height={160}
          className="cursor-pointer"
        />
      </div>
    </div>,
    <div key="slide2">
      <div className={styles.title}>
        <span>02</span>　　　タイプの子を見つけよう！
      </div>
      <div className={styles.p}>
        <br />
        たくさんの女性の中から、気になる子を見つけよう！
        <br /> <br /> <br />
        見つけたらメッセージで挨拶してみよう！
      </div>
      <div className={styles.five}>
        <Image
          src={fivePic}
          alt="goBack"
          width={330}
          height={160}
          className="cursor-pointer"
        />
      </div>
    </div>,
    <div key="slide3">
      <div className={styles.title}>
        <span>03</span>　　　　やりとりしてみよう！
      </div>
      <div className={styles.p}>
        <div className={styles.yaritori}>
          チャット<span className={styles.sp}>({chatPointText})</span>
        </div>
        <span className={styles.pink}>いつでもどこでも</span>やり取りが可能！
        <br /> <br />
        <div className={styles.yaritori}>
          ２ショット<span className={styles.sp}>(200pt/分)</span>
        </div>
        <span className={styles.pink}>顔を見ながら</span>お話できる！
        <br /> <br />
        <div className={styles.yaritori}>
          ビデオチャット視聴
          <span className={styles.sp}>({videoChatViewPointText})</span>
        </div>
        <span className={styles.pink}>手軽</span>に視聴が可能！
      </div>
      <div className={styles.three}>
        <Image
          src={ninePic}
          alt="goBack"
          width={310}
          height={150}
          className="cursor-pointer"
        />
      </div>
    </div>,
    <div key="slide4">
      <div className={styles.title}>
        <span>04</span>　　　無料でも楽しめる！
      </div>
      <div className={styles.p}>
        リクエストなどを行わないと2ショットが出来ないサービスが多い中、Utageは
        <span className={styles.pink}>即２ショット</span>が可能！
        <br />
        煩わしいやり取りは<span className={styles.pink}>不要</span>です♪ <br />
        <br />
        また、1日1回
        <span className={styles.pink}>デイリーボーナス</span>
        を受け取れるほか、ポイントを無料で獲得できる
        <span className={styles.pink}>イベント</span>や
        <span className={styles.pink}>キャンペーン</span>もあるから、
        お得に遊べます♪
      </div>
      <Image src={fourPic} alt="goBack" width={400} height={130} />
    </div>,
  ];

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <Carousel
          selectedItem={currentPage}
          onChange={(index) => setCurrentPage(index)}
          showThumbs={false}
          showStatus={false}
          showArrows={true}
          renderArrowPrev={(onClickHandler, hasPrev, label) =>
            hasPrev && (
              <button
                type="button"
                onClick={onClickHandler}
                title={label}
                className={styles.back}
              >
                &lt;
              </button>
            )
          }
          renderArrowNext={(onClickHandler, hasNext, label) =>
            hasNext && (
              <button
                type="button"
                onClick={onClickHandler}
                title={label}
                className={styles.next}
              >
                &gt;
              </button>
            )
          }
        >
          {slides}
        </Carousel>
      </div>
    </div>
  );
});

DummyTutoModal.displayName = 'DummyTutoModal';

export default DummyTutoModal;

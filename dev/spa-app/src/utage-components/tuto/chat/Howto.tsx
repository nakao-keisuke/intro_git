// Image component removed (use <img> directly);
import type React from 'react';
import { useCallback, useRef, useState } from 'react';

// 画像のインポート
const WomenUserImage = '/tuto/WomenUser.webp';
const ChatScreenImage = '/tuto/chatScreen.webp';
const GalleryScreenImage = '/tuto/GalleryScreen.webp';

// ステップデータの型定義
type StepData = {
  number: string;
  image: {
    src: any;
    alt: string;
  };
  title: string;
  description: string;
};

// ステップデータの定義
const TUTORIAL_STEPS: StepData[] = [
  {
    number: 'STEP 1',
    image: {
      src: WomenUserImage,
      alt: '探す画面',
    },
    title: '好みの女の子を探してみよう！',
    description:
      '24時間365日女の子を探すことができます。毎日3,000人以上の女の子がログインしており、日常生活では出会うことのない女の子とやりとりが可能。あなた好みの女子を見つけて交流を始めましょう。',
  },
  {
    number: 'STEP 2',
    image: {
      src: ChatScreenImage,
      alt: 'チャット画面',
    },
    title: 'メッセージを送ってみよう！',
    description:
      '好みの女の子を見つけたら、メッセージを送ってみましょう。日常の些細なやり取りから、普段はできない大胆な会話も楽しめます♪',
  },
  {
    number: 'STEP 3',
    image: {
      src: GalleryScreenImage,
      alt: 'ギャラリー画面',
    },
    title: '女の子の動画や画像をチェックしよう！',
    description:
      '女の子から送信された動画や画像は一覧でも見ることができます。女子大生や看護師・人妻のあんな動画やこんな画像を覗いてみよう♪',
  },
];

// ステップコンテンツコンポーネント
const StepContent: React.FC<{ step: StepData }> = ({ step }) => {
  return (
    <div className="mx-auto w-full max-w-[500px] rounded-[12px] bg-white p-[15px] shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <div className="mx-auto mb-[10px] w-fit flex-shrink-0 whitespace-nowrap rounded-[25px] bg-gradient-to-br from-[#e9ab00] to-[#fcc107] px-5 py-[10px] font-bold text-[14px] text-white">
        {step.number}
      </div>
      <div className="relative mb-[10px] flex aspect-[3/2] min-h-[200px] w-full items-center justify-center overflow-hidden rounded-[8px]">
        <Image
          src={step.image.src}
          alt={step.image.alt}
          className="h-auto w-full rounded-[8px] object-cover transition-transform duration-300"
          width={300}
          height={200}
          priority
        />
      </div>
      <div className="text-left">
        <h3 className="mt-0 mb-[8px] font-bold text-[#333] text-[18px]">
          {step.title}
        </h3>
        <p className="text-[#666] text-[14px] leading-[1.6]">
          {step.description}
        </p>
      </div>
    </div>
  );
};

const Howto = () => {
  const [imageSlide, setImageSlide] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleImagePrevious = useCallback(() => {
    setImageSlide((prev) => (prev > 0 ? prev - 1 : TUTORIAL_STEPS.length - 1));
  }, []);

  const handleImageNext = useCallback(() => {
    setImageSlide((prev) => (prev < TUTORIAL_STEPS.length - 1 ? prev + 1 : 0));
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0]?.clientX || 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0]?.clientX || 0;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleImageNext();
    }
    if (isRightSwipe) {
      handleImagePrevious();
    }
  };

  // インデックスが範囲内にあることを保証
  const safeIndex =
    ((imageSlide % TUTORIAL_STEPS.length) + TUTORIAL_STEPS.length) %
    TUTORIAL_STEPS.length;
  // 配列の長さが0より大きいことを型レベルで保証
  const currentStep = TUTORIAL_STEPS[safeIndex] as StepData;

  return (
    <section className="mx-[15px] mt-[30px] mb-[15px] mb-[200px] rounded-[20px] bg-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-[20px]">
      {/* 始め方セクション */}
      <div className="mb-[15px] rounded-[15px] p-5">
        <h1 className="mt-0 mb-[15px] bg-gradient-to-br from-[#e9ab00] to-[#fcc107] bg-clip-text text-center font-bold text-[#333] text-[22px] text-transparent">
          チャットの始め方
        </h1>

        {/* モバイル用のカルーセル表示 */}
        <div className="relative mx-auto flex w-full max-w-[800px] justify-center py-[10px] md:hidden">
          <div className="relative flex w-full items-center justify-center">
            <button
              onClick={handleImagePrevious}
              className="z-[1] flex h-[40px] min-h-[40px] w-[40px] min-w-[40px] flex-shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-gradient-to-br from-[#e9ab00] to-[#fcc107] font-bold text-[18px] text-white transition-all duration-300 hover:scale-110"
              aria-label="前のスライドへ"
            >
              ＜
            </button>
            <div
              className="relative mx-auto flex w-full max-w-[500px] touch-pan-x select-none justify-center"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <StepContent step={currentStep} />
            </div>
            <button
              onClick={handleImageNext}
              className="z-[1] flex h-[40px] min-h-[40px] w-[40px] min-w-[40px] flex-shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-gradient-to-br from-[#e9ab00] to-[#fcc107] font-bold text-[18px] text-white transition-all duration-300 hover:scale-110"
              aria-label="次のスライドへ"
            >
              ＞
            </button>
          </div>
        </div>

        {/* デスクトップ用のグリッド表示 */}
        <div className="mt-5 mb-5 box-border hidden max-w-full gap-[15px] px-[10px] md:grid md:grid-cols-3">
          {TUTORIAL_STEPS.map((step) => (
            <StepContent key={step.number} step={step} />
          ))}
        </div>
      </div>

      {/* チャット機能の特長 */}
      <h2 className="mb-[30px] bg-gradient-to-br from-[#e9ab00] to-[#fcc107] bg-clip-text text-center font-bold text-[24px] text-transparent">
        オプション機能も充実！
      </h2>

      <div className="grid grid-cols-1 gap-[25px] p-5 max-w-[768px]:gap-5 min-[250px]:grid-cols-2">
        <div className="rounded-[12px] border-2 border-transparent bg-white p-[25px] text-center shadow-[0_4px_15px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-[5px] hover:border-[#fcc107] hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)]">
          <div className="mb-[15px] block text-[48px]">📸</div>
          <h3 className="mb-[10px] font-bold text-[#333] text-[14px]">
            画像・動画送信
          </h3>
          <p className="m-0 text-[#666] text-[12px] leading-[1.6]">
            画像や動画を共有して、より豊かなコミュニケーションを。
          </p>
        </div>

        <div className="rounded-[12px] border-2 border-transparent bg-white p-[25px] text-center shadow-[0_4px_15px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-[5px] hover:border-[#fcc107] hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)]">
          <div className="mb-[15px] block text-[48px]">🎁</div>
          <h3 className="mb-[10px] font-bold text-[#333] text-[14px]">
            スタンプ・ギフト
          </h3>
          <p className="m-0 text-[#666] text-[12px] leading-[1.6]">
            可愛いスタンプやギフトで気持ちを伝えられます。
          </p>
        </div>
        <br />
      </div>
    </section>
  );
};

export default Howto;

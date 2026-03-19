// Image component removed (use <img> directly);
import { useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import type { TutorialStep } from '@/app/[locale]/(header-footer-layout)/tuto/types';

// 画像のインポート
const WomenUserImage = '/tuto/WomenUser.webp';
const TutoVideocallImage = '/tuto/tuto_videocall_1.webp';

// ステップデータの定義
const TUTORIAL_STEPS: TutorialStep[] = [
  {
    number: 'STEP 1',
    title: '好みの女の子を探そう',
    description:
      '「さがす」から、通話可能な女の子をチェック！\nプロフィールからビデオ通話のリクエストを送信できます。',
    image: {
      src: WomenUserImage,
      alt: 'step1_Pic',
    },
  },
  {
    number: 'STEP 2',
    title: '通話リクエストを送信',
    description:
      '気になる女の子にビデオ通話のリクエストを送信しましょう。\n相手から着信があれば、1対1のビデオ通話が開始されます。',
    image: {
      src: TutoVideocallImage,
      alt: 'step2_Pic',
    },
  },
  {
    number: 'STEP 3',
    title: 'ビデオ通話開始！',
    description:
      '気になる女の子と1対1のビデオ通話を楽しもう！\nお互いの姿を見せ合いながら、特別な時間を過ごせます。\n遠隔バイブを送信すればさらに盛り上がること間違いなし！',
    video: {
      src: '/tuto/videoTell5.mp4',
    },
  },
];

// ステップコンテンツコンポーネント
const StepContent: React.FC<{ step: TutorialStep }> = ({ step }) => {
  return (
    <div className="mx-auto w-full max-w-[500px] rounded-[12px] bg-white p-[15px] shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <div className="mx-auto mb-[10px] w-fit flex-shrink-0 whitespace-nowrap rounded-[25px] bg-gradient-to-br from-[#f95757] to-[#ff8a80] px-5 py-[10px] font-bold text-[14px] text-white">
        {step.number}
      </div>
      <div className="relative mb-[10px] flex aspect-[3/2] min-h-[200px] w-full items-center justify-center overflow-hidden rounded-[8px]">
        {step.video ? (
          <div className="flex h-[200px] w-full items-center justify-center">
            <video
              width="300"
              height="200"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="h-auto w-full rounded-[8px] object-cover"
            >
              <source src={step.video.src} type="video/mp4" />
              お使いのブラウザは動画の再生に対応していません。
            </video>
          </div>
        ) : step.image ? (
          <Image
            src={step.image.src}
            alt={step.image.alt}
            className="h-auto w-full rounded-[8px] object-cover transition-transform duration-300"
            width={300}
            height={200}
            priority
          />
        ) : null}
      </div>
      <div className="text-left">
        <h3 className="mt-0 mb-[8px] font-bold text-[#333] text-[18px]">
          {step.title}
        </h3>
        <p className="whitespace-pre-line text-[#666] text-[14px] leading-[1.6]">
          {step.description}
        </p>
      </div>
    </div>
  );
};

const HowtoWatch = () => {
  const router = useRouter();
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

  const handleLovenseClick = () => {
    router.push('/lovense');
  };

  // インデックスが範囲内にあることを保証
  const safeIndex =
    ((imageSlide % TUTORIAL_STEPS.length) + TUTORIAL_STEPS.length) %
    TUTORIAL_STEPS.length;
  // 配列の長さが0より大きいことを型レベルで保証
  const currentStep = TUTORIAL_STEPS[safeIndex] as TutorialStep;

  return (
    <section className="mx-[15px] mt-[30px] mb-[15px] mb-[200px] rounded-[20px] bg-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-[20px]">
      {/* 始め方セクション */}
      <div className="rounded-[15px] p-5">
        <h1 className="mt-0 mb-[15px] bg-gradient-to-br from-[#f95757] to-[#ff8a80] bg-clip-text text-center font-bold text-[#333] text-[22px] text-transparent">
          ビデオ通話の始め方
        </h1>

        {/* モバイル用のカルーセル表示 */}
        <div className="relative mx-auto flex w-full max-w-[800px] justify-center py-[15px] md:hidden">
          <div className="relative flex w-full items-center justify-center">
            <button
              onClick={handleImagePrevious}
              className="z-[1] flex h-[40px] min-h-[40px] w-[40px] min-w-[40px] flex-shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-gradient-to-br from-[#f95757] to-[#ff8a80] font-bold text-[18px] text-white transition-all duration-300 hover:scale-110"
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
              className="z-[1] flex h-[40px] min-h-[40px] w-[40px] min-w-[40px] flex-shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-gradient-to-br from-[#f95757] to-[#ff8a80] font-bold text-[18px] text-white transition-all duration-300 hover:scale-110"
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

      {/* Lovenseバナーセクション */}
      <div className="text-center">
        <h2 className="mt-0 mb-[8px] font-bold text-[#333] text-[18px]">
          ▼遠隔バイブの送信方法は以下をチェック！
        </h2>
      </div>
      <div className="mt-5 mb-5 px-[15px]">
        <div
          className="mx-auto w-full max-w-[800px] cursor-pointer overflow-hidden rounded-[12px] shadow-[0_4px_15px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)]"
          onClick={handleLovenseClick}
        >
          <Image
            src="/banner/lovense_video_header.webp"
            alt="Lovense機能について詳しく見る"
            width={800}
            height={200}
            className="block h-auto w-full cursor-pointer"
          />
        </div>
      </div>
    </section>
  );
};

export default HowtoWatch;

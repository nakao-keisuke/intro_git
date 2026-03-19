// Image component removed (use <img> directly);
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import styles from '@/styles/OnboardingTutorial.module.css';
import type { TutorialProps, TutorialSlide } from '@/types/onboardingTutorial';

// 画像パスの定義
const UtageLogoImage = '/header/utage_logo.webp';
const _NewregistrationBannerImage = '/banner/onboarding_new_header.webp';
const AboutImage = '/tuto/about.webp';
const LiveScreenImage = '/tuto/liveScreen.webp';
const GalleryScreenImage = '/tuto/GalleryScreen.webp';
const ChatScreenImage = '/tuto/chatScreen.webp';
const VideoImage = '/tuto/videoScreen.webp';

type Props = TutorialProps;

const tutorialSlides: TutorialSlide[] = [
  {
    title: 'Utageとは？',
    description:
      '好みの子とメッセージやビデオ通話、ライブ配信など\n自分にあったサービスを体験できるよ♪\n好みの女の子とコミュニケーションを楽しもう！',
    illustration: 'chat',
  },
  {
    title: 'ライブ配信を覗いてみよう',
    description:
      'ライブ配信で好みの子を覗いてみよう！\n大胆な配信をしている女の子がいるかも・・・？\n遠隔バイブを送信して喜んでもらおう♪',
    illustration: 'live',
  },
  {
    title: 'ビデオ通話でつながろう',
    description:
      '女子大生・看護師・熟女・人妻など色んな女性とふたりきりでビデオ通話が可能！\nタイプの子と見せ合いしちゃおう♡',
    illustration: 'video',
  },
  {
    title: '動画や画像を見る',
    description:
      '女の子から送信された動画や画像を\n見ることができます！\n好きな体の部分を見せてくれるかも♡',
    illustration: 'gallery',
  },
  {
    title: 'メッセージを送ろう',
    description:
      '好みの子にメッセージを送って、\nビデオチャットや通話に誘ってみよう♫\n女の子のプロフィールからボタンをタップ！',
    illustration: 'message',
  },
];

export const OnboardingTutorial: React.FC<Props> = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const _router = useRouter();

  // 現在のスライドデータを安全に取得
  const currentSlideData = tutorialSlides[currentSlide];

  // スライドデータが存在しない場合の早期リターン
  if (!currentSlideData) {
    return null;
  }

  const handleNext = () => {
    if (currentSlide < tutorialSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // 最後のスライドの場合、ホームへ遷移
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  // スライド操作のハンドラー
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    setIsDragging(true);
    setStartX(e.touches[0]?.clientX ?? 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    if (e.touches.length === 0) return;
    e.preventDefault();
    const currentX = e.touches[0]?.clientX ?? 0;
    const deltaX = currentX - startX;
    setTranslateX(deltaX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // スワイプ距離が50px以上の場合にスライド切り替え
    if (Math.abs(translateX) > 50) {
      if (translateX > 0 && currentSlide > 0) {
        // 右スワイプ：前のスライドへ
        setCurrentSlide(currentSlide - 1);
      } else if (translateX < 0 && currentSlide < tutorialSlides.length - 1) {
        // 左スワイプ：次のスライドへ
        setCurrentSlide(currentSlide + 1);
      }
    }

    setTranslateX(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const currentX = e.clientX;
    const deltaX = currentX - startX;
    setTranslateX(deltaX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // スワイプ距離が50px以上の場合にスライド切り替え
    if (Math.abs(translateX) > 50) {
      if (translateX > 0 && currentSlide > 0) {
        // 右ドラッグ：前のスライドへ
        setCurrentSlide(currentSlide - 1);
      } else if (translateX < 0 && currentSlide < tutorialSlides.length - 1) {
        // 左ドラッグ：次のスライドへ
        setCurrentSlide(currentSlide + 1);
      }
    }

    setTranslateX(0);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setTranslateX(0);
    }
  };

  const renderIllustration = (type: TutorialSlide['illustration']) => {
    switch (type) {
      case 'chat':
        return (
          <div className={styles.illustrationImage}>
            <Image src={AboutImage} alt="Utageとは？" fill />
          </div>
        );
      case 'live':
        return (
          <div className={styles.illustrationImage}>
            <Image src={LiveScreenImage} alt="ライブ配信を覗いてみよう" fill />
          </div>
        );
      case 'video':
        return (
          <div className={styles.illustrationImage}>
            <Image src={VideoImage} alt="ビデオ通話でつながろう" fill />
          </div>
        );
      case 'gallery':
        return (
          <div className={styles.illustrationImage}>
            <Image src={GalleryScreenImage} alt="動画や画像を見る" fill />
          </div>
        );
      case 'message':
        return (
          <div className={styles.illustrationImage}>
            <Image src={ChatScreenImage} alt="メッセージを送ろう" fill />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLogo}>
            <Image src={UtageLogoImage} alt="Utage" width={120} height={40} />
          </div>
          <button className={styles.skipButton} onClick={handleSkip}>
            スキップ
          </button>
        </div>

        {/* Content */}
        <div className={styles.contentWrapper}>
          {/* PC版のみ表示される左ナビゲーションボタン */}
          <button
            className={`${styles.navButton} ${styles.prevButton}`}
            onClick={handlePrevious}
            disabled={currentSlide === 0}
            aria-label="前のスライド"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div
            className={styles.content}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className={`${styles.slidesContainer} ${
                isDragging ? styles.dragging : ''
              }`}
              style={{
                transform: `translateX(calc(-${currentSlide * 100}% + ${
                  isDragging ? translateX : 0
                }px))`,
              }}
            >
              {tutorialSlides.map((slide, index) => (
                <div key={index} className={styles.slide}>
                  {/* Illustration */}
                  <div className={styles.illustrationContainer}>
                    {renderIllustration(slide.illustration)}
                  </div>

                  {/* Text Content */}
                  <div className={styles.textContent}>
                    <h2 className={styles.title}>{slide.title}</h2>
                    <p className={styles.description}>
                      {slide.description.split('\n').map((line, lineIndex) => (
                        <React.Fragment key={lineIndex}>
                          {line}
                          {lineIndex <
                            slide.description.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PC版のみ表示される右ナビゲーションボタン */}
          <button
            className={`${styles.navButton} ${styles.nextNavButton}`}
            onClick={handleNext}
            disabled={currentSlide === tutorialSlides.length - 1}
            aria-label="次のスライド"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Bottom Section */}
        <div className={styles.bottomSection}>
          {/* Progress Dots */}
          <div className={styles.progressDots}>
            {tutorialSlides.map((_, index) => (
              <div
                key={index}
                className={`${styles.dot} ${
                  index === currentSlide ? styles.activeDot : ''
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>

          {/* Next/Start Button */}
          <button className={styles.nextButton} onClick={handleNext}>
            {currentSlide < tutorialSlides.length - 1
              ? '次へ'
              : '女の子と遊ぶ♡'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Image component removed (use <img> directly);
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { getBrowserType } from '@/utils/browserDetection';
import { clearMediaSession } from '@/utils/mediaSession';

interface OptimizedVideoProps {
  mp4Src: string;
  webmSrc?: string;
  posterSrc?: string;
  isLazyLoad?: boolean;
  className?: string | undefined;
  autoPlay?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  loop?: boolean;
  width?: string | number;
  height?: string | number;
  onLoadedData?: () => void;
  onCanPlay?: () => void;
}

/**
 * ブラウザに応じて最適な動画形式を選択し、遅延読み込みとプレースホルダー表示を実装した動画コンポーネント
 */
const OptimizedVideo: React.FC<OptimizedVideoProps> = ({
  mp4Src,
  webmSrc,
  posterSrc,
  isLazyLoad = false,
  className,
  autoPlay = true,
  muted = true,
  playsInline = true,
  loop = true,
  width = '100%',
  height = '100%',
  onLoadedData,
  onCanPlay,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!isLazyLoad);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string>(mp4Src); // 初期値としてmp4Srcを設定
  const [browserType, setBrowserType] = useState<string>('unknown');

  // クライアントサイドでブラウザタイプを取得
  useEffect(() => {
    const detectedBrowser = getBrowserType();
    setBrowserType(detectedBrowser);
  }, []);

  // ブラウザに応じた動画ソースの選択
  useEffect(() => {
    // ブラウザタイプが判定されるまで待つ
    if (browserType === 'unknown') {
      return;
    }

    if (browserType === 'Safari' || !webmSrc) {
      // Safariの場合、またはwebMソースがない場合はMP4を使用
      setVideoSrc(mp4Src);
    } else {
      // Chrome、Firefox、Edgeなどその他のブラウザではWebMを使用
      setVideoSrc(webmSrc);
    }
  }, [mp4Src, webmSrc, browserType]);

  // Intersection Observerによる遅延読み込み
  useEffect(() => {
    if (!isLazyLoad || !containerRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      },
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isLazyLoad]);

  // unmount時のクリーンアップ（videoSrc変更時にも再登録）
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    return () => {
      video.pause();
      video.src = '';
      video.load();
      clearMediaSession();
    };
  }, [videoSrc]);

  // 動画の準備完了時の処理
  const handleCanPlay = () => {
    setIsVideoReady(true);
    if (onCanPlay) {
      onCanPlay();
    }
  };

  const handleLoadedData = () => {
    if (onLoadedData) {
      onLoadedData();
    }
  };

  // 動画のスタイル
  const videoStyle: React.CSSProperties = {
    opacity: isVideoReady ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      {/* プレースホルダー画像 */}
      {posterSrc && (
        <Image
          src={posterSrc}
          alt="Video placeholder"
          fill
          style={{
            objectFit: 'cover',
            opacity: isVideoReady ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out',
            pointerEvents: 'none',
          }}
          unoptimized
        />
      )}

      {/* 動画要素 */}
      {isVisible && videoSrc && (
        <video
          ref={videoRef}
          autoPlay={autoPlay}
          muted={muted}
          playsInline={playsInline}
          loop={loop}
          width={width}
          height={height}
          className={className}
          style={videoStyle}
          onCanPlay={handleCanPlay}
          onLoadedData={handleLoadedData}
          poster={posterSrc}
        >
          <source
            src={videoSrc}
            type={
              browserType === 'Safari' || !webmSrc ? 'video/mp4' : 'video/webm'
            }
          />
          お使いのブラウザは、動画タグに対応していません。
        </video>
      )}
    </div>
  );
};

export default OptimizedVideo;

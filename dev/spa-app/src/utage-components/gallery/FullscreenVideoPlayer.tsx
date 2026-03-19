import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSwipeable } from 'react-swipeable';
import styles from '@/styles/FullscreenVideoPlayer.module.css';
import { clearMediaSession } from '@/utils/mediaSession';

// フルスクリーン関連の型定義を追加
interface DocumentWithFullscreen extends Document {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitFullscreenEnabled?: boolean;
  mozFullScreenEnabled?: boolean;
  msFullscreenEnabled?: boolean;
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

interface ElementWithFullscreen extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

type FullscreenVideoPlayerProps = {
  fileId: string;
  onClose: () => void;
};

const FullscreenVideoPlayer: React.FC<FullscreenVideoPlayerProps> = ({
  fileId,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [_isFullscreen, setIsFullscreen] = useState(false);
  const [_showMark, setShowMark] = useState(false);
  const markTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const hideControlsAfterDelay = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 1000);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    hideControlsAfterDelay();
  };

  // フルスクリーンAPIの処理
  const enterFullscreen = async () => {
    try {
      const elem = containerRef.current;
      if (!elem) {
        return;
      }

      const doc = document as DocumentWithFullscreen;
      const element = elem as ElementWithFullscreen;

      // フルスクリーンAPIがサポートされているか確認
      const fullscreenEnabled =
        document.fullscreenEnabled ||
        doc.webkitFullscreenEnabled ||
        doc.mozFullScreenEnabled ||
        doc.msFullscreenEnabled;

      if (!fullscreenEnabled) {
        return;
      }

      if (element.requestFullscreen) {
        await element.requestFullscreen();
        setIsFullscreen(true);
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
        setIsFullscreen(true);
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
        setIsFullscreen(true);
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
        setIsFullscreen(true);
      }
    } catch (_error) {
      // フルスクリーンが失敗した場合でも動画は再生する
    }
  };

  const exitFullscreen = () => {
    const doc = document as DocumentWithFullscreen;

    if (document.exitFullscreen) {
      document.exitFullscreen().catch((error) => {
        console.error('Failed to exit fullscreen:', error);
      });
    } else if (doc.webkitFullscreenElement && doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen();
    } else if (doc.mozFullScreenElement && doc.mozCancelFullScreen) {
      doc.mozCancelFullScreen();
    } else if (doc.msFullscreenElement && doc.msExitFullscreen) {
      doc.msExitFullscreen();
    }
    setIsFullscreen(false);
  };

  // コンポーネントマウント時の初期化
  useEffect(() => {
    // モバイルデバイスかどうかを判定
    const _isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // 疑似フルスクリーン状態を設定（CSSで画面全体に表示）
    setIsFullscreen(true);
  }, [fileId]);

  // 動画を確実に自動再生するためのハンドラー
  const handleCanPlay = () => {
    const video = videoRef.current;
    if (!video) return;

    // autoplay属性により既に再生が開始されているかチェック
    if (!video.paused) {
      setIsPlaying(true);
      return;
    }

    // 音声をデフォルトでONで自動再生を試みる
    video.muted = false;
    video
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((_error) => {
        // 音声ONで失敗した場合、ミュートで再試行
        video.muted = true;
        video
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((_mutedError) => {
            setIsPlaying(false);
          });
      });
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handlePlay = () => {
        setIsPlaying(true);
        hideControlsAfterDelay();
      };

      const handlePause = () => {
        setIsPlaying(false);
        setShowControls(true);
      };

      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);

      // 動画の読み込み状態を確認
      video.addEventListener('loadstart', () =>
        console.log('Video load started'),
      );
      video.addEventListener('loadeddata', () =>
        console.log('Video data loaded'),
      );
      video.addEventListener('canplay', () => console.log('Video can play'));
      video.addEventListener('error', (e) => console.error('Video error:', e));

      return () => {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      };
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    // フルスクリーン変更イベントのハンドラー
    const handleFullscreenChange = () => {
      const doc = document as DocumentWithFullscreen;

      const isInFullscreen = !!(
        document.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );

      setIsFullscreen(isInFullscreen);

      if (!isInFullscreen) {
        // フルスクリーンが解除されたらコンポーネントを閉じる
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange,
      );
      document.removeEventListener(
        'mozfullscreenchange',
        handleFullscreenChange,
      );
      document.removeEventListener(
        'MSFullscreenChange',
        handleFullscreenChange,
      );
      exitFullscreen();
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (markTimeoutRef.current) {
        clearTimeout(markTimeoutRef.current);
      }
    };
  }, [fileId, onClose]);

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        // 再生中の場合はマークを表示
        showMarkEffect();
      } else {
        const doc = document as DocumentWithFullscreen;

        // ユーザークリック時のみフルスクリーンAPI呼び出しを試行
        if (!document.fullscreenElement && !doc.webkitFullscreenElement) {
          enterFullscreen();
        }

        // 音声をデフォルトでONで再生を試みる
        video.muted = false;
        video
          .play()
          .then(() => {
            setIsPlaying(true);
            hideControlsAfterDelay();
          })
          .catch((_error) => {
            // 音声ONで失敗した場合、ミュートで再試行
            video.muted = true;
            video
              .play()
              .then(() => {
                setIsPlaying(true);
                hideControlsAfterDelay();
              })
              .catch((_mutedError) => {});
          });
      }
    }
  };

  const showMarkEffect = () => {
    setShowMark(true);
    setShowControls(true);
    hideControlsAfterDelay();

    if (markTimeoutRef.current) {
      clearTimeout(markTimeoutRef.current);
    }

    markTimeoutRef.current = setTimeout(() => {
      setShowMark(false);
    }, 1500);
  };

  const handleClose = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.src = '';
      video.load();
    }

    clearMediaSession();
    exitFullscreen();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // スワイプハンドラー
  const handlers = useSwipeable({
    onSwipedDown: (eventData) => {
      console.log('Swiped down:', eventData.deltaY);
      if (Math.abs(eventData.deltaY) > 50) {
        console.log('Closing video due to swipe');
        handleClose();
      }
    },
    onSwiping: (eventData) => {
      console.log('Swiping:', eventData.dir, eventData.deltaY);
      if (eventData.dir === 'Down' && eventData.deltaY > 0) {
        setIsSwiping(true);
        setSwipeOffset(Math.min(eventData.deltaY, 200));
      } else if (eventData.dir === 'Up') {
        setIsSwiping(false);
        setSwipeOffset(0);
      }
    },
    onTouchEndOrOnMouseUp: () => {
      console.log('Touch ended');
      if (swipeOffset > 50) {
        handleClose();
      } else {
        setIsSwiping(false);
        setSwipeOffset(0);
      }
    },
    trackMouse: false,
    preventScrollOnSwipe: true,
    delta: 10,
    swipeDuration: 500,
    touchEventOptions: { passive: false },
  });

  const fullscreenContent = (
    <div
      ref={containerRef}
      className={`${styles.fullscreenContainer} ${!showControls ? styles.hideControls : ''}`}
      onClick={handleBackdropClick}
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseMove}
    >
      {showControls && (
        <button
          className={styles.closeButton}
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      <div
        {...handlers}
        className={styles.videoWrapper}
        style={{
          transform: `translateY(${swipeOffset}px)`,
          opacity: isSwiping ? Math.max(1 - swipeOffset / 200, 0.3) : 1,
          transition: isSwiping
            ? 'none'
            : 'transform 0.3s ease, opacity 0.3s ease',
        }}
      >
        <video
          ref={videoRef}
          className={styles.video}
          src={new URL(
            `/api=load_file_for_utage_web&file_id=${fileId}`,
            import.meta.env.VITE_STF_URL,
          ).toString()}
          controls={showControls}
          controlsList="nodownload"
          playsInline
          autoPlay
          preload="auto"
          onClick={handleVideoClick}
          onCanPlay={handleCanPlay}
          onEnded={() => {
            setIsPlaying(false);
          }}
        />
      </div>
      {!isPlaying && (
        <div
          className={styles.playButton}
          onClick={() => {
            const video = videoRef.current;
            if (video) {
              // 音声をデフォルトでONで再生を試みる
              video.muted = false;
              video
                .play()
                .then(() => {
                  setIsPlaying(true);
                  hideControlsAfterDelay();
                })
                .catch(() => {
                  // 音声ONで失敗した場合、ミュートで再試行
                  video.muted = true;
                  video
                    .play()
                    .then(() => {
                      setIsPlaying(true);
                      hideControlsAfterDelay();
                    })
                    .catch(() => {});
                });
            }
          }}
        ></div>
      )}
    </div>
  );

  // Portalを使用してbodyに直接マウント
  if (typeof window === 'undefined') {
    return null;
  }

  return createPortal(fullscreenContent, document.body);
};

export default FullscreenVideoPlayer;

import { useEffect, useRef } from 'react';

type Props = {
  facingMode: 'user' | 'environment';
  className?: string;
  /** getUserMedia() 失敗時のコールバック。エラーオブジェクトを引数に渡す */
  onError?: (error: unknown) => void;
};

/**
 * 発信中のローカルカメラプレビューコンポーネント
 * - 常にvideo要素を表示（カメラ起動前は黒背景）
 * - facingModeに応じてカメラを切り替え
 * - user（インカメ）の場合は左右反転表示
 */
const LocalCameraPreview = ({ facingMode, className, onError }: Props) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let isMounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });

        if (isMounted && videoRef.current) {
          streamRef.current = stream;
          videoRef.current.srcObject = stream;
        } else {
          // マウント解除後にストリーム取得完了した場合は即停止
          stream.getTracks().forEach((track) => track.stop());
        }
      } catch (error) {
        console.error('Failed to start local camera:', error);
        if (isMounted) {
          onError?.(error);
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [facingMode, onError]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={`bg-black ${className ?? ''} ${facingMode === 'user' ? '-scale-x-100' : ''}`}
    />
  );
};

export default LocalCameraPreview;

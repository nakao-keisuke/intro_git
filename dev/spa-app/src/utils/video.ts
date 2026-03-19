import type { FileInfo } from '@/types/upload';

/**
 * サムネイル情報
 */
export type ThumbnailData = {
  readonly thumbnail: Blob;
  readonly duration: number;
};

/**
 * 動画からサムネイル画像を生成
 * @param file 動画ファイル
 * @param seekTimeSec サムネイルを生成する位置（秒）
 * @returns サムネイル画像とduration
 */
export async function createVideoThumbnail(
  file: File,
  seekTimeSec = 1,
): Promise<ThumbnailData> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    let videoDuration = 0;
    let settled = false;

    // Video 基本設定
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    // BlobURLリーク防止 + イベントリスナー解除
    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('error', handleError);
      video.removeAttribute('src');
      video.load();
    };

    const safeResolve = (value: ThumbnailData) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(value);
    };

    const safeReject = (error: unknown) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    // コーデック対応チェック
    video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');

    // メタデータ読み込み時の処理
    function handleLoadedData() {
      if (video.duration > 0) {
        const time = Math.min(seekTimeSec, video.duration - 0.1);
        video.currentTime = Math.max(0, time);
        videoDuration = video.duration;
      }
    }

    // 再生テスト
    function handleLoadedMetadata() {
      video
        .play()
        .then(() => {
          video.pause();
        })
        .catch(() => {
          /* ignore pause errors */
        });
    }

    // シーク完了後にリトライ処理を含む描画
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 2000;

    function retryDrawing() {
      if (settled) return;
      if (retryCount >= maxRetries) {
        safeReject(new Error('Failed to draw a valid frame'));
        return;
      }

      retryCount++;
      setTimeout(() => {
        drawFrame();
      }, retryDelay);
    }

    function drawFrame() {
      if (settled) return;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (!ctx) {
        safeReject(new Error('CanvasRenderingContext2D not supported'));
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const pixelData = ctx.getImageData(0, 0, 1, 1).data;

      if (pixelData[3] === 0) {
        retryDrawing();
      } else {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              safeReject(new Error('Blob creation failed'));
              return;
            }

            safeResolve({
              thumbnail: blob,
              duration: videoDuration,
            });
          },
          'image/jpeg',
          0.8,
        );
      }
    }

    function handleSeeked() {
      // 遅延を挟んで描画処理を開始
      setTimeout(() => {
        drawFrame();
      }, 200);
    }

    // エラー時
    function handleError(e: Event) {
      safeReject(e);
    }

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('error', handleError);

    // タイムアウト処理
    setTimeout(() => {
      safeReject(new Error('Video processing timed out'));
    }, 10000);
  });
}

/**
 * 動画をアップロード
 * @param file 動画ファイル
 * @returns ファイル情報（fileId, duration）
 */
export const uploadVideo = async (file: File): Promise<FileInfo> => {
  // 動画アップロード
  const videoFormData = new FormData();
  videoFormData.append('data', file);
  const videoResponse = await fetch('/api/upload-video', {
    method: 'POST',
    body: videoFormData,
  });
  const videoData = await videoResponse.json();

  const fileId = videoData.data?.file_id;

  if (!fileId) {
    throw new Error('file_id not found in video upload response');
  }

  // サムネイル生成してアップロード
  const { thumbnail, duration } = await createVideoThumbnail(file);

  const thumbnailFormData = new FormData();
  thumbnailFormData.append('data', thumbnail);
  thumbnailFormData.append('fileId', fileId);

  const thumbnailResponse = await fetch('/api/upload-thumbnail', {
    method: 'POST',
    body: thumbnailFormData,
  });

  if (!thumbnailResponse.ok) {
    const errorText = await thumbnailResponse.text();
    throw new Error(
      `Thumbnail upload failed: ${thumbnailResponse.status} ${errorText}`,
    );
  }

  const thumbnailData = await thumbnailResponse.json();

  return {
    fileId: thumbnailData.data.image_id,
    fileType: 'video',
    duration: Math.floor(duration),
  };
};

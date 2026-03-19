import AgoraRTC, {
  type ILocalAudioTrack,
  type ILocalVideoTrack,
} from 'agora-rtc-sdk-ng';

/** トラック再作成時の待機時間（ミリ秒） */
export const TRACK_RECREATION_DELAY_MS = 500;

/**
 * トラック再作成の結果
 */
export type RecreateTracksResult = {
  audioTrack: ILocalAudioTrack | null;
  videoTrack: ILocalVideoTrack | null;
};

/**
 * ローカルトラックを再作成する
 * 既存のトラックを破棄し、新しいトラックを作成する
 *
 * @param isVideoCall ビデオ通話かどうか（falseの場合は音声通話）
 * @param currentAudioTrack 現在のオーディオトラック
 * @param currentVideoTrack 現在のビデオトラック
 * @returns 再作成されたトラック、失敗時はnull
 */
export const recreateTracks = async (
  isVideoCall: boolean,
  currentAudioTrack: ILocalAudioTrack | null,
  currentVideoTrack: ILocalVideoTrack | null,
): Promise<RecreateTracksResult | null> => {
  try {
    // 既存トラックを破棄
    if (currentAudioTrack) {
      currentAudioTrack.close();
    }
    if (currentVideoTrack) {
      currentVideoTrack.close();
    }

    await new Promise((resolve) =>
      setTimeout(resolve, TRACK_RECREATION_DELAY_MS),
    );

    if (isVideoCall) {
      const [audioTrack, videoTrack] =
        await AgoraRTC.createMicrophoneAndCameraTracks(
          {
            encoderConfig: 'music_standard',
            AEC: true,
            AGC: true,
            ANS: true,
          },
          {
            facingMode: 'user',
            optimizationMode: 'motion',
          },
        );
      return { audioTrack, videoTrack };
    } else {
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: 'music_standard',
        AEC: true,
        AGC: true,
        ANS: true,
      });
      return { audioTrack, videoTrack: null };
    }
  } catch (error) {
    console.error('[Agora] Failed to recreate tracks:', error);
    return null;
  }
};

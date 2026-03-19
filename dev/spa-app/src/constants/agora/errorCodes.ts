/**
 * Agora RTC SDK エラーコード定数
 * @see https://api-ref.agora.io/en/video-sdk/web/4.x/index.html
 */
export const AGORA_ERROR_CODES = {
  /** カメラ・マイクの使用が許可されていない */
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  /** カメラまたはマイクが見つからない */
  DEVICE_NOT_FOUND: 'DEVICE_NOT_FOUND',
  /** デバイスが他のアプリで使用中などで読み取り不可 */
  NOT_READABLE: 'NOT_READABLE',
  /** 複数のビデオトラックをpublishしようとした */
  CAN_NOT_PUBLISH_MULTIPLE_VIDEO_TRACKS:
    'CAN_NOT_PUBLISH_MULTIPLE_VIDEO_TRACKS',
  /** 無効化されたビデオトラックが存在する */
  EXIST_DISABLED_VIDEO_TRACK: 'EXIST_DISABLED_VIDEO_TRACK',
  /** 無効なローカルトラック */
  INVALID_LOCAL_TRACK: 'INVALID_LOCAL_TRACK',
} as const;

export type AgoraErrorCode =
  (typeof AGORA_ERROR_CODES)[keyof typeof AGORA_ERROR_CODES];

/**
 * Agora SDK の exception イベントコード
 * @see https://api-ref.agora.io/en/video-sdk/web/4.x/index.html
 *
 * SDK バージョンにより 2000 番台と 4000 番台の両方が送信される:
 * - 2001/2002: AUDIO_INPUT_LEVEL_TOO_LOW / RECOVER（旧コード）
 * - 2003/2004: SEND_AUDIO_BITRATE_TOO_LOW / RECOVER（旧コード）
 * - 4001: AUDIO_INPUT_LEVEL_TOO_LOW_RECOVER（新コード）
 * - 4002: AUDIO_OUTPUT_LEVEL_TOO_LOW_RECOVER（新コード）
 * - 4003: SEND_AUDIO_BITRATE_TOO_LOW_RECOVER（新コード）
 * - 1005: RECV_VIDEO_DECODE_FAILED（受信映像のデコード失敗、一時的）
 */
export const AGORA_EXCEPTION_CODES = {
  // 旧コード（2000番台）
  AUDIO_INPUT_LEVEL_TOO_LOW: 2001,
  AUDIO_INPUT_LEVEL_TOO_LOW_RECOVER: 2002,
  SEND_AUDIO_BITRATE_TOO_LOW: 2003,
  SEND_AUDIO_BITRATE_TOO_LOW_RECOVER: 2004,
  // 新コード（4000番台）
  AUDIO_INPUT_LEVEL_TOO_LOW_RECOVER_V2: 4001,
  AUDIO_OUTPUT_LEVEL_TOO_LOW_RECOVER: 4002,
  SEND_AUDIO_BITRATE_TOO_LOW_RECOVER_V2: 4003,
  // 映像デコード系
  RECV_VIDEO_DECODE_FAILED: 1005,
} as const;

/**
 * Sentry error として送信しない非クリティカルな exception コード
 * 音量・ビットレート系の警告および一時的なデコード失敗は breadcrumb のみ記録する
 */
export const NON_CRITICAL_EXCEPTION_CODES = new Set<number>(
  Object.values(AGORA_EXCEPTION_CODES),
);

/** マイク音量のデフォルト値（Agora SDK デフォルト） */
export const AUDIO_VOLUME_DEFAULT = 100;

/** AUDIO_INPUT_LEVEL_TOO_LOW 検知時のブースト値 */
export const AUDIO_VOLUME_BOOSTED = 150;

/**
 * RTMログインのタイムアウト時間（ms）
 * 着信画面でRTMログインがこの時間内に完了しない場合、着信画面を閉じる
 */
export const RTM_LOGIN_TIMEOUT_MS = 8_000;

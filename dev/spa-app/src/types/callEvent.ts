/**
 * GA4通話イベントのパラメータ型定義
 */

/**
 * GA4イベント用の通話タイプ
 */
export enum GA4CallType {
  VIDEO_CALL = 'video_call',
  VOICE_CALL = 'voice_call',
  VIDEO_CHAT = 'video_chat',
}

/**
 * 通話終了理由
 */
export enum CallEndReason {
  // 既存カテゴリ（後方互換用の上位概念）
  PT_SHORTAGE = 'pt_shortage',
  REMOTE_HANGUP = 'remote_hangup',
  LOCAL_HANGUP = 'local_hangup',
  UNEXPECTED_ERROR = 'unexpected_error',

  // 詳細化された理由（分析用）
  // ユーザー操作（ローカル）
  LOCAL_HANGUP_MANUAL = 'local_hangup_manual',
  LOCAL_TAB_CLOSE = 'local_tab_close',
  LOCAL_UNMOUNT_NAVIGATION = 'local_unmount_navigation',

  // 相手側
  REMOTE_DECLINED = 'remote_declined',
  REMOTE_NO_ANSWER_TIMEOUT = 'remote_no_answer_timeout',

  // デバイス/権限
  DEVICE_PERMISSION_DENIED = 'device_permission_denied',
  DEVICE_NOT_FOUND = 'device_not_found',
  DEVICE_IN_USE_OR_NOT_READABLE = 'device_in_use_or_not_readable',

  // メディア再生
  MEDIA_PLAY_ERROR_VIDEO = 'media_play_error_video',
  MEDIA_PLAY_ERROR_AUDIO = 'media_play_error_audio',

  // publish/ローカルトラック
  PUBLISH_FAILED = 'publish_failed',
  PUBLISH_FAILED_INVALID_LOCAL_TRACK = 'publish_failed_invalid_local_track',
  PUBLISH_FAILED_MULTIPLE_VIDEO_TRACKS = 'publish_failed_multiple_video_tracks',
  PUBLISH_FAILED_DISABLED_VIDEO_TRACK = 'publish_failed_disabled_video_track',

  // ネットワーク/RTC 切断
  RTC_DISCONNECTED_KEEP_ALIVE_TIMEOUT = 'rtc_disconnected_keep_alive_timeout',
  RTC_DISCONNECTED_LOST = 'rtc_disconnected_lost',
  RTC_DISCONNECTED_REJECTED_BY_SERVER = 'rtc_disconnected_rejected_by_server',
  RTC_DISCONNECTED_BANNED = 'rtc_disconnected_banned',
  RTC_RECONNECTING_THEN_FAILED = 'rtc_reconnecting_then_failed',

  // SDK 例外
  SDK_EXCEPTION = 'sdk_exception',

  // メディア受信タイムアウト
  VIDEO_FRAME_TIMEOUT = 'video_frame_timeout',
  AUDIO_FRAME_TIMEOUT = 'audio_frame_timeout',
}

/**
 * CALL_STARTED イベントパラメータ
 * 通話開始時に送信するイベントのパラメータ
 */
export type CallStartedParams = {
  call_id: string;
  user_id: string;
  partner_id: string;
  started_at: string;
  type: GA4CallType;
};

/**
 * CALL_ENDED イベントパラメータ
 * 通話終了時に送信するイベントのパラメータ
 */
export type CallEndedParams = {
  call_id: string;
  user_id: string;
  partner_id: string;
  ended_at: string;
  reason: CallEndReason;
  type: GA4CallType;
  // 任意の補助パラメータ（存在時のみ送信）
  duration_sec?: number;
  rtc_state_reason?: string;
  agora_error_code?: string;
  sdk_exception_code?: string | number;
  sdk_exception_msg?: string;
  device_category?: string;
  // ネットワーク品質サマリー（通話終了時に付与）
  avg_uplink_quality?: number;
  avg_downlink_quality?: number;
  min_downlink_quality?: number;
  poor_quality_count?: number;
  sample_count?: number;
};

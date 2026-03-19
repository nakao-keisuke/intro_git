export const CALL_ERROR_CATEGORY = {
  AUDIO_PLAY_FAILURE: 'AudioError.PlayFailure',
  AUDIO_FRAME_TIMEOUT: 'AudioError.FrameTimeout',
  AUDIO_AUTOPLAY_BLOCKED: 'AudioError.AutoplayBlocked',
  VIDEO_PLAY_FAILURE: 'VideoError.PlayFailure',
  VIDEO_FRAME_TIMEOUT: 'VideoError.FrameTimeout',
  DEVICE_PERMISSION_DENIED: 'DeviceError.PermissionDenied',
  DEVICE_NOT_FOUND: 'DeviceError.NotFound',
  DEVICE_NOT_READABLE: 'DeviceError.NotReadable',
  RTC_DISCONNECT_KEEPALIVE: 'DisconnectError.KeepAliveTimeout',
  RTC_DISCONNECT_LOST: 'DisconnectError.ConnectionLost',
  RTC_DISCONNECT_REJECTED: 'DisconnectError.RejectedByServer',
  RTC_DISCONNECT_BANNED: 'DisconnectError.Banned',
  RTC_RECONNECT_FAILED: 'DisconnectError.ReconnectFailed',
  PUBLISH_FAILED: 'PublishError.Failed',
  PUBLISH_INVALID_TRACK: 'PublishError.InvalidTrack',
  RTM_LOGIN_FAILED: 'RTMError.LoginFailed',
  RTM_SUBSCRIBE_FAILED: 'RTMError.SubscribeFailed',
  RTM_MESSAGE_PARSE: 'RTMError.MessageParse',
  POINT_SHORTAGE: 'PointError.Shortage',
  POINT_TOKEN_REFRESH_FAILED: 'PointError.TokenRefreshFailed',
  /** ネットワーク接続エラー（fetch失敗） */
  POINT_NETWORK_ERROR: 'PointError.NetworkError',
  /** サーバーが明示的にエラーを返却（code≠0, ≠70） */
  POINT_SERVER_ERROR: 'PointError.ServerError',
  /** API成功(code=0)だがポイントデータが欠落 */
  POINT_DATA_MISSING: 'PointError.DataMissing',
  /** リクエストタイムアウト（AbortError） */
  POINT_TIMEOUT: 'PointError.Timeout',
  /** Lovense送信時の投稿エラー */
  LOVENSE_POST_ERROR: 'LovenseError.PostError',
  UNMOUNT_UNEXPECTED: 'UnmountError.Unexpected',
  SDK_EXCEPTION: 'SDKError.Exception',

  // 1. 相手がpublishできていない検知
  REMOTE_PUBLISH_TIMEOUT: 'PublishError.RemoteTimeout',
  REMOTE_PUBLISH_NOT_DETECTED: 'PublishError.RemoteNotDetected',

  // 2. subscribeできていない検知
  SUBSCRIBE_FAILED: 'SubscribeError.Failed',
  SUBSCRIBE_INVALID_USER: 'SubscribeError.InvalidUser',
  SUBSCRIBE_NOT_PUBLISHED: 'SubscribeError.NotPublished',
  SUBSCRIBE_ABORTED: 'SubscribeError.Aborted',
  SUBSCRIBE_TRACK_UNDEFINED: 'SubscribeError.TrackUndefined',

  // 3. play()未実行検知
  PLAY_NOT_CALLED_AUDIO: 'AudioError.PlayNotCalled',
  PLAY_NOT_CALLED_VIDEO: 'VideoError.PlayNotCalled',

  // 4. デコードできていない検知
  VIDEO_ELEMENT_NOT_VISIBLE: 'VideoError.ElementNotVisible',
  VIDEO_STREAM_FALLBACK: 'VideoError.StreamFallback',
  VIDEO_STATE_ABNORMAL: 'VideoError.StateAbnormal',

  // 5. stats タイムアウト・品質劣化
  VIDEO_STATS_TIMEOUT: 'VideoError.StatsTimeout',
  AUDIO_STATS_TIMEOUT: 'AudioError.StatsTimeout',
  VIDEO_QUALITY_DEGRADED: 'VideoError.QualityDegraded',
  AUDIO_QUALITY_DEGRADED: 'AudioError.QualityDegraded',
  SUBSCRIBE_RETRY_FAILED: 'SubscribeError.RetryFailed',
} as const;

export type CallErrorCategory =
  (typeof CALL_ERROR_CATEGORY)[keyof typeof CALL_ERROR_CATEGORY];

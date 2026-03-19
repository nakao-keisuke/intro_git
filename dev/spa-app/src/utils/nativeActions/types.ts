/**
 * Native アプリに送信するアクションタイプの定義
 * 新しいアクションを追加する場合はここに追加する
 */
export const NativeActionType = {
  /** プッシュ通知の許可リクエスト（通知設定モーダルを開く） */
  REQUEST_PUSH_PERMISSION: 'REQUEST_PUSH_PERMISSION',
  /** レビューモーダルを開く */
  REQUEST_APP_REVIEW: 'REQUEST_APP_REVIEW',
  /** 設定画面を開く */
  OPEN_SETTINGS: 'OPEN_SETTINGS',
  /** カメラ権限をリクエスト */
  REQUEST_CAMERA_PERMISSION: 'REQUEST_CAMERA_PERMISSION',
  /** マイク権限をリクエスト */
  REQUEST_MICROPHONE_PERMISSION: 'REQUEST_MICROPHONE_PERMISSION',
} as const;

export type NativeActionType =
  (typeof NativeActionType)[keyof typeof NativeActionType];

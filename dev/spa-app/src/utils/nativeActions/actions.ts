import { sendMessageToWebView } from '@/utils/webview';

import { NativeActionType } from './types';

/**
 * Nativeアプリにプッシュ通知の許可リクエストを送信する
 * Native側で通知設定モーダルが開く
 *
 * @returns Promise<unknown> - Nativeからのレスポンス（タイムアウト時はnullに解決される）
 */
export const requestPushPermission = (): Promise<unknown> => {
  return sendMessageToWebView({
    type: NativeActionType.REQUEST_PUSH_PERMISSION,
  });
};

/**
 * Nativeアプリにアプリレビューのリクエストを送信する
 * Native側でレビューモーダルが開く
 *
 * @returns Promise<unknown> - Nativeからのレスポンス（タイムアウト時はnullに解決される）
 */
export const requestAppReview = (): Promise<unknown> => {
  return sendMessageToWebView({
    type: NativeActionType.REQUEST_APP_REVIEW,
  });
};

/**
 * Nativeアプリの設定画面を開く
 *
 * @returns Promise<unknown> - Nativeからのレスポンス（タイムアウト時はnullに解決される）
 */
export const openSettings = (): Promise<unknown> => {
  return sendMessageToWebView({
    type: NativeActionType.OPEN_SETTINGS,
  });
};

/**
 * Nativeアプリにカメラの許可リクエストを送信する
 * Native側でカメラ権限の確認・リクエストが行われる
 *
 * @returns Promise<unknown> - Nativeからのレスポンス（タイムアウト時はnullに解決される）
 */
export const requestCameraPermission = (): Promise<unknown> => {
  return sendMessageToWebView({
    type: NativeActionType.REQUEST_CAMERA_PERMISSION,
  });
};

/**
 * Nativeアプリにマイクの許可リクエストを送信する
 * Native側でマイク権限の確認・リクエストが行われる
 *
 * @returns Promise<unknown> - Nativeからのレスポンス（タイムアウト時はnullに解決される）
 */
export const requestMicrophonePermission = (): Promise<unknown> => {
  return sendMessageToWebView({
    type: NativeActionType.REQUEST_MICROPHONE_PERMISSION,
  });
};

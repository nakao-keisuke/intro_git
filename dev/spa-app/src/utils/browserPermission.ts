export type BrowserPermissionStatus =
  | 'granted'
  | 'denied'
  | 'prompt'
  | 'unsupported';

/**
 * Permissions API でブラウザのパーミッションステータスを確認
 * Safari は Permissions API の camera/microphone に非対応のため 'unsupported' を返す
 */
export async function queryBrowserPermission(
  target: 'camera' | 'microphone',
): Promise<BrowserPermissionStatus> {
  try {
    if (!navigator.permissions?.query) return 'unsupported';
    const result = await navigator.permissions.query({
      name: target as PermissionName,
    });
    if (
      result.state === 'granted' ||
      result.state === 'denied' ||
      result.state === 'prompt'
    ) {
      return result.state;
    }
    return 'unsupported';
  } catch {
    // Safari など非対応ブラウザでは TypeError が投げられる
    return 'unsupported';
  }
}

/**
 * getUserMedia() でブラウザの許可プロンプトを表示し、許可/拒否を判定
 * 許可された場合はトラックを即座に停止して true を返す
 */
export async function requestBrowserPermission(
  callType: 'video' | 'voice',
): Promise<boolean> {
  try {
    const constraints: MediaStreamConstraints =
      callType === 'video'
        ? { video: true, audio: true }
        : { video: false, audio: true };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    // 許可されたら即座にトラックを停止（リソース解放）
    for (const track of stream.getTracks()) {
      track.stop();
    }
    return true;
  } catch (error) {
    console.warn('[browserPermission] getUserMedia failed:', error);
    return false;
  }
}

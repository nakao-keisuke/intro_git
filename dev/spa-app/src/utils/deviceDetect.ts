/**
 * デバイスタイプの列挙型
 */
export enum DeviceType {
  ANDROID = 'android',
  IOS = 'ios',
  BROWSER = 'browser',
}

/**
 * 現在のデバイスタイプを検出する
 * @returns {DeviceType} デバイスタイプ
 */
export const detectDeviceType = (): DeviceType => {
  // サーバーサイドの場合はブラウザとして扱う
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return DeviceType.BROWSER;
  }

  const userAgent = navigator.userAgent.toLowerCase();

  // iOS検出
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return DeviceType.IOS;
  }

  // Android検出
  if (/android/.test(userAgent)) {
    return DeviceType.ANDROID;
  }

  // それ以外はブラウザ
  return DeviceType.BROWSER;
};

/**
 * デバイスタイプ別の通知設定手順を取得
 * @param {DeviceType} deviceType デバイスタイプ
 * @returns {string} 通知設定の手順説明
 */
export const getNotificationSettingsGuide = (
  deviceType: DeviceType,
): string => {
  switch (deviceType) {
    case DeviceType.ANDROID:
      return '1. スマホの「設定」アプリを開く\n2. 「アプリ」または「アプリと通知」を選択\n3. アプリ一覧から「Utage」を探して選択\n4. 「通知」をタップ\n5. 「許可」をオンに設定';

    case DeviceType.IOS:
      return '1. スマホの「設定」アプリを開く\n2. 下にスクロールして「Utage」を選択\n3. 「通知」をタップ\n4. 「通知を許可」をオンに設定';

    case DeviceType.BROWSER:
      return '1. ブラウザのアドレスバー左側の鍵アイコンをクリック\n2. 「サイトの設定」を選択\n3. 「通知」の項目を「許可」に変更';

    default:
      return '設定アプリから通知設定を変更できます。';
  }
};

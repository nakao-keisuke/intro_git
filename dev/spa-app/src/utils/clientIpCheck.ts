// フロントエンド用のシンプルなIP制限

// 許可するIPアドレス
const ALLOWED_IP = '221.248.24.234';

/**
 * クライアントのIPを取得する（外部APIを使用）
 */
export const getClientIp = async (): Promise<string | null> => {
  try {
    // 外部のIP確認サービスを使用
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.log('IP取得に失敗:', error);
    return null;
  }
};

/**
 * フリーマーケットセクションを表示するかどうかを判定
 */
export const shouldShowFleaMarket = async (): Promise<boolean> => {
  // 開発環境では常に表示
  if (import.meta.env.NODE_ENV === 'development') {
    return true;
  }

  try {
    const clientIp = await getClientIp();

    if (!clientIp) {
      // IPが取得できない場合は表示
      return true;
    }

    // 許可されたIPかチェック
    return clientIp === ALLOWED_IP;
  } catch (error) {
    console.log('IP制限チェックに失敗:', error);
    // エラーの場合は表示
    return true;
  }
};

/**
 * LINE登録ボタンを表示するかどうかを判定
 */
export const shouldShowLineRegister = async (): Promise<boolean> => {
  // 開発環境では常に表示
  if (import.meta.env.NODE_ENV === 'development') {
    return true;
  }

  try {
    const clientIp = await getClientIp();

    if (!clientIp) {
      // IPが取得できない場合は非表示
      return false;
    }

    // 許可されたIPかチェック
    return clientIp === ALLOWED_IP;
  } catch (error) {
    console.log('IP制限チェックに失敗:', error);
    // エラーの場合は非表示
    return false;
  }
};

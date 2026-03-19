// Lovenseルーレット機能のエラーメッセージ定数

export const LOVENSE_ERROR_MESSAGES = {
  // ネットワークエラー
  NETWORK_ERROR:
    'ネットワークエラーが発生しました。通信状況を確認して再度お試しください。',

  // API関連エラー
  API_ERROR:
    'サーバーエラーが発生しました。しばらく待ってから再度お試しください。',
  TICKET_SAVE_ERROR: 'チケットの保存に失敗しました。',
  TICKET_INFO_FETCH_ERROR: 'チケット情報の取得に失敗しました。',
  TICKET_USE_ERROR: 'チケットの使用に失敗しました。',

  // Lovense関連エラー
  LOVENSE_OFFLINE: '相手のLovenseがオフライン状態です。',
  LOVENSE_CONNECTION_ERROR: 'Lovenseとの接続エラーが発生しました。',

  // ルーレット関連エラー
  ROULETTE_SPIN_ERROR: 'ルーレットの実行中にエラーが発生しました。',
  INVALID_PRIZE_DATA: 'ルーレットの結果データが不正です。',
  ALREADY_PLAYED_TODAY:
    '本日はすでにルーレットを回しています。明日また挑戦してください。',

  // 制限関連エラー
  NO_TICKETS_AVAILABLE: 'チケットが不足しています。',
  CAMPAIGN_NOT_ACTIVE: '現在キャンペーンは実施されていません。',

  // ポイント関連エラー
  INSUFFICIENT_POINTS: 'ポイントが不足しています。',
  POINT_PAYMENT_ERROR: 'ポイントの支払い処理でエラーが発生しました。',

  // 一般的なエラー
  UNKNOWN_ERROR: '予期しないエラーが発生しました。',
  TRY_AGAIN_LATER:
    'エラーが発生しました。しばらく待ってから再度お試しください。',
} as const;

export type LovenseErrorType = keyof typeof LOVENSE_ERROR_MESSAGES;

// エラーの詳細情報を取得
export const getLovenseErrorDetails = (
  error: any,
): {
  message: string;
  type: LovenseErrorType;
  isRetryable: boolean;
} => {
  // ネットワークエラーの判定
  if (error?.code === 'NETWORK_ERROR' || !navigator.onLine) {
    return {
      message: LOVENSE_ERROR_MESSAGES.NETWORK_ERROR,
      type: 'NETWORK_ERROR',
      isRetryable: true,
    };
  }

  // Lovenseオフラインエラー
  if (error?.isLovenseOffline || error?.message?.includes('offline')) {
    return {
      message: LOVENSE_ERROR_MESSAGES.LOVENSE_OFFLINE,
      type: 'LOVENSE_OFFLINE',
      isRetryable: false,
    };
  }

  // ポイント不足エラー
  if (
    error?.message?.includes('ポイント') ||
    error?.code === 'INSUFFICIENT_POINTS'
  ) {
    return {
      message: LOVENSE_ERROR_MESSAGES.INSUFFICIENT_POINTS,
      type: 'INSUFFICIENT_POINTS',
      isRetryable: false,
    };
  }

  // APIエラー
  if (error?.response?.status >= 500) {
    return {
      message: LOVENSE_ERROR_MESSAGES.API_ERROR,
      type: 'API_ERROR',
      isRetryable: true,
    };
  }

  // デフォルト
  return {
    message: LOVENSE_ERROR_MESSAGES.UNKNOWN_ERROR,
    type: 'UNKNOWN_ERROR',
    isRetryable: false,
  };
};

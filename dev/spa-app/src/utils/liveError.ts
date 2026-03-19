/** ライブ配信の入室エラーをユーザー向けメッセージに変換する */
export const getLiveErrorMessage = (err: unknown): string => {
  if (!(err instanceof Error)) {
    return '入室処理に失敗しました。後でもう一度お試しください。';
  }

  if (err.message.includes('-11033') || err.message.includes('offline')) {
    return 'この配信は終了しました';
  }

  if (err.message.includes('配信に入室できませんでした')) {
    return err.message;
  }

  return '入室処理に失敗しました。後でもう一度お試しください。';
};

/** 配信終了メッセージかどうかを判定する */
export const isChannelEndedMessage = (msg: string): boolean =>
  msg === 'この配信は終了しました';

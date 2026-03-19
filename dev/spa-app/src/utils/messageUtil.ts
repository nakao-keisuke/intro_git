import { isValid } from './mongodb';

export const lastMessage = (
  msgType: string,
  lastMsg: string,
  isOwn: boolean,
): string => {
  if (msgType === 'ABSENCECALL') {
    if (lastMsg.includes('|')) return '通話が終了しました';
    return isOwn ? '発信キャンセル' : '不在着信';
  }
  if (msgType === 'STK') return 'スタンプ';
  if (lastMsg.includes('|p|')) {
    if (isOwn) return '画像を送信しました';
    return '画像が届きました';
  }
  if (lastMsg.includes('|v|')) {
    if (isOwn) return '動画を送信しました';
    return '動画が届きました';
  }
  if (lastMsg.includes('|a|')) {
    if (isOwn) return 'ボイスメッセージを送信しました';
    return 'ボイスメッセージが届きました';
  }
  if (isValid(lastMsg.trim())) {
    return '⚠︎お相手がメディアのアップロードに失敗しました。';
  }
  return lastMsg;
};

export const sentTimeString = (sentTime: string): string => {
  const month = parseInt(sentTime.slice(4, 6), 10);
  const day = parseInt(sentTime.slice(6, 8), 10);
  const hour = parseInt(sentTime.slice(8, 10), 10);
  const minute = parseInt(sentTime.slice(10, 12), 10);
  return `${month}/${day} ${hour}:${minute}`;
};

//時刻文字列から各要素を抽出
export const formatChatDateTime = (timeString: string): string => {
  const year = parseInt(timeString.slice(0, 4), 10);
  const month = parseInt(timeString.slice(4, 6), 10);
  const day = parseInt(timeString.slice(6, 8), 10);
  const hour = parseInt(timeString.slice(8, 10), 10);
  const minute = parseInt(timeString.slice(10, 12), 10);
  const second = parseInt(timeString.slice(12, 14), 10);

  //時刻文字列からDateオブジェクトを生成
  const date = new Date(year, month - 1, day, hour, minute, second);

  //タイムゾーンオフセットを考慮した日付を作成
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  //表示フォーマットのオプションを設定(2桁の数字で表示)
  const options: Intl.DateTimeFormatOptions = {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Tokyo',
  };

  //日本のロケールでフォーマットして返す
  return localDate.toLocaleString('ja-JP', options);
};

export type ParsedMessage = {
  displayText: string;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'stamp' | 'system';
  fileId?: string;
};

export const parseLastMessage = (
  msgType: string,
  lastMsg: string,
  isOwn: boolean,
): ParsedMessage => {
  const displayText = lastMessage(msgType, lastMsg, isOwn);
  const mediaMatch = lastMsg.match(/\|(p|v|a)\|([^|]+)/);

  if (mediaMatch) {
    const mediaType = mediaMatch[1]; // 'p', 'v', or 'a'
    const fileId = mediaMatch[2];

    const base = { displayText };

    if (mediaType === 'p') {
      return { ...base, messageType: 'image', ...(fileId && { fileId }) };
    }
    if (mediaType === 'v') {
      return { ...base, messageType: 'video', ...(fileId && { fileId }) };
    }
    if (mediaType === 'a') {
      return { ...base, messageType: 'audio', ...(fileId && { fileId }) };
    }
  }

  if (msgType === 'STK') {
    return { displayText, messageType: 'stamp' };
  }
  if (msgType === 'ABSENCECALL') {
    return { displayText, messageType: 'system' };
  }

  return { displayText, messageType: 'text' };
};

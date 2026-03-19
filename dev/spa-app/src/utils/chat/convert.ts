import type {
  GetChatHistoryResponseData,
  GetChatHistoryResponseElementData,
  MsgType,
} from '@/apis/get-chat-history';
import type { ChatInfo, ChatType } from '@/types/ChatInfo';
import { convertToSentTimeJST } from '@/utils/timeUti';

/**
 * チャットAPIの素データを UI で扱いやすい ChatInfo/ChatType に変換するためのユーティリティ。
 *
 * 背景と前提:
 * - メッセージの content には、テキスト以外に独自フォーマットが混在します。
 *   - 画像: "...|p|<FILE_ID>..."
 *   - 動画: "...|v|<FILE_ID>|<秒数>"
 *   - スタンプ: "<CATEGORY_ID>_<CODE>"
 * - 画像/動画が「購入済み」かどうかで UI 上の種別が変わります（未購入の場合はサムネイル/ロック表示等）。
 * - ただし「自分が送信したメディア」は購入有無に関わらず常に閲覧可能とするビジネスルールがあります。
 */

/**
 * サーバー側のメッセージ型 + content から、UI上の ChatType を判別する。
 * @param type    サーバーのメッセージ種別（例: TEXT/FILE/STK/ABSENCECALL など）
 * @param content サーバーが返すメッセージ本文（独自フォーマットを含む）
 * @param purchasedFileIds 購入済みの file_id 一覧（画像/動画判定に使用）
 */
export const convertType = (
  type: MsgType,
  content: string,
  purchasedFileIds: readonly string[],
): ChatType => {
  // 先に content の中身でメディアタイプを判定（msg_typeが正しくない場合の防御）
  // 動画: content 例 "...|v|<FILE_ID>|<秒数>"
  if (content.includes('|v|')) {
    if (
      purchasedFileIds.includes(content.split('|v|')[1]?.substring(0, 24) ?? '')
    )
      return 'video';
    return 'unpurchased_video';
  }
  // 画像: content 例 "...|p|<FILE_ID>..."
  if (content.includes('|p|')) {
    if (
      purchasedFileIds.includes(content.split('|p|')[1]?.substring(0, 24) ?? '')
    )
      return 'image';
    return 'unpurchased_image';
  }
  // 音声: content 例 "...|a|<FILE_ID>..."
  if (content.includes('|a|')) {
    if (
      purchasedFileIds.includes(content.split('|a|')[1]?.substring(0, 24) ?? '')
    )
      return 'audio';
    return 'unpurchased_audio';
  }

  // msg_type による判定
  if (type === 'STK') return 'sticker';
  if (type === 'FILE') {
    // ここに到達するのは msg_type が FILE だが content に特殊フォーマットがない場合
    return 'error_media';
  }
  if (type === 'ABSENCECALL') {
    // 不在着信ログ（"<本文>|<通話秒数>" の形式がある）
    if (content.includes('|')) return 'call_log';
    return 'absence_call';
  }
  return 'text';
};

/**
 * サーバーの1件の履歴要素を ChatInfo に変換する（snake_case版）
 * - 自分が送信したメディアは未購入扱いにしない（常に閲覧可）
 * - sentTime は UI の並び替え用に Unix time へ変換
 * @deprecated ServerHttpClient経由の場合は convertToChatInfoFromCamelCase を使用してください
 */
export const convertToChatInfo = (
  data: GetChatHistoryResponseElementData,
  purchasedFileIds: readonly string[],
): ChatInfo => {
  // まず購入状況からタイプを決定
  let type = convertType(data.msg_type, data.content, purchasedFileIds);
  // 自分が送信したメディアは常に閲覧可能にする（未購入扱いにしない）
  if (data.is_own) {
    if (type === 'unpurchased_image') type = 'image';
    if (type === 'unpurchased_video') type = 'video';
    if (type === 'unpurchased_audio') type = 'audio';
  }
  // 送信者ごとに共通で持つメタ情報
  // JSTミリ秒へ変換
  const __sentTimeMs = convertToSentTimeJST(data.time_stamp);
  const commonChatInfo = data.is_own
    ? {
        id: data.msg_id,
        isOwn: data.is_own,
        sentTime: __sentTimeMs,
        isRead: !!data.read_time,
        timeStamp: data.time_stamp,
      }
    : {
        id: data.msg_id,
        isOwn: data.is_own,
        sentTime: __sentTimeMs,
        timeStamp: data.time_stamp,
      };
  switch (type) {
    case 'text':
      return {
        type: type,
        text: data.content,
        ...commonChatInfo,
      };
    case 'unpurchased_image':
    case 'image':
      return {
        type: type,
        imageId: data.content.split('|p|')[1]?.substring(0, 24) ?? '',
        isRead: !!data.read_time,
        ...commonChatInfo,
      };
    case 'video': {
      // 動画は content に再生秒数が含まれる（"...|v|<FILE_ID>|<秒数>"）
      const number = Math.trunc(
        Number(data.content.split('|v|')[1]?.split('|')[1] ?? '0'),
      );
      const paddedNumber = String(number).padStart(2, '0');
      return {
        type: type,
        fileId: data.content.split('|v|')[1]?.substring(0, 24) ?? '',
        duration: `00:${paddedNumber}`,
        ...commonChatInfo,
      };
    }
    case 'call_log': {
      // content: "<本文>|<通話秒数>"
      const callTime = parseInt(data.content.split('|')[1] ?? '0', 10);
      const hour = Math.floor(callTime / 3600);
      const minute = Math.floor((callTime % 3600) / 60);
      const second = callTime % 60;
      return {
        type: type,
        duration: `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}:${second.toString().padStart(2, '0')}`,
        text: data.content.split('|')[0] ?? '',
        ...commonChatInfo,
      };
    }
    case 'unpurchased_video': {
      // 未購入動画は FILE_ID のみ取り出してUI側でロック表示などを行う
      const thumbnailId = data.content.split('|v|')[1]?.substring(0, 24) ?? '';
      return {
        type: type,
        fileId: thumbnailId,
        duration: `00:${Math.trunc(
          Number(data.content.split('|v|')[1]?.split('|')[1] ?? '0'),
        )}`,
        ...commonChatInfo,
      };
    }
    case 'sticker': {
      // スタンプは "<CATEGORY_ID>_<CODE>" 形式
      return {
        type: type,
        categoryId: data.content.split('_')[0] ?? '',
        code: data.content.split('_')[1] ?? '',
        ...commonChatInfo,
      };
    }
    case 'absence_call':
    case 'error_media':
      return {
        type: type,
        ...commonChatInfo,
      };
    case 'unpurchased_audio': {
      const audioPayload = data.content.split('|a|')[1] ?? '';
      const [rawFileId, rawDuration] = audioPayload.split('|');
      const audioId = rawFileId?.substring(0, 24) ?? '';
      const durationSeconds = Number(rawDuration);
      const formattedDuration = Number.isFinite(durationSeconds)
        ? (() => {
            const minutes = Math.floor(durationSeconds / 60);
            const seconds = Math.max(0, durationSeconds % 60);
            return `${minutes.toString().padStart(2, '0')}:${seconds
              .toString()
              .padStart(2, '0')}`;
          })()
        : undefined;

      return {
        type: type,
        audioId,
        ...(formattedDuration ? { duration: formattedDuration } : {}),
        ...commonChatInfo,
      };
    }
    case 'audio': {
      // 音声メッセージは "...|a|<FILE_ID>|<durationSeconds>" の独自形式で返る
      const audioPayload = data.content.split('|a|')[1] ?? '';
      const [rawFileId, rawDuration] = audioPayload.split('|');
      const audioId = rawFileId?.substring(0, 24) ?? '';
      const durationSeconds = Number(rawDuration);
      const formattedDuration = Number.isFinite(durationSeconds)
        ? (() => {
            // 秒数を UI 表示用の mm:ss へ変換（表示不要なら undefined を返す）
            const minutes = Math.floor(durationSeconds / 60);
            const seconds = Math.max(0, durationSeconds % 60);
            return `${minutes.toString().padStart(2, '0')}:${seconds
              .toString()
              .padStart(2, '0')}`;
          })()
        : undefined;

      return {
        type: type,
        audioId,
        ...(formattedDuration ? { duration: formattedDuration } : {}),
        ...commonChatInfo,
      };
    }
  }
};

/**
 * サーバーの1件の履歴要素を ChatInfo に変換する（camelCase版）
 * ServerHttpClient経由のレスポンスに対応
 * - 自分が送信したメディアは未購入扱いにしない（常に閲覧可）
 * - sentTime は UI の並び替え用に Unix time へ変換
 */
export const convertToChatInfoFromCamelCase = (
  data: GetChatHistoryResponseData,
  purchasedFileIds: readonly string[],
): ChatInfo => {
  // まず購入状況からタイプを決定
  let type = convertType(data.msgType, data.content, purchasedFileIds);

  // 自分が送信したメディアは常に閲覧可能にする（未購入扱いにしない）
  if (data.isOwn) {
    if (type === 'unpurchased_image') type = 'image';
    if (type === 'unpurchased_video') type = 'video';
    if (type === 'unpurchased_audio') type = 'audio';
  }

  // 送信者ごとに共通で持つメタ情報
  // JSTミリ秒へ変換
  const __sentTimeMs = convertToSentTimeJST(data.timeStamp);
  const commonChatInfo = data.isOwn
    ? {
        id: data.msgId,
        isOwn: data.isOwn,
        sentTime: __sentTimeMs,
        isRead: !!data.readTime,
        timeStamp: data.timeStamp,
      }
    : {
        id: data.msgId,
        isOwn: data.isOwn,
        sentTime: __sentTimeMs,
        timeStamp: data.timeStamp,
      };

  switch (type) {
    case 'text':
      return {
        type: type,
        text: data.content,
        ...commonChatInfo,
      };
    case 'unpurchased_image':
    case 'image':
      return {
        type: type,
        imageId: data.content.split('|p|')[1]?.substring(0, 24) ?? '',
        isRead: !!data.readTime,
        ...commonChatInfo,
      };
    case 'video': {
      const number = Math.trunc(
        Number(data.content.split('|v|')[1]?.split('|')[1] ?? '0'),
      );
      const paddedNumber = String(number).padStart(2, '0');
      return {
        type: type,
        fileId: data.content.split('|v|')[1]?.substring(0, 24) ?? '',
        duration: `00:${paddedNumber}`,
        ...commonChatInfo,
      };
    }
    case 'call_log': {
      const callTime = parseInt(data.content.split('|')[1] ?? '0', 10);
      const hour = Math.floor(callTime / 3600);
      const minute = Math.floor((callTime % 3600) / 60);
      const second = callTime % 60;
      return {
        type: type,
        duration: `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}:${second.toString().padStart(2, '0')}`,
        text: data.content.split('|')[0] ?? '',
        ...commonChatInfo,
      };
    }
    case 'unpurchased_video': {
      const thumbnailId = data.content.split('|v|')[1]?.substring(0, 24) ?? '';
      return {
        type: type,
        fileId: thumbnailId,
        duration: `00:${Math.trunc(
          Number(data.content.split('|v|')[1]?.split('|')[1] ?? '0'),
        )}`,
        ...commonChatInfo,
      };
    }
    case 'sticker': {
      return {
        type: type,
        categoryId: data.content.split('_')[0] ?? '',
        code: data.content.split('_')[1] ?? '',
        ...commonChatInfo,
      };
    }
    case 'absence_call':
    case 'error_media':
      return {
        type: type,
        ...commonChatInfo,
      };
    case 'unpurchased_audio': {
      const audioPayload = data.content.split('|a|')[1] ?? '';
      const [rawFileId, rawDuration] = audioPayload.split('|');
      const audioId = rawFileId?.substring(0, 24) ?? '';
      const durationSeconds = Number(rawDuration);
      const formattedDuration = Number.isFinite(durationSeconds)
        ? (() => {
            const minutes = Math.floor(durationSeconds / 60);
            const seconds = Math.max(0, durationSeconds % 60);
            return `${minutes.toString().padStart(2, '0')}:${seconds
              .toString()
              .padStart(2, '0')}`;
          })()
        : undefined;

      return {
        type: type,
        audioId,
        ...(formattedDuration ? { duration: formattedDuration } : {}),
        ...commonChatInfo,
      };
    }
    case 'audio': {
      const audioPayload = data.content.split('|a|')[1] ?? '';
      const [rawFileId, rawDuration] = audioPayload.split('|');
      const audioId = rawFileId?.substring(0, 24) ?? '';
      const durationSeconds = Number(rawDuration);
      const formattedDuration = Number.isFinite(durationSeconds)
        ? (() => {
            const minutes = Math.floor(durationSeconds / 60);
            const seconds = Math.max(0, durationSeconds % 60);
            return `${minutes.toString().padStart(2, '0')}:${seconds
              .toString()
              .padStart(2, '0')}`;
          })()
        : undefined;

      return {
        type: type,
        audioId,
        ...(formattedDuration ? { duration: formattedDuration } : {}),
        ...commonChatInfo,
      };
    }
  }
};

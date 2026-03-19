type ChatInfoBase<T extends string> = {
  readonly id: string;
  readonly type: T;
  readonly sentTime: number;
  readonly timeStamp: string;
} & (
  | {
      readonly isOwn: true;
      readonly isRead: boolean;
    }
  | {
      readonly isOwn: false;
    }
);

export type TextChatInfo = ChatInfoBase<'text'> & {
  readonly text: string;
};
export type UnpurchasedImageChatInfo = ChatInfoBase<'unpurchased_image'> & {
  readonly imageId: string;
};
export type ImageChatInfo = ChatInfoBase<'image'> & {
  readonly imageId: string;
};
export type UnpurchasedVideoChatInfo = ChatInfoBase<'unpurchased_video'> & {
  readonly fileId: string;
  readonly duration: string;
};
export type VideoChatInfo = ChatInfoBase<'video'> & {
  readonly fileId: string;
  readonly duration: string;
};
export type UnpurchasedAudioChatInfo = ChatInfoBase<'unpurchased_audio'> & {
  readonly audioId: string;
  readonly duration?: string;
};
export type AudioChatInfo = ChatInfoBase<'audio'> & {
  readonly audioId: string;
  readonly duration?: string;
};
export type StickerChatInfo = ChatInfoBase<'sticker'> & {
  readonly categoryId: string;
  readonly code: string;
};
export type CallLogChatInfo = ChatInfoBase<'call_log'> & {
  readonly duration: string;
  readonly text: string;
};
export type AbsenceCallChatInfo = ChatInfoBase<'absence_call'>;
export type ErrorMediaChatInfo = ChatInfoBase<'error_media'>;

export type ChatInfo =
  | TextChatInfo
  | UnpurchasedImageChatInfo
  | ImageChatInfo
  | UnpurchasedVideoChatInfo
  | VideoChatInfo
  | UnpurchasedAudioChatInfo
  | AudioChatInfo
  | StickerChatInfo
  | CallLogChatInfo
  | AbsenceCallChatInfo
  | ErrorMediaChatInfo;

export type ChatType = ChatInfo['type'];

// 楽観的更新用の送信ステータス
// 'sent' は不要（送信成功時は楽観的メッセージ自体が削除される）
export type MessageSendStatus = 'sending' | 'error' | 'sent';

// 楽観的付加フィールド
export type OptimisticFields = {
  readonly isOptimistic: true;
  readonly sendStatus: MessageSendStatus;
};

/**
 * 楽観的更新用のメッセージ型
 * 通常のChatInfoに送信状態（sending/error/sent）を付加したもの
 * 送信成功時はこの型から通常のChatInfoに変換される
 */
export type OptimisticMessage = (
  | TextChatInfo
  | StickerChatInfo
  | ImageChatInfo
  | VideoChatInfo
) &
  OptimisticFields;

// 楽観的メッセージを含むChatInfo型
export type ChatInfoWithOptimistic = ChatInfo | OptimisticMessage;

// 楽観的メッセージかどうかを判定するtype guard
export function isOptimisticMessage(
  message: ChatInfoWithOptimistic,
): message is OptimisticMessage {
  return (
    'isOptimistic' in message &&
    (message as OptimisticFields).isOptimistic === true
  );
}

export type NewChat = {
  readonly id: string;
  readonly partnerId: string;
  readonly partnerName: string;
  readonly lastMessage: string;
  readonly avatarId: string;
  readonly timeStamp: string;
  readonly imageId?: string;
  readonly videoId?: string;
  readonly audioId?: string;
  readonly msgType?: string;
};

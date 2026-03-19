export type ChannelInfo = {
  readonly rtcChannelToken: string;
  readonly rtmChannelToken?: string;
  readonly appId: string;
  readonly channelId: string;
  readonly peerId?: string;
  readonly userCount: number;
  readonly isPartnerInSecondApps?: boolean;
  readonly thumbnailImageId: string;
};

import type { LiveChannelInfo } from '@/services/shared/type';

/**
 * jambo-server から返却されるライブチャンネル情報の型（CamelCase）
 * get-live-channels と get-live-users で共通使用
 */
export type UpstreamLiveChannel = {
  broadcaster: {
    userId: string;
    userName: string;
    avaId: string;
    applicationId: string;
    hasLovense: boolean;
    bookmark: boolean;
    age: number;
    region: number;
    showingFaceStatus: number;
    videoCallWaiting: boolean;
    voiceCallWaiting: boolean;
    hLevel: string;
    isLiveNow: boolean;
    isNewUser: boolean;
    abt: string;
    bustSize?: string;
  };
  channelInfo: {
    channelId: string;
    callType: string;
    channelType: string;
    thumbnailImageId: string;
    userCount: number | null;
    rtcChannelToken: string;
    appId: string;
    rtmChannelToken: string;
    recordingId?: string;
  };
};

export type UpstreamLiveChannelList = {
  inLiveList: UpstreamLiveChannel[];
  standbyList: UpstreamLiveChannel[];
};

/**
 * jambo-server のレスポンスを LiveChannelInfo 型にマッピング
 */
export function mapUpstreamToLiveChannelInfo(
  item: UpstreamLiveChannel,
): LiveChannelInfo {
  return {
    broadcaster: {
      userId: item.broadcaster.userId,
      userName: item.broadcaster.userName,
      avaId: item.broadcaster.avaId,
      applicationId: item.broadcaster.applicationId,
      hasLovense: item.broadcaster.hasLovense,
      isBookMarked: item.broadcaster.bookmark,
      age: item.broadcaster.age,
      region: item.broadcaster.region,
      showingFaceStatus: item.broadcaster.showingFaceStatus,
      isVideoCallWaiting: item.broadcaster.videoCallWaiting,
      isVoiceCallWaiting: item.broadcaster.voiceCallWaiting,
      hLevel: item.broadcaster.hLevel,
      isLiveNow: item.broadcaster.isLiveNow,
      isNewUser: item.broadcaster.isNewUser,
      abt: item.broadcaster.abt,
      ...(item.broadcaster.bustSize
        ? { bustSize: item.broadcaster.bustSize }
        : {}),
    },
    channelInfo: {
      channelId: item.channelInfo.channelId,
      broadcasterId: item.broadcaster.userId,
      callType: item.channelInfo.callType,
      channelType: item.channelInfo.channelType,
      thumbnailImageId: item.channelInfo.thumbnailImageId,
      userCount: item.channelInfo.userCount,
      rtcChannelToken: item.channelInfo.rtcChannelToken,
      appId: item.channelInfo.appId,
      rtmChannelToken: item.channelInfo.rtmChannelToken,
      ...(item.channelInfo.recordingId
        ? { recordingId: item.channelInfo.recordingId }
        : {}),
    },
  };
}

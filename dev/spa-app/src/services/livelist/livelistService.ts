import { GET_LIVE_USERS } from '@/constants/endpoints';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
import { bodyType } from '@/utils/bodyType';
import type { LiveCallType } from '@/utils/callView';
import { hobby } from '@/utils/hobby';
import { marriageHistory } from '@/utils/marriageHistory';
import { personality } from '@/utils/personality';
import { region } from '@/utils/region';
import { showingFace } from '@/utils/showingFace';
import { stepToCall } from '@/utils/stepToCall';
import { talkTheme } from '@/utils/talkTheme';
import type { LiveChannels } from '../shared/type';
import type { LiveListChannel, LiveListResponse } from './type';

type LiveUsersRequest = {
  token: string;
  call_type: 'live';
};

// ブラウザ・Nextサーバーの実装の差分を吸収する
export interface LiveListService {
  getLiveChannels: (token: string) => Promise<LiveListResponse>;
}

// 共通のチャンネルマッピング関数
function mapToLiveListChannel(
  channel: any,
  isInProgress: boolean,
  channelId?: string,
): LiveListChannel {
  const e = channel;
  const isVideoCall = channelId?.includes('video');

  return {
    broadcaster: {
      userName: e.broadcaster.userName,
      age: e.broadcaster.age,
      about: e.broadcaster.abt || '',
      avatarId: e.broadcaster.avaId,
      userId: e.broadcaster.userId,
      isNewUser: e.broadcaster.isNewUser,
      hobby: hobby(e.broadcaster.inters || []),
      bodyType: bodyType(e.broadcaster.bdyTpe?.[0] ?? 0),
      marriageHistory: marriageHistory(e.broadcaster.marriageHistory ?? 0),
      personality: personality(e.broadcaster.personalities || []),
      region: region(e.broadcaster.region),
      showingFace: showingFace(e.broadcaster.showingFaceStatus),
      stepToCall: stepToCall(e.broadcaster.stepToCall ?? 0),
      talkTheme: talkTheme(e.broadcaster.talkTheme ?? 0),
      isLive: e.broadcaster.isLiveNow,
      lastLoginTime: e.broadcaster.lastLoginTime || '',
      oftenVisitTime: e.broadcaster.oftenVisitTime || '未設定',
      job: e.broadcaster.job || '未設定',
      looks: e.broadcaster.looks || '未設定',
      holidays: e.broadcaster.holidays || '未設定',
      hometown: e.broadcaster.hometown || '未設定',
      bloodType: e.broadcaster.bloodType || '未設定',
      housemate: e.broadcaster.housemate || '未設定',
      alcohol: e.broadcaster.alcohol || '未設定',
      smokingStatus: e.broadcaster.smokingStatus || '未設定',
      constellation: e.broadcaster.constellation || '未設定',
      hasLovense: e.broadcaster.hasLovense,
      applicationId: e.broadcaster.applicationId,
    },
    channelInfo: {
      rtcChannelToken: e.channelInfo.rtcChannelToken || '',
      appId: e.channelInfo.appId || '',
      channelId: e.channelInfo.channelId,
      userCount: e.channelInfo.userCount || 0,
      thumbnailImageId: e.channelInfo.thumbnailImageId,
    },
    type: (isInProgress
      ? 'live'
      : isVideoCall
        ? 'videoCallFromStandby'
        : 'live') as LiveCallType,
    isInProgress,
  };
}

// 基底クラスの実装
abstract class BaseLiveListService implements LiveListService {
  protected abstract getApiUrl(): string;

  constructor(protected readonly client: HttpClient) {}

  async getLiveChannels(token: string): Promise<LiveListResponse> {
    try {
      const request: LiveUsersRequest = {
        token,
        call_type: 'live',
      };

      const { code, data } = await this.client.post<APIResponse<LiveChannels>>(
        this.getApiUrl(),
        request,
      );

      if (code !== 0 || !data) {
        return {
          liveChannels: [],
        };
      }

      const standbyList = data.standbyList || [];
      const inLiveList = data.inLiveList || [];

      // 待機中リストをマッピング
      const standbyChannels: LiveListChannel[] = standbyList.map((e) =>
        mapToLiveListChannel(e, false, e.channelInfo.channelId),
      );

      // ライブ中リストをマッピング
      const inLiveChannels: LiveListChannel[] = inLiveList.map((e) =>
        mapToLiveListChannel(e, true),
      );

      // ライブ中と待機中を結合（配信中を先に表示）
      const liveChannels = [...inLiveChannels, ...standbyChannels];

      return {
        liveChannels,
      };
    } catch (error) {
      // 開発環境でのみエラーログを出力
      if (import.meta.env.NODE_ENV === 'development') {
        console.error('Failed to fetch live channels:', error);
      }
      return {
        liveChannels: [],
      };
    }
  }
}

// Nextサーバーの実装
export class ServerLiveListService extends BaseLiveListService {
  protected getApiUrl(): string {
    return import.meta.env.API_URL || '';
  }
}

// ブラウザの実装
export class ClientLiveListService extends BaseLiveListService {
  protected getApiUrl(): string {
    return GET_LIVE_USERS;
  }
}

// ブラウザ・Nextサーバー用のServiceを生成して返すFactory関数
export function createLiveListService(client: HttpClient): LiveListService {
  if (client.getContext() === Context.SERVER) {
    return new ServerLiveListService(client);
  } else {
    return new ClientLiveListService(client);
  }
}

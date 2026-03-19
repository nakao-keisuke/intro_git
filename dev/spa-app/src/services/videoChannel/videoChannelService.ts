import {
  createRecentVideoCallUsersMoreClientRequest,
  type RecentVideoCallUsersMoreRouteResponse,
} from '@/apis/http/recentVideoCallUsersMore';
import { APPLICATION_ID } from '@/constants/applicationId';
import {
  GET_RECENT_VIDEO_CALL_USERS,
  HTTP_MORE_RECENT_VIDEO_CALL_USERS,
} from '@/constants/endpoints';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
// mapping utilities are used in mapper.ts
import type { RecentVideoCallUser } from '@/services/home/type';
import { mapRecentVideoCallUserToVideoChannelUser } from './mapper';
import type { VideoChannelResponse, VideoChannelUser } from './type';

export interface VideoChannelService {
  getVideoUsers: () => Promise<VideoChannelResponse>;
  getVideoCallWaitingUsers: () => Promise<VideoChannelResponse>;
}

export class ServerVideoChannelService implements VideoChannelService {
  constructor(private readonly client: HttpClient) {}

  async getVideoUsers(): Promise<VideoChannelResponse> {
    try {
      const { code, data } = await this.client.post<
        APIResponse<RecentVideoCallUser[]>
      >(GET_RECENT_VIDEO_CALL_USERS, {});

      if (code !== 0 || !data) {
        return {
          videoUsers: [],
          totalCount: 0,
        };
      }

      const videoUsers: VideoChannelUser[] = data
        .map(mapRecentVideoCallUserToVideoChannelUser)
        .filter((user): user is VideoChannelUser => user !== null);

      return {
        videoUsers,
        totalCount: videoUsers.length,
      };
    } catch (error) {
      console.error(
        'ServerVideoChannelService failed to fetch video users:',
        error,
      );
      return {
        videoUsers: [],
        totalCount: 0,
      };
    }
  }

  async getVideoCallWaitingUsers(): Promise<VideoChannelResponse> {
    return await this.getVideoUsers();
  }
}

export class ClientVideoChannelService implements VideoChannelService {
  constructor(private readonly client: HttpClient) {}

  async getVideoUsers(): Promise<VideoChannelResponse> {
    try {
      const request = createRecentVideoCallUsersMoreClientRequest(
        APPLICATION_ID.WEB,
      );
      const res = await this.client.post<RecentVideoCallUsersMoreRouteResponse>(
        HTTP_MORE_RECENT_VIDEO_CALL_USERS,
        request,
      );

      if (res.type === 'error') {
        return {
          videoUsers: [],
          totalCount: 0,
        };
      }

      const data = res.data || [];
      const videoUsers: VideoChannelUser[] = data
        .map(mapRecentVideoCallUserToVideoChannelUser)
        .filter((user): user is VideoChannelUser => user !== null);

      return {
        videoUsers,
        totalCount: videoUsers.length,
      };
    } catch (error) {
      console.error('Failed to fetch video users:', error);
      return {
        videoUsers: [],
        totalCount: 0,
      };
    }
  }

  async getVideoCallWaitingUsers(): Promise<VideoChannelResponse> {
    return await this.getVideoUsers();
  }
}

export function createVideoChannelService(
  client: HttpClient,
): VideoChannelService {
  if (client.getContext() === Context.SERVER) {
    return new ServerVideoChannelService(client);
  } else {
    return new ClientVideoChannelService(client);
  }
}

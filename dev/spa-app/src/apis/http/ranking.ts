import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { APIRequest, APIResponse } from '@/libs/http/type';

export type RankingUser = {
  readonly lastActionStatusColor: string;
  readonly stepToCall: number;
  readonly gender: number;
  readonly lastLoginTime: string;
  readonly isNew: boolean;
  readonly userName: string;
  readonly lastActionStatusLabel: string;
  readonly talkTheme: number;
  readonly showingFaceStatus: number;
  readonly lastActionStatusIndex: number;
  readonly channelInfo: string;
  readonly onlineStatusColor: string;
  readonly abt: string;
  readonly callStatus: number;
  readonly onlineStatusLabel: string;
  readonly voiceCallWaiting: boolean;
  readonly region: number;
  readonly avaId: string;
  readonly age: number;
  readonly videoCallWaiting: boolean;
};

export type RankingItem = {
  readonly isSuddenRise: boolean;
  readonly userId: string;
  readonly rank: number;
  readonly user: RankingUser;
  readonly point: number;
};

export type GetImageRankingResponseData = RankingItem[];
export type GetVideoRankingResponseData = RankingItem[];

type RankingRouteErrorResponse = {
  readonly type: 'error';
  readonly message: string;
};

export type GetImageRankingRouteResponse =
  | GetImageRankingResponseData
  | RankingRouteErrorResponse;

export type GetVideoRankingRouteResponse =
  | GetVideoRankingResponseData
  | RankingRouteErrorResponse;

export type GetImageRankingUpstreamRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.GET_IMAGE_RANKING;
  readonly token: string;
  readonly skip: number;
  readonly take: number;
};

export type GetVideoRankingUpstreamRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.GET_VIDEO_RANKING;
  readonly token: string;
  readonly skip: number;
  readonly take: number;
};

export type GetImageRankingUpstreamResponse =
  APIResponse<GetImageRankingResponseData>;

export type GetVideoRankingUpstreamResponse =
  APIResponse<GetVideoRankingResponseData>;

export const createGetImageRankingUpstreamRequest = (
  token: string,
): GetImageRankingUpstreamRequest => {
  return {
    api: JAMBO_API_ROUTE.GET_IMAGE_RANKING,
    token,
    skip: 0,
    take: 100,
  };
};

export const createGetVideoRankingUpstreamRequest = (
  token: string,
): GetVideoRankingUpstreamRequest => {
  return {
    api: JAMBO_API_ROUTE.GET_VIDEO_RANKING,
    token,
    skip: 0,
    take: 100,
  };
};

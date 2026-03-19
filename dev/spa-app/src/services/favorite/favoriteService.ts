import {
  type GetUserInfoForWebResponseData,
  getUserInfoForWebRequest,
} from '@/apis/get-user-inf-for-web';
import {
  type GetUtageWebPointInfoResponseData,
  getUtageWebPointInfoRequest,
} from '@/apis/get-utage-web-point-info';
import { lstFavRequest } from '@/apis/lst-fav';
import { lstFvtRequest } from '@/apis/lst-fvt';
import type { HttpClient } from '@/libs/http/HttpClient';
import { Context } from '@/libs/http/type';
import type { JamboResponse } from '@/types/JamboApi';
import { region } from '@/utils/region';
import type { FavoriteListData } from './type';

// 実際のAPIレスポンスに対応した拡張型
type ExtendedLstFavResponseElementData = {
  user_id: string;
  user_name: string;
  age: number;
  region: number;
  ava_id: string;
  abt?: string;
  voice_call_waiting?: boolean;
  video_call_waiting?: boolean;
  // camelCase版も追加
  userId?: string;
  userName?: string;
  avaId?: string;
  voiceCallWaiting?: boolean;
  videoCallWaiting?: boolean;
};

type ExtendedGetUserInfoForWebResponseData = GetUserInfoForWebResponseData & {
  // camelCase版のプロパティを追加
  hasLovense?: boolean;
  hLevel?: string;
  bustSize?: string;
  userId?: string;
  isNewUser?: boolean;
  regDate?: string;
};

export interface FavoriteService {
  getFavoriteListData: (token: string) => Promise<FavoriteListData>;
}

export class ServerFavoriteService implements FavoriteService {
  private readonly apiUrl = import.meta.env.API_URL as string;

  constructor(private client: HttpClient) {}

  async getFavoriteListData(token: string): Promise<FavoriteListData> {
    const myFavoriteRequest = lstFavRequest(token);
    const favoritedMeRequest = lstFvtRequest(token);
    const pointInfoRequest = getUtageWebPointInfoRequest(token);

    const [myFavoriteResponse, favoritedMeResponse, creditResponse] =
      await Promise.all([
        this.client
          .post<JamboResponse<ExtendedLstFavResponseElementData[]>>(
            this.apiUrl,
            myFavoriteRequest,
          )
          .catch(() => ({
            code: 1,
            data: [] as ExtendedLstFavResponseElementData[],
          })),
        this.client
          .post<JamboResponse<ExtendedLstFavResponseElementData[]>>(
            this.apiUrl,
            favoritedMeRequest,
          )
          .catch(() => ({
            code: 1,
            data: [] as ExtendedLstFavResponseElementData[],
          })),
        this.client
          .post<JamboResponse<GetUtageWebPointInfoResponseData>>(
            this.apiUrl,
            pointInfoRequest,
          )
          .catch(() => ({
            code: 1,
            data: {
              is_purchased: false,
              point: 0,
            } as GetUtageWebPointInfoResponseData,
          })),
      ]);

    if (myFavoriteResponse.code || favoritedMeResponse.code) {
      return {
        myFavoriteList: [],
        favoritedMeList: [],
        isPurchased: false,
      };
    }

    const myFavoriteUserIds =
      myFavoriteResponse.data?.map((data) => data.userId || data.user_id) || [];
    const favoritedMeUserIds =
      favoritedMeResponse.data?.map((data) => data.userId || data.user_id) ||
      [];

    const myFavoriteUserDetailsPromises = myFavoriteUserIds.map(
      (userId: string) => {
        const userInfoRequest = getUserInfoForWebRequest(userId);
        return this.client
          .post<JamboResponse<ExtendedGetUserInfoForWebResponseData>>(
            this.apiUrl,
            userInfoRequest,
          )
          .catch(() => ({ code: 1, data: undefined }));
      },
    );

    const favoritedMeUserDetailsPromises = favoritedMeUserIds.map(
      (userId: string) => {
        const userInfoRequest = getUserInfoForWebRequest(userId);
        return this.client
          .post<JamboResponse<ExtendedGetUserInfoForWebResponseData>>(
            this.apiUrl,
            userInfoRequest,
          )
          .catch(() => ({ code: 1, data: undefined }));
      },
    );

    const myFavoriteUserDetailsResponses = await Promise.all(
      myFavoriteUserDetailsPromises,
    );
    const favoritedMeUserDetailsResponses = await Promise.all(
      favoritedMeUserDetailsPromises,
    );

    const myFavoriteUserDetailsMap = new Map<
      string,
      ExtendedGetUserInfoForWebResponseData
    >();
    myFavoriteUserDetailsResponses.forEach((response) => {
      if (response.code === 0 && response.data) {
        const userId = response.data.user_id || response.data.userId || '';
        myFavoriteUserDetailsMap.set(userId, response.data);
      }
    });

    const favoritedMeUserDetailsMap = new Map<
      string,
      ExtendedGetUserInfoForWebResponseData
    >();
    favoritedMeUserDetailsResponses.forEach((response) => {
      if (response.code === 0 && response.data) {
        const userId = response.data.user_id || response.data.userId || '';
        favoritedMeUserDetailsMap.set(userId, response.data);
      }
    });

    return {
      myFavoriteList:
        myFavoriteResponse.data?.map((data) => {
          const userId = data.userId || data.user_id;
          const myUserDetails = myFavoriteUserDetailsMap.get(userId);
          return {
            userName: data.userName || data.user_name,
            userId: userId,
            age: data.age,
            region: region(data.region),
            avatarId: data.avaId || data.ava_id,
            voiceCallWaiting:
              data.voiceCallWaiting ?? data.voice_call_waiting ?? false,
            videoCallWaiting:
              data.videoCallWaiting ?? data.video_call_waiting ?? false,
            about: data.abt ?? '',
            isCalling: false,
            hasLovense:
              myUserDetails?.hasLovense ?? myUserDetails?.has_lovense ?? false,
            hLevel: myUserDetails?.hLevel || myUserDetails?.h_level || '',
            bustSize: myUserDetails?.bustSize || myUserDetails?.bust_size || '',
            isNewUser:
              myUserDetails?.isNewUser ?? myUserDetails?.isNewUser ?? false,
            regDate: myUserDetails?.regDate || myUserDetails?.reg_date || '',
          };
        }) ?? [],
      favoritedMeList:
        favoritedMeResponse.data?.map((data) => {
          const userId = data.userId || data.user_id;
          const favoritedMeUserDetails = favoritedMeUserDetailsMap.get(userId);
          return {
            userName: data.userName || data.user_name,
            userId: userId,
            age: data.age,
            region: region(data.region),
            avatarId: data.avaId || data.ava_id,
            voiceCallWaiting:
              data.voiceCallWaiting ?? data.voice_call_waiting ?? false,
            videoCallWaiting:
              data.videoCallWaiting ?? data.video_call_waiting ?? false,
            about: data.abt ?? '',
            isCalling: false,
            hasLovense:
              favoritedMeUserDetails?.hasLovense ??
              favoritedMeUserDetails?.has_lovense ??
              false,
            hLevel:
              favoritedMeUserDetails?.hLevel ||
              favoritedMeUserDetails?.h_level ||
              '',
            bustSize:
              favoritedMeUserDetails?.bustSize ||
              favoritedMeUserDetails?.bust_size ||
              '',
            isNewUser:
              favoritedMeUserDetails?.isNewUser ??
              favoritedMeUserDetails?.isNewUser ??
              false,
            regDate:
              favoritedMeUserDetails?.regDate ||
              favoritedMeUserDetails?.reg_date ||
              '',
          };
        }) ?? [],
      isPurchased: !!creditResponse.data?.is_purchased,
    };
  }
}

export class ClientFavoriteService implements FavoriteService {
  constructor(_client?: HttpClient) {}

  async getFavoriteListData(_token: string): Promise<FavoriteListData> {
    throw new Error('Client-side fetching not implemented for favorite list');
  }
}

export function createFavoriteService(client: HttpClient): FavoriteService {
  if (client.getContext() === Context.SERVER) {
    return new ServerFavoriteService(client);
  } else {
    return new ClientFavoriteService(client);
  }
}

import { getServerSession } from 'next-auth';
import {
  type GetFavoriteAnotherUsersResponseData,
  getFavoriteAnotherUsersRequest,
} from '@/apis/get-favorite-another-users';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
import { region } from '@/utils/region';
import { type ShowingFace, showingFace } from '@/utils/showingFace';
import { type StepToCall, stepToCall } from '@/utils/stepToCall';
import { type TalkTheme, talkTheme } from '@/utils/talkTheme';
import type { RecommendedUser } from './type';

export interface RecommendUserService {
  getFavoriteAnotherUsers: (
    userId: string,
    reqUserId: string,
    gender?: number,
  ) => Promise<RecommendedUser[]>;
}

export class ServerRecommendUserService implements RecommendUserService {
  private readonly apiUrl: string = import.meta.env.API_URL!;

  constructor(private readonly client: HttpClient) {}

  async getFavoriteAnotherUsers(
    userId: string,
    reqUserId: string,
    gender: number = 1,
  ): Promise<RecommendedUser[]> {
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;
    if (!token) return [];

    const request = getFavoriteAnotherUsersRequest(
      token,
      userId,
      reqUserId,
      gender,
    );
    const { code, data } = await this.client.post<
      APIResponse<GetFavoriteAnotherUsersResponseData>
    >(this.apiUrl, request);

    if (code !== 0 || !data) return [];

    // ServerHttpClient はレスポンスを camelCase に変換するため、
    // ここでは camelCase で受け取ってマッピングする
    type FavoriteAnotherUserCamel = {
      userId: string;
      userName: string;
      age: number;
      region: number;
      avaId: string;
      voiceCallWaiting: boolean;
      videoCallWaiting: boolean;
      abt: string;
      lastLogin?: string;
      lastLoginTimeFromUserCollection?: string;
      recentCallTime?: string;
      isNew?: boolean;
      hasStoryMovie?: boolean;
      hasLovense?: boolean;
      talkTheme: number;
      showingFaceStatus: number;
      stepToCall: number;
      bustSize?: string;
    };

    const camelUsers = data as unknown as FavoriteAnotherUserCamel[];

    return camelUsers.map((user) => {
      // recentCallTime、lastLoginTimeFromUserCollection、lastLoginの順に確認
      const lastLoginTime =
        user.recentCallTime ||
        user.lastLoginTimeFromUserCollection ||
        user.lastLogin ||
        '';

      return {
        userId: user.userId,
        userName: user.userName,
        age: user.age,
        region: region(user.region),
        avatarId: user.avaId,
        voiceCallWaiting: user.voiceCallWaiting,
        videoCallWaiting: user.videoCallWaiting,
        about: user.abt,
        lastLoginTime: lastLoginTime,
        isNewUser: user.isNew || false,
        isCalling: false,
        hasStory: user.hasStoryMovie || false,
        hasLovense: user.hasLovense || false,
        ...(user.bustSize && { bustSize: user.bustSize }),
        talk_theme: talkTheme(user.talkTheme) as TalkTheme,
        showing_face_status: showingFace(user.showingFaceStatus) as ShowingFace,
        step_to_call: stepToCall(user.stepToCall) as StepToCall,
        isListedOnFleaMarket: false,
      };
    });
  }
}

export function createRecommendUserService(
  client: HttpClient,
): RecommendUserService {
  if (client.getContext() === Context.SERVER) {
    return new ServerRecommendUserService(client);
  }
  // 必要に応じて Client 実装を追加（今回はサーバーAPI用のため未実装）
  return {
    async getFavoriteAnotherUsers() {
      throw new Error(
        'Client context is not supported for this service method.',
      );
    },
  };
}

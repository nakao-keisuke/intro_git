import { getServerSession } from 'next-auth';
import {
  type GetUserInfoForWebResponseData,
  getUserInfoForWebRequest,
} from '@/apis/get-user-inf-for-web';
import { listBookmarkRequest } from '@/apis/list-bookmark';
import { HTTP_GET_BOOKMARK_LIST } from '@/constants/endpoints';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
import { region } from '@/utils/region';
import type {
  BookmarkListRequest,
  BookmarkListResponse,
  BookmarkListUserInfo,
  BookmarkUser,
} from './type';

export interface BookmarkListService {
  getInitialData: () => Promise<BookmarkListResponse>;
}

export class ServerBookmarkListService implements BookmarkListService {
  private readonly apiUrl: string = import.meta.env.API_URL!;

  constructor(private readonly client: HttpClient) {}

  async getInitialData(): Promise<BookmarkListResponse> {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;

    if (!token) {
      return {
        bookmarkList: [],
      };
    }

    try {
      const bookmarkListRequest = listBookmarkRequest(token);

      const { code, data } = await this.client.post<
        APIResponse<BookmarkUser[]>
      >(this.apiUrl, bookmarkListRequest, { next: { revalidate: 60 } });

      if (code !== 0 || !data) {
        return {
          bookmarkList: [],
        };
      }

      // お気に入りリストからユーザーIDを取得（camelCase形式）
      const userIds = data.map((item) => item.userId);

      // 各ユーザーの詳細情報を取得
      const userDetailsPromises = userIds.map((userId) => {
        const userInfoRequest = getUserInfoForWebRequest(userId);
        return this.client
          .post<APIResponse<GetUserInfoForWebResponseData>>(
            this.apiUrl,
            userInfoRequest,
          )
          .catch(
            () =>
              ({
                code: 401,
                data: null,
              }) as APIResponse<GetUserInfoForWebResponseData | null>,
          );
      });

      const userDetailsResponses = await Promise.all(userDetailsPromises);

      // ユーザー詳細情報をマッピング（実際のレスポンスはcamelCaseのため any で処理）
      const userDetailsMap = new Map<string, any>();
      userDetailsResponses.forEach((response) => {
        if (response.code === 0 && response.data) {
          // 実際のレスポンスはcamelCaseなので型アサーション
          const userData = response.data as any;
          userDetailsMap.set(userData.userId, userData);
        }
      });

      // 重複排除ロジック（camelCaseフィールド使用）
      const bookmarkDataList = Array.from(
        new Map(data.map((item) => [item.userId, item])).values(),
      );

      const bookmarkList: BookmarkListUserInfo[] = bookmarkDataList.map(
        (item) => {
          const userDetails = userDetailsMap.get(item.userId);

          return {
            // 基本情報（APIから直接）
            userName: item.userName,
            userId: item.userId,
            age: item.age,
            region: region(item.region),
            avatarId: item.avaId,

            // 通話状態
            voiceCallWaiting: item.voiceCallWaiting ?? false,
            videoCallWaiting: item.videoCallWaiting ?? false,
            isCalling: false, // デフォルト値

            // メッセージ・説明
            message: item.abt || '',
            about: item.abt,
            postTime: '', // デフォルト値

            // ユーザー詳細情報（APIから直接取得 + getUserInfoForWebから補完）
            hasLovense: item.hasLovense ?? userDetails?.hasLovense ?? false,
            hLevel: item.hLevel ?? userDetails?.hLevel,
            bustSize: item.bustSize ?? userDetails?.bustSize,
            isNewUser: item.isNewUser ?? userDetails?.isNewUser ?? false,
            regDate: userDetails?.regDate,
            lastLoginTime: userDetails?.lastLoginTimeFromUserCollection,

            // APIから直接取得できる追加情報
            gender: item.gender,
            onlineStatus: item.onlineStatus,
            hasStoryMovie: item.hasStoryMovie,
            avatarType: item.avatarType,
            homeCountry: item.homeCountry,
          };
        },
      );

      return {
        bookmarkList,
      };
    } catch (_error) {
      return {
        bookmarkList: [],
      };
    }
  }
}

export class ClientBookmarkListService implements BookmarkListService {
  constructor(private readonly client: HttpClient) {}

  async getInitialData(): Promise<BookmarkListResponse> {
    const request: BookmarkListRequest = {};
    return this.client.post<BookmarkListResponse>(
      HTTP_GET_BOOKMARK_LIST,
      request,
    );
  }
}

export function createBookmarkListService(
  client: HttpClient,
): BookmarkListService {
  if (client.getContext() === Context.SERVER) {
    return new ServerBookmarkListService(client);
  } else {
    return new ClientBookmarkListService(client);
  }
}

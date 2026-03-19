import { getServerSession } from 'next-auth';
import { getUtageWebBoardMessageRequest } from '@/apis/get-utage-web-board-message';
import { loginMeetPeopleRequest } from '@/apis/utage-web-get-meet-people-exclude-video-call-channeler';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import {
  HTTP_GET_BOARD_DATA,
  HTTP_POST_BOARD_MESSAGE,
} from '@/constants/endpoints';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
import type { BoardListUserInfo } from '@/services/board/type';
import { region } from '@/utils/region';
import type { MeetPeople } from '../shared/type';
import type {
  Board,
  BoardFilterParams,
  BoardMessageListRequest,
  BoardMessageListResponse,
  PostBoardMessageRequest,
  PostBoardMessageResponse,
} from './type';

// ブラウザ・Nextサーバーの実装の差分を吸収する
export interface BoardService {
  getInitialData: (
    filter?: BoardFilterParams,
  ) => Promise<BoardMessageListResponse>;
  getMoreData?: (
    skip?: number,
    filter?: BoardFilterParams,
  ) => Promise<BoardMessageListResponse>;
  createPost?: (message: string) => Promise<APIResponse<null>>;
}

// Nextサーバーの実装
export class ServerBoardService implements BoardService {
  private readonly apiUrl: string = import.meta.env.API_URL!;

  constructor(private readonly client: HttpClient) {}

  async getInitialData(): Promise<BoardMessageListResponse> {
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;

    try {
      // 掲示板メッセージリクエストの準備
      const boardRequest = getUtageWebBoardMessageRequest(token || undefined);

      // 並行してAPIリクエストを実行（2つのAPIのみ）
      const [boardResponse, meetResponse] = await Promise.all([
        // ① 掲示板メッセージ取得
        this.client
          .post<APIResponse<Board[]>>(this.apiUrl, boardRequest)
          .catch(() => ({ code: 401, data: [] }) as APIResponse<Board[]>),

        // ② ビデオ待機中のユーザー以外のユーザーを取得
        this.client
          .post<APIResponse<MeetPeople[]>>(this.apiUrl, loginMeetPeopleRequest)
          .catch(() => ({ code: 0, data: [] }) as APIResponse<MeetPeople[]>),
      ]);

      const { code: boardCode, data: boardData } = boardResponse;
      const { data: meetData } = meetResponse;

      // エラーチェック（401以外のエラーの場合）
      if (boardCode && boardCode !== 401) {
        return {
          boardList: [],
          hasMore: false,
          nextSkip: 0,
        };
      }

      const safeBoardData = boardData || [];

      // BoardListUserInfoの構築
      // liveCallType, channelInfo, broadcasterInfo はクライアント側でポーリングデータからmerge
      const boardList: BoardListUserInfo[] = safeBoardData.map((data) => ({
        userId: data.userId,
        avatarId: data.avaId,
        videoCallWaiting: data.videoCallWaiting ?? false,
        voiceCallWaiting: data.voiceCallWaiting ?? false,
        age: data.age,
        region: region(Number(data.region)),
        userName: data.userName,
        message: data.message,
        postTime: data.created,
        isCalling: !!meetData?.find((d) => d.userId === data.userId)?.isCalling,
        hasLovense: data.hasLovense,
        bustSize: data.bustSize || '',
        hLevel: data.hLevel || '',
        isNewUser: data.isNewUser ?? false,
        regDate: data.regDate || '',
        isOnline: data.isOnline,
      }));

      return {
        boardList,
        hasMore: boardList.length >= 20,
        nextSkip: boardList.length,
      };
    } catch (_error) {
      // エラー時は空のデータを返す
      return {
        boardList: [],
        hasMore: false,
        nextSkip: 0,
      };
    }
  }

  async getMoreData(skip: number = 0): Promise<BoardMessageListResponse> {
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;

    const boardRequest = getUtageWebBoardMessageRequest(
      token || undefined,
      skip,
    );

    try {
      const boardResponse = await this.client
        .post<APIResponse<Board[]>>(this.apiUrl, boardRequest)
        .catch(() => ({ code: 401, data: [] }) as APIResponse<Board[]>);

      if (boardResponse.code !== 0 || !boardResponse.data) {
        return {
          boardList: [],
          hasMore: false,
          nextSkip: skip,
        };
      }

      // BoardListUserInfoの構築
      // liveCallType, channelInfo, broadcasterInfo はクライアント側でポーリングデータからmerge
      const boardList: BoardListUserInfo[] = boardResponse.data.map((data) => ({
        userId: data.userId,
        avatarId: data.avaId,
        videoCallWaiting: data.videoCallWaiting ?? false,
        voiceCallWaiting: data.voiceCallWaiting ?? false,
        age: data.age,
        region: region(Number(data.region)),
        userName: data.userName,
        message: data.message,
        postTime: data.created,
        isCalling: false,
        hasLovense: data.hasLovense,
        bustSize: data.bustSize || '',
        hLevel: data.hLevel || '',
        isNewUser: data.isNewUser ?? false,
        regDate: data.regDate || '',
        isOnline: data.isOnline,
      }));

      return {
        boardList,
        hasMore: boardList.length >= 20,
        nextSkip: skip + boardList.length,
      };
    } catch (_error) {
      return {
        boardList: [],
        hasMore: false,
        nextSkip: skip,
      };
    }
  }
}

// ブラウザの実装
export class ClientBoardService implements BoardService {
  constructor(private readonly client: HttpClient) {}

  async getInitialData(
    filter?: BoardFilterParams,
  ): Promise<BoardMessageListResponse> {
    const request: BoardMessageListRequest = {
      skip: 0,
      ...(filter?.callWaiting && { callWaiting: filter.callWaiting }),
      ...(filter?.age && { age: filter.age }),
      ...(filter?.region && { region: filter.region }),
    };

    return this.client.post<BoardMessageListResponse>(
      HTTP_GET_BOARD_DATA,
      request,
    );
  }

  async getMoreData(
    skip: number = 0,
    filter?: BoardFilterParams,
  ): Promise<BoardMessageListResponse> {
    const request: BoardMessageListRequest = {
      skip,
      ...(filter?.callWaiting && { callWaiting: filter.callWaiting }),
      ...(filter?.age && { age: filter.age }),
      ...(filter?.region && { region: filter.region }),
    };

    return this.client.post<BoardMessageListResponse>(
      HTTP_GET_BOARD_DATA,
      request,
    );
  }

  async createPost(message: string): Promise<APIResponse<null>> {
    const request: PostBoardMessageRequest = {
      message,
    };

    const response = await this.client.post<PostBoardMessageResponse>(
      HTTP_POST_BOARD_MESSAGE,
      request,
    );

    return response;
  }
}

// ブラウザ・Nextサーバー用のServiceを生成して返すFactory関数
export function createBoardService(client: HttpClient): BoardService {
  if (client.getContext() === Context.SERVER) {
    return new ServerBoardService(client);
  } else {
    return new ClientBoardService(client);
  }
}

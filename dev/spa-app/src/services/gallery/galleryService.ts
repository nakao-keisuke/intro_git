import { getServerSession } from 'next-auth';
import { getGalleryRequest } from '@/apis/get-gallery-items';
import { bannedUserIdList } from '@/constants/bannedUserIdList';
import {
  GET_GALLERY_FAVORITE,
  GET_GALLERY_ITEMS,
  GET_IMAGE_RANKING,
  GET_UNOPEN_ITEMS,
  GET_VIDEO_RANKING,
  HTTP_SEND_IMAGE_REQUEST,
  HTTP_SEND_VIDEO_REQUEST,
  POST_BOARD_MESSAGE,
  PURCHASE_IMAGE,
  PURCHASE_VIDEO,
} from '@/constants/endpoints';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
import { region } from '@/utils/region';
import type {
  GalleryData,
  GalleryItemResponse,
  GalleryListUserInfo,
  PostBoardMessageResponse,
  PurchaseResponseData,
  RankedMeetPerson,
  RankingResponse,
  RequestResponseData,
  UnOpenItemsResponse,
} from './type';

// ブラウザ・Nextサーバーの実装の差分を吸収する
export interface GalleryService {
  getInitialData: () => Promise<GalleryData>;
  getOpenMovies: () => Promise<GalleryItemResponse>;
  getOpenImages: () => Promise<GalleryItemResponse>;
  getUnOpenMovies: () => Promise<UnOpenItemsResponse>;
  getUnOpenImages: () => Promise<UnOpenItemsResponse>;
  getVideoRanking: () => Promise<RankingResponse>;
  getImageRanking: () => Promise<RankingResponse>;
  postBoardMessage?: (
    message: string,
  ) => Promise<APIResponse<PostBoardMessageResponse>>;
  updateFavorite?: (
    fileId: string,
    isFavorite: boolean,
  ) => Promise<APIResponse<null>>;
  sendImageRequest?(rcv_id: string): Promise<APIResponse<RequestResponseData>>;
  sendVideoRequest?(rcv_id: string): Promise<APIResponse<RequestResponseData>>;
  purchaseImage?(imageId: string): Promise<APIResponse<PurchaseResponseData>>;
  purchaseVideo?(fileId: string): Promise<APIResponse<PurchaseResponseData>>;
  getUnOpenItems?(params: {
    isImage: boolean;
    skip: number;
    take: number;
  }): Promise<APIResponse<UnOpenItemsResponse>>;
}

// Nextサーバーの実装
export class ServerGalleryService implements GalleryService {
  private readonly apiUrl: string = import.meta.env.API_URL!;

  constructor(private readonly client: HttpClient) {}

  private processOpenItems(data: GalleryItemResponse): GalleryListUserInfo[] {
    const favoriteItems =
      data?.favoriteGalleryList?.map((item) => ({
        userId: item.galleryUser.userId,
        fileId: item.openedContent.fileId,
        isFavorite: true,
        userName: item.galleryUser.userName,
        avatarId: item.galleryUser.avaId,
        age: item.galleryUser.age,
      })) || [];

    const unFavoriteItems =
      data?.nonFavoriteGalleryList?.map((item) => ({
        userId: item.galleryUser.userId,
        fileId: item.openedContent.fileId,
        isFavorite: false,
        userName: item.galleryUser.userName,
        avatarId: item.galleryUser.avaId,
        age: item.galleryUser.age,
      })) || [];

    return favoriteItems.concat(unFavoriteItems);
  }

  private processUnOpenItems(data: UnOpenItemsResponse): GalleryListUserInfo[] {
    const items = Array.isArray(data) ? data : [data];
    return (
      items?.map((item) => {
        const galleryItem: GalleryListUserInfo = {
          userId: item.user.userId,
          fileId: item.unopenedContent.fileId,
          isFavorite: false,
          userName: item.user.userName,
          avatarId: item.user.avaId,
          age: item.user.age,
        };
        if (item.unopenedContent.views !== undefined)
          galleryItem.views = item.unopenedContent.views;
        if (item.unopenedContent.favorites !== undefined)
          galleryItem.favorites = item.unopenedContent.favorites;
        if (item.unopenedContent.sentDate !== undefined)
          galleryItem.sentDate = item.unopenedContent.sentDate;
        if (item.unopenedContent.duration !== undefined)
          galleryItem.duration = item.unopenedContent.duration;
        if (item.user.abt !== undefined) galleryItem.abt = item.user.abt;
        return galleryItem;
      }) || []
    );
  }

  private processRankingData(data: RankingResponse): RankedMeetPerson[] {
    const filteredData = data?.filter(
      (e) => bannedUserIdList.indexOf(e.userId) === -1,
    );
    return (
      filteredData?.map((item) => ({
        is_sudden_rise: item.isSuddenRise,
        user_id: item.userId,
        rank: item.rank,
        last_action_status_color: item.user.lastActionStatusColor || '',
        step_to_call: item.user.stepToCall || 0,
        gender: item.user.gender || 0,
        last_login_time: item.user.lastLoginTime || '',
        is_new: item.user.isNew || false,
        user_name: item.user.userName || '',
        last_action_status_label: item.user.lastActionStatusLabel || '',
        talk_theme: item.user.talkTheme || 0,
        showing_face_status: item.user.showingFaceStatus || 0,
        last_action_status_index: item.user.lastActionStatusIndex || 0,
        channel_info: item.user.channelInfo || '',
        online_status_color: item.user.onlineStatusColor || '',
        abt: item.user.abt || '',
        call_status: item.user.callStatus || 0,
        online_status_label: item.user.onlineStatusLabel || '',
        voice_call_waiting: item.user.voiceCallWaiting || false,
        region: region(Number(item.user.region)),
        ava_id: item.user.avaId || '',
        age: item.user.age || 0,
        video_call_waiting: item.user.videoChatWaiting || false,
        point: item.point,
      })) || []
    );
  }

  async getOpenMovies(): Promise<GalleryItemResponse> {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;

    if (!token) {
      return { favoriteGalleryList: [], nonFavoriteGalleryList: [] };
    }

    const request = getGalleryRequest(token, false);
    const response = await this.client.post<APIResponse<GalleryItemResponse>>(
      this.apiUrl,
      request,
      { cache: 'no-store' },
    );
    return (
      response.data || { favoriteGalleryList: [], nonFavoriteGalleryList: [] }
    );
  }

  async getOpenImages(): Promise<GalleryItemResponse> {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;

    if (!token) {
      return { favoriteGalleryList: [], nonFavoriteGalleryList: [] };
    }

    const request = getGalleryRequest(token, true);
    const response = await this.client.post<APIResponse<GalleryItemResponse>>(
      this.apiUrl,
      request,
      { cache: 'no-store' },
    );

    return (
      response.data || { favoriteGalleryList: [], nonFavoriteGalleryList: [] }
    );
  }

  async getUnOpenMovies(): Promise<UnOpenItemsResponse> {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;

    if (!token) {
      return [] as unknown as UnOpenItemsResponse;
    }

    const request = {
      api: 'get_unopened_item',
      token,
      is_image: false,
      skip: 0,
      take: 50,
    };
    const response = await this.client.post<APIResponse<UnOpenItemsResponse>>(
      this.apiUrl,
      request,
      { cache: 'no-store' },
    );
    return response.data || ([] as unknown as UnOpenItemsResponse);
  }

  async getUnOpenImages(): Promise<UnOpenItemsResponse> {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;

    if (!token) {
      return [] as unknown as UnOpenItemsResponse;
    }

    const request = {
      api: 'get_unopened_item',
      token,
      is_image: true,
      skip: 0,
      take: 50,
    };

    // if (import.meta.env.NODE_ENV !== 'production') {
    // }

    const response = await this.client.post<APIResponse<UnOpenItemsResponse>>(
      this.apiUrl,
      request,
      { cache: 'no-store' },
    );
    return response.data || ([] as unknown as UnOpenItemsResponse);
  }

  async getVideoRanking(): Promise<RankingResponse> {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;

    const request = {
      api: 'get_video_ranking',
      token: token || undefined,
      skip: 0,
      take: 100,
    };

    const response = await this.client.post<APIResponse<RankingResponse>>(
      this.apiUrl,
      request,
      { next: { revalidate: 3600 } }, // 1時間キャッシュ
    );
    return response.data || [];
  }

  async getImageRanking(): Promise<RankingResponse> {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;

    const request = {
      api: 'get_image_ranking',
      token: token || undefined,
      skip: 0,
      take: 100,
    };

    const response = await this.client.post<APIResponse<RankingResponse>>(
      this.apiUrl,
      request,
      { next: { revalidate: 3600 } }, // 1時間キャッシュ
    );

    return response.data || [];
  }

  async getInitialData(): Promise<GalleryData> {
    // 並行してすべてのデータを取得
    const [
      openMovies,
      openImages,
      unOpenMovies,
      unOpenImages,
      videoRanking,
      imageRanking,
    ] = await Promise.all([
      this.getOpenMovies(),
      this.getOpenImages(),
      this.getUnOpenMovies(),
      this.getUnOpenImages(),
      this.getVideoRanking(),
      this.getImageRanking(),
    ]);

    return {
      openMovies: this.processOpenItems(openMovies),
      openImages: this.processOpenItems(openImages),
      unOpenMovies: this.processUnOpenItems(unOpenMovies),
      unOpenImages: this.processUnOpenItems(unOpenImages),
      videoRankingList: this.processRankingData(videoRanking),
      imageRankingList: this.processRankingData(imageRanking),
    };
  }
}

// ブラウザの実装
export class ClientGalleryService implements GalleryService {
  constructor(private readonly client: HttpClient) {}

  async getOpenMovies(): Promise<GalleryItemResponse> {
    // Next APIは data ラップ無しで返すため、そのまま返す
    const response = await this.client.post<GalleryItemResponse | any>(
      GET_GALLERY_ITEMS,
      { is_image: false },
    );
    if (response?.type === 'error') {
      return { favoriteGalleryList: [], nonFavoriteGalleryList: [] };
    }
    return response as GalleryItemResponse;
  }

  async getOpenImages(): Promise<GalleryItemResponse> {
    const response = await this.client.post<GalleryItemResponse | any>(
      GET_GALLERY_ITEMS,
      { is_image: true },
    );
    if (response?.type === 'error') {
      return { favoriteGalleryList: [], nonFavoriteGalleryList: [] };
    }
    return response as GalleryItemResponse;
  }

  async getUnOpenMovies(): Promise<UnOpenItemsResponse> {
    const response = await this.client.post<any>(GET_UNOPEN_ITEMS, {
      isImage: false,
      skip: 0,
      take: 50,
    });
    if (response?.type === 'error') return [] as unknown as UnOpenItemsResponse;
    return response || ([] as unknown as UnOpenItemsResponse);
  }

  async getUnOpenImages(): Promise<UnOpenItemsResponse> {
    const response = await this.client.post<any>(GET_UNOPEN_ITEMS, {
      isImage: true,
      skip: 0,
      take: 50,
    });
    if (response?.type === 'error') return [] as unknown as UnOpenItemsResponse;
    return response || ([] as unknown as UnOpenItemsResponse);
  }

  async getVideoRanking(): Promise<RankingResponse> {
    const response = await this.client.post<APIResponse<RankingResponse>>(
      GET_VIDEO_RANKING,
      {},
    );
    return response.data || [];
  }

  async getImageRanking(): Promise<RankingResponse> {
    const response = await this.client.post<APIResponse<RankingResponse>>(
      GET_IMAGE_RANKING,
      {},
    );
    return response.data || [];
  }

  async getInitialData(): Promise<GalleryData> {
    // Client側では使用しないが、インターフェースのため実装
    throw new Error(
      'getInitialData is not implemented for ClientGalleryService',
    );
  }

  async postBoardMessage(
    message: string,
  ): Promise<APIResponse<PostBoardMessageResponse>> {
    const response = await this.client.post<
      APIResponse<PostBoardMessageResponse>
    >(POST_BOARD_MESSAGE, { message });
    return response;
  }

  async updateFavorite(
    fileId: string,
    isFavorite: boolean,
  ): Promise<APIResponse<null>> {
    const response = await this.client.post<APIResponse<null>>(
      GET_GALLERY_FAVORITE,
      { fileId, isFavorite },
    );
    return response;
  }

  async sendImageRequest(
    partnerId: string,
  ): Promise<APIResponse<RequestResponseData>> {
    return await this.client.post<APIResponse<RequestResponseData>>(
      HTTP_SEND_IMAGE_REQUEST,
      {
        partnerId,
      },
    );
  }

  async sendVideoRequest(
    partnerId: string,
  ): Promise<APIResponse<RequestResponseData>> {
    return await this.client.post<APIResponse<RequestResponseData>>(
      HTTP_SEND_VIDEO_REQUEST,
      {
        partnerId,
      },
    );
  }

  async purchaseImage(
    imageId: string,
  ): Promise<APIResponse<PurchaseResponseData>> {
    return await this.client.post<APIResponse<PurchaseResponseData>>(
      PURCHASE_IMAGE,
      {
        imageId,
      },
    );
  }

  async purchaseVideo(
    fileId: string,
  ): Promise<APIResponse<PurchaseResponseData>> {
    return await this.client.post<APIResponse<PurchaseResponseData>>(
      PURCHASE_VIDEO,
      {
        fileId,
      },
    );
  }

  async getUnOpenItems(params: {
    isImage: boolean;
    skip: number;
    take: number;
  }): Promise<APIResponse<UnOpenItemsResponse>> {
    const response = await this.client.post<{
      type?: string;
      items?: unknown[];
      message?: string;
    }>(GET_UNOPEN_ITEMS, params, {
      cache: 'no-cache',
    });
    // Route Handler は { type: 'success', items: [...] } を返すため、APIResponse形式に変換
    if (response.type === 'error') {
      return {
        code: -1,
        data: { items: [] } as unknown as UnOpenItemsResponse,
      };
    }
    return {
      code: 0,
      data: { items: response.items ?? [] } as unknown as UnOpenItemsResponse,
    };
  }
}

export function createGalleryService(client: HttpClient): GalleryService {
  if (client.getContext() === Context.SERVER) {
    return new ServerGalleryService(client);
  } else {
    return new ClientGalleryService(client);
  }
}

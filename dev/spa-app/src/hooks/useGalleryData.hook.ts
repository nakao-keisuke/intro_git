import { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { bannedUserIdList } from '@/constants/bannedUserIdList';
import {
  GET_GALLERY_ITEMS,
  GET_IMAGE_RANKING,
  GET_UNOPEN_ITEMS,
  GET_VIDEO_RANKING,
} from '@/constants/endpoints';
import { postToNext } from '@/utils/next';
import { region } from '@/utils/region';

export type galleryListUserInfo = {
  userId: string;
  fileId: string;
  isFavorite: boolean;
  userName: string;
  avaId: string;
  age: number;
  duration?: number;
  abt?: string;
  views?: number;
  favorites?: number;
  sentDate?: string;
};

export type rankedMeetPerson = {
  isSuddenRise: boolean;
  userId: string;
  rank: number;
  lastActionStatusColor: string;
  stepToCall: number;
  gender: number;
  lastLoginTime: string;
  isNew: boolean;
  userName: string;
  lastActionStatusLabel: string;
  talkTheme: number;
  showingFaceStatus: number;
  lastActionStatusIndex: number;
  channelInfo: string;
  onlineStatusColor: string;
  abt: string;
  callStatus: number;
  onlineStatusLabel: string;
  voiceCallWaiting: boolean;
  region: string;
  avaId: string;
  age: number;
  videoCallWaiting: boolean;
  point: number;
  isSendRequest?: boolean;
};

// APIレスポンスの型定義
type GalleryUser = {
  userId: string;
  userName: string;
  avaId: string;
  age: number;
  abt?: string;
};

type OpenedContent = {
  fileId: string;
};

type UnOpenedContent = {
  fileId: string;
  views?: number;
  favorites?: number;
  sentDate?: string;
  duration?: number;
};

type GalleryItemResponse = {
  favoriteGalleryList?: Array<{
    galleryUser: GalleryUser;
    openedContent: OpenedContent;
  }>;
  nonFavoriteGalleryList?: Array<{
    galleryUser: GalleryUser;
    openedContent: OpenedContent;
  }>;
};

type UnOpenItemsResponse = {
  items?: Array<{
    user: GalleryUser;
    unopenedContent: UnOpenedContent;
  }>;
};

type RankingUser = {
  userId: string;
  userName: string;
  avaId: string;
  age: number;
  abt: string;
  lastActionStatusColor: string;
  stepToCall: number;
  gender: number;
  lastLoginTime: string;
  isNew: boolean;
  lastActionStatusLabel: string;
  talkTheme: number;
  showingFaceStatus: number;
  lastActionStatusIndex: number;
  channelInfo: string;
  onlineStatusColor: string;
  callStatus: number;
  onlineStatusLabel: string;
  voiceCallWaiting: boolean;
  region: number;
  videoCallWaiting: boolean;
};

type RankingItem = {
  isSuddenRise: boolean;
  userId: string;
  rank: number;
  point: number;
  user: RankingUser;
};

type RankingResponse = RankingItem[];

type SwrFetcherParams = Record<string, unknown>;

type ErrorResponse = {
  type: 'error';
  message: string;
};

const isErrorResponse = (value: unknown): value is ErrorResponse => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ErrorResponse>;
  return candidate.type === 'error' && typeof candidate.message === 'string';
};

const fetcher = async <T>([key, params]: [
  string,
  SwrFetcherParams,
]): Promise<T> => {
  const response = await postToNext(key, params);
  if (isErrorResponse(response)) {
    throw new Error(response.message);
  }
  return response as T;
};

export function useGalleryData() {
  const [openMovies, setOpenMovies] = useState<galleryListUserInfo[]>([]);
  const [openImages, setOpenImages] = useState<galleryListUserInfo[]>([]);
  const [unOpenMovies, setUnOpenMovies] = useState<galleryListUserInfo[]>([]);
  const [unOpenImages, setUnOpenImages] = useState<galleryListUserInfo[]>([]);
  const [videoRankingList, setVideoRankingList] = useState<rankedMeetPerson[]>(
    [],
  );
  const [imageRankingList, setImageRankingList] = useState<rankedMeetPerson[]>(
    [],
  );
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // SWRを使ってデータを取得（キャッシュあり）
  // 開封済み動画
  const { data: openMovieData, error: openMovieError } =
    useSWR<GalleryItemResponse>(
      [GET_GALLERY_ITEMS, { is_image: false }],
      fetcher<GalleryItemResponse>,
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      },
    );

  // 開封済み画像
  const { data: openImageData, error: openImageError } =
    useSWR<GalleryItemResponse>(
      [GET_GALLERY_ITEMS, { is_image: true }],
      fetcher<GalleryItemResponse>,
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      },
    );

  // 未開封動画
  const { data: unOpenMovieData, error: unOpenMovieError } =
    useSWR<UnOpenItemsResponse>(
      [GET_UNOPEN_ITEMS, { is_image: false, skip: 0, take: 50 }],
      fetcher<UnOpenItemsResponse>,
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: 30000, // 30秒ごとに自動更新
      },
    );

  // 未開封画像
  const { data: unOpenImageData, error: unOpenImageError } =
    useSWR<UnOpenItemsResponse>(
      [GET_UNOPEN_ITEMS, { is_image: true, skip: 0, take: 50 }],
      fetcher<UnOpenItemsResponse>,
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: 30000, // 30秒ごとに自動更新
      },
    );

  // 動画ランキング
  const { data: videoRankingData, error: videoRankingError } =
    useSWR<RankingResponse>([GET_VIDEO_RANKING, {}], fetcher<RankingResponse>, {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 3600000, // 60分間はキャッシュを使用
    });

  // 画像ランキング
  const { data: imageRankingData, error: imageRankingError } =
    useSWR<RankingResponse>([GET_IMAGE_RANKING, {}], fetcher<RankingResponse>, {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 3600000, // 60分間はキャッシュを使用
    });

  const isLoading =
    !openMovieData ||
    !openImageData ||
    !unOpenMovieData ||
    !unOpenImageData ||
    !videoRankingData ||
    !imageRankingData;

  const isError =
    !!openMovieError ||
    !!openImageError ||
    !!unOpenMovieError ||
    !!unOpenImageError ||
    !!videoRankingError ||
    !!imageRankingError;

  useEffect(() => {
    if (
      openMovieData &&
      openImageData &&
      unOpenMovieData &&
      unOpenImageData &&
      videoRankingData &&
      imageRankingData
    ) {
      // 開封済み動画の整形
      const favoriteOpenMovies =
        openMovieData?.favoriteGalleryList?.map((data) => ({
          userId: data.galleryUser.userId,
          fileId: data.openedContent.fileId,
          isFavorite: true,
          userName: data.galleryUser.userName,
          avaId: data.galleryUser.avaId,
          age: data.galleryUser.age,
        })) || [];

      const unFavoriteMovies =
        openMovieData?.nonFavoriteGalleryList?.map((data) => ({
          userId: data.galleryUser.userId,
          fileId: data.openedContent.fileId,
          isFavorite: false,
          userName: data.galleryUser.userName,
          avaId: data.galleryUser.avaId,
          age: data.galleryUser.age,
        })) || [];

      // 開封済み画像の整形
      const favoriteOpenImages =
        openImageData?.favoriteGalleryList?.map((data) => ({
          userId: data.galleryUser.userId,
          fileId: data.openedContent.fileId,
          isFavorite: true,
          userName: data.galleryUser.userName,
          avaId: data.galleryUser.avaId,
          age: data.galleryUser.age,
        })) || [];

      const unFavoriteImages =
        openImageData?.nonFavoriteGalleryList?.map((data) => ({
          userId: data.galleryUser.userId,
          fileId: data.openedContent.fileId,
          isFavorite: false,
          userName: data.galleryUser.userName,
          avaId: data.galleryUser.avaId,
          age: data.galleryUser.age,
        })) || [];

      // 未開封動画の整形
      const unOpenMoviesData: galleryListUserInfo[] =
        unOpenMovieData?.items?.map((data) => {
          const item: galleryListUserInfo = {
            userId: data.user.userId,
            fileId: data.unopenedContent.fileId,
            isFavorite: false,
            userName: data.user.userName,
            avaId: data.user.avaId,
            age: data.user.age,
          };
          if (data.unopenedContent.views !== undefined)
            item.views = data.unopenedContent.views;
          if (data.unopenedContent.favorites !== undefined)
            item.favorites = data.unopenedContent.favorites;
          if (data.unopenedContent.sentDate !== undefined)
            item.sentDate = data.unopenedContent.sentDate;
          if (data.unopenedContent.duration !== undefined)
            item.duration = data.unopenedContent.duration;
          if (data.user.abt !== undefined) item.abt = data.user.abt;
          return item;
        }) || [];

      // 未開封画像の整形
      const unOpenImagesData: galleryListUserInfo[] =
        unOpenImageData?.items?.map((data) => {
          const item: galleryListUserInfo = {
            userId: data.user.userId,
            fileId: data.unopenedContent.fileId,
            isFavorite: false,
            userName: data.user.userName,
            avaId: data.user.avaId,
            age: data.user.age,
          };
          if (data.unopenedContent.views !== undefined)
            item.views = data.unopenedContent.views;
          if (data.unopenedContent.favorites !== undefined)
            item.favorites = data.unopenedContent.favorites;
          if (data.unopenedContent.sentDate !== undefined)
            item.sentDate = data.unopenedContent.sentDate;
          if (data.user.abt !== undefined) item.abt = data.user.abt;
          return item;
        }) || [];

      // ランキングデータの整形
      const filteredVideoRankingData = videoRankingData?.filter(
        (e) => bannedUserIdList.indexOf(e.userId) === -1,
      );

      const videoRankingListData =
        filteredVideoRankingData?.map((data) => ({
          isSuddenRise: data.isSuddenRise,
          userId: data.userId,
          rank: data.rank,
          lastActionStatusColor: data.user.lastActionStatusColor,
          stepToCall: data.user.stepToCall,
          gender: data.user.gender,
          lastLoginTime: data.user.lastLoginTime,
          isNew: data.user.isNew,
          userName: data.user.userName,
          lastActionStatusLabel: data.user.lastActionStatusLabel,
          talkTheme: data.user.talkTheme,
          showingFaceStatus: data.user.showingFaceStatus,
          lastActionStatusIndex: data.user.lastActionStatusIndex,
          channelInfo: data.user.channelInfo,
          onlineStatusColor: data.user.onlineStatusColor,
          abt: data.user.abt,
          callStatus: data.user.callStatus,
          onlineStatusLabel: data.user.onlineStatusLabel,
          voiceCallWaiting: data.user.voiceCallWaiting,
          region: region(Number(data.user.region)),
          avaId: data.user.avaId,
          age: data.user.age,
          videoCallWaiting: data.user.videoCallWaiting,
          point: data.point,
        })) || [];

      const filteredImageRankingData = imageRankingData?.filter(
        (e) => bannedUserIdList.indexOf(e.userId) === -1,
      );

      const imageRankingListData =
        filteredImageRankingData?.map((data) => ({
          isSuddenRise: data.isSuddenRise,
          userId: data.userId,
          rank: data.rank,
          lastActionStatusColor: data.user.lastActionStatusColor,
          stepToCall: data.user.stepToCall,
          gender: data.user.gender,
          lastLoginTime: data.user.lastLoginTime,
          isNew: data.user.isNew,
          userName: data.user.userName,
          lastActionStatusLabel: data.user.lastActionStatusLabel,
          talkTheme: data.user.talkTheme,
          showingFaceStatus: data.user.showingFaceStatus,
          lastActionStatusIndex: data.user.lastActionStatusIndex,
          channelInfo: data.user.channelInfo,
          onlineStatusColor: data.user.onlineStatusColor,
          abt: data.user.abt,
          callStatus: data.user.callStatus,
          onlineStatusLabel: data.user.onlineStatusLabel,
          voiceCallWaiting: data.user.voiceCallWaiting,
          region: region(Number(data.user.region)),
          avaId: data.user.avaId,
          age: data.user.age,
          videoCallWaiting: data.user.videoCallWaiting,
          point: data.point,
        })) || [];

      // ステートを更新
      setOpenMovies(favoriteOpenMovies.concat(unFavoriteMovies));
      setOpenImages(favoriteOpenImages.concat(unFavoriteImages));
      setUnOpenMovies(unOpenMoviesData);
      setUnOpenImages(unOpenImagesData);
      setVideoRankingList(videoRankingListData);
      setImageRankingList(imageRankingListData);

      // 初回ロード完了
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [
    openMovieData,
    openImageData,
    unOpenMovieData,
    unOpenImageData,
    videoRankingData,
    imageRankingData,
    isInitialLoad,
  ]);

  // 手動でデータを再取得する関数
  const refreshGalleryData = async () => {
    // SWRのmutateを使ってキャッシュをクリアして再取得（並列実行）
    await Promise.all([
      mutate([GET_GALLERY_ITEMS, { is_image: false }]),
      mutate([GET_GALLERY_ITEMS, { is_image: true }]),
      mutate([GET_UNOPEN_ITEMS, { is_image: false, skip: 0, take: 50 }]),
      mutate([GET_UNOPEN_ITEMS, { is_image: true, skip: 0, take: 50 }]),
      mutate([GET_VIDEO_RANKING, {}]),
      mutate([GET_IMAGE_RANKING, {}]),
    ]);
  };

  return {
    openMovies,
    openImages,
    unOpenMovies,
    unOpenImages,
    videoRankingList,
    imageRankingList,
    isLoading: isLoading || isInitialLoad,
    isError,
    refreshGalleryData,
  };
}

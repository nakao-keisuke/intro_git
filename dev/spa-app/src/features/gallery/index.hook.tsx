import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import {
  type GetGalleryItemsResponseElementData,
  getGalleryRequest,
} from '@/apis/get-gallery-items';
import {
  type GetImageRankingResponseElementData,
  getImageRankingRequest,
} from '@/apis/get-image-ranking';
import {
  type GetUnOpenGalleryItemsResponseElementData,
  getUnOpenGalleryRequest,
} from '@/apis/get-unopened_items';
import {
  type GetVideoRankingResponseElementData,
  getVideoRankingRequest,
} from '@/apis/get-video-ranking';
import { bannedUserIdList } from '@/constants/bannedUserIdList';
import type { ResponseData } from '@/types/NextApi';
import { getUserToken } from '@/utils/cookie';
import { postToJambo } from '@/utils/jambo';
import { type Region, region } from '@/utils/region';
import { isMobileUserAgent } from '@/utils/userAgent';

export type galleryListUserInfo = {
  userId: string;
  fileId: string;
  isFavorite: boolean;
  userName: string;
  avatarId: string;
  age: number;
  duration?: number;
  abt?: string;
  views?: number;
  favorites?: number;
  sentDate?: string;
};

export type rankedMeetPerson = {
  is_sudden_rise: boolean;
  user_id: string;
  rank: number;
  last_action_status_color: string;
  step_to_call: number;
  gender: number;
  last_login_time: string;
  is_new: boolean;
  user_name: string;
  last_action_status_label: string;
  talk_theme: number;
  showing_face_status: number;
  last_action_status_index: number;
  channel_info: string;
  online_status_color: string;
  abt: string;
  call_status: number;
  online_status_label: string;
  voice_call_waiting: boolean;
  region: Region;
  ava_id: string;
  age: number;
  video_call_waiting: boolean;
  point: number;
  isSendRequest?: boolean;
};

export const getServerSideProps: GetServerSideProps<
  ResponseData<{
    openMovies: galleryListUserInfo[];
    openImages: galleryListUserInfo[];
    videoRankingList: rankedMeetPerson[];
    imageRankingList: rankedMeetPerson[];
  }>
> = async (context: GetServerSidePropsContext) => {
  const userAgent = context.req.headers['user-agent'];
  if (!userAgent) {
    return { props: { type: 'error', message: '不正なリクエストです' } };
  }
  if (isMobileUserAgent(userAgent)) {
    if (context.resolvedUrl.includes('pc')) {
      return {
        redirect: {
          destination: context.resolvedUrl.replace('/pc', ''),
          permanent: false,
        },
      };
    }
  } else {
    if (!context.resolvedUrl.includes('pc')) {
      return {
        redirect: {
          destination: `${context.resolvedUrl}/pc`,
          permanent: false,
        },
      };
    }
  }
  const token = await getUserToken(context.req);
  if (!token)
    return {
      redirect: {
        destination: isMobileUserAgent(userAgent) ? '/login' : '/login/pc',
        permanent: false,
      },
    };

  const is_image = await getUserToken(context.req);
  if (!is_image)
    return {
      redirect: {
        destination: isMobileUserAgent(userAgent) ? '/login' : '/login/pc',
        permanent: false,
      },
    };
  const galleryMovieRequest = getGalleryRequest(token, false);
  const galleryImageRequest = getGalleryRequest(token, true);
  const videoRankingRequest = getVideoRankingRequest(token);
  const imageRankingRequest = getImageRankingRequest(token);
  const unOpenGalleryMovieRequest = getUnOpenGalleryRequest(
    token,
    false,
    0,
    50,
  );
  const unOpenGalleryImageRequest = getUnOpenGalleryRequest(token, true, 0, 50);

  const [
    { code: openMovieCode, data: openMovieData },
    { code: openImageCode, data: openImageData },
    { code: unOpenMovieCode, data: unOpenMovieData },
    { code: unOpenImageCode, data: unOpenImageData },
    { code: videoRankingCode, data: videoRankingData },
    { code: imageRankingCode, data: imageRankingData },
  ] = await Promise.all([
    postToJambo<GetGalleryItemsResponseElementData>(
      galleryMovieRequest,
      context.req,
    ),
    postToJambo<GetGalleryItemsResponseElementData>(
      galleryImageRequest,
      context.req,
    ),
    postToJambo<GetUnOpenGalleryItemsResponseElementData>(
      unOpenGalleryMovieRequest,
      context.req,
    ),
    postToJambo<GetUnOpenGalleryItemsResponseElementData>(
      unOpenGalleryImageRequest,
      context.req,
    ),
    postToJambo<GetVideoRankingResponseElementData>(
      videoRankingRequest,
      context.req,
    ),
    postToJambo<GetImageRankingResponseElementData>(
      imageRankingRequest,
      context.req,
    ),
  ]);

  const favoriteOpenMovies =
    openMovieData?.favorite_gallery_list.map((data) => ({
      userId: data.gallery_user.user_id,
      fileId: data.opened_content.file_id,
      isFavorite: true,
      userName: data.gallery_user.user_name,
      avatarId: data.gallery_user.ava_id,
      age: data.gallery_user.age,
    })) || [];

  const unFavoriteMovies =
    openMovieData?.non_favorite_gallery_list.map((data) => ({
      userId: data.gallery_user.user_id,
      fileId: data.opened_content.file_id,
      isFavorite: false,
      userName: data.gallery_user.user_name,
      avatarId: data.gallery_user.ava_id,
      age: data.gallery_user.age,
    })) || [];

  const favoriteOpenImages =
    openImageData?.favorite_gallery_list.map((data) => ({
      userId: data.gallery_user.user_id,
      fileId: data.opened_content.file_id,
      isFavorite: true,
      userName: data.gallery_user.user_name,
      avatarId: data.gallery_user.ava_id,
      age: data.gallery_user.age,
    })) || [];

  const unFavoriteImages =
    openImageData?.non_favorite_gallery_list.map((data) => ({
      userId: data.gallery_user.user_id,
      fileId: data.opened_content.file_id,
      isFavorite: false,
      userName: data.gallery_user.user_name,
      avatarId: data.gallery_user.ava_id,
      age: data.gallery_user.age,
    })) || [];

  const unOpenMovies =
    unOpenMovieData?.map((data) => ({
      userId: data.user.user_id,
      fileId: data.unopened_content.file_id,
      views: data.unopened_content.views,
      favorites: data.unopened_content.favorites,
      sentDate: data.unopened_content.sent_date,
      isFavorite: false,
      userName: data.user.user_name,
      avatarId: data.user.ava_id,
      age: data.user.age,
      duration: data.unopened_content.duration,
      abt: data.user.abt,
    })) || [];

  const unOpenImages =
    unOpenImageData?.map((data) => ({
      userId: data.user.user_id,
      fileId: data.unopened_content.file_id,
      views: data.unopened_content.views,
      favorites: data.unopened_content.favorites,
      sentDate: data.unopened_content.sent_date,
      isFavorite: false,
      userName: data.user.user_name,
      avatarId: data.user.ava_id,
      age: data.user.age,
    })) || [];

  const filteredVideoRankingData = videoRankingData?.filter(
    (e) => bannedUserIdList.indexOf(e.user_id) === -1,
  );

  const filteredImageRankingData = imageRankingData?.filter(
    (e) => bannedUserIdList.indexOf(e.user_id) === -1,
  );

  const videoRankingList =
    filteredVideoRankingData?.map((data) => ({
      is_sudden_rise: data.is_sudden_rise,
      user_id: data.user_id,
      rank: data.rank,
      last_action_status_color: data.user.last_action_status_color,
      step_to_call: data.user.step_to_call,
      gender: data.user.gender,
      last_login_time: data.user.last_login_time,
      is_new: data.user.is_new,
      user_name: data.user.user_name,
      last_action_status_label: data.user.last_action_status_label,
      talk_theme: data.user.talk_theme,
      showing_face_status: data.user.showing_face_status,
      last_action_status_index: data.user.last_action_status_index,
      channel_info: data.user.channel_info,
      online_status_color: data.user.online_status_color,
      abt: data.user.abt,
      call_status: data.user.call_status,
      online_status_label: data.user.online_status_label,
      voice_call_waiting: data.user.voice_call_waiting,
      region: region(data.user.region),
      ava_id: data.user.ava_id,
      age: data.user.age,
      video_call_waiting: data.user.video_call_waiting,
      point: data.point,
    })) || [];

  const imageRankingList =
    filteredImageRankingData?.map((data) => ({
      is_sudden_rise: data.is_sudden_rise,
      user_id: data.user_id,
      rank: data.rank,
      last_action_status_color: data.user.last_action_status_color,
      step_to_call: data.user.step_to_call,
      gender: data.user.gender,
      last_login_time: data.user.last_login_time,
      is_new: data.user.is_new,
      user_name: data.user.user_name,
      last_action_status_label: data.user.last_action_status_label,
      talk_theme: data.user.talk_theme,
      showing_face_status: data.user.showing_face_status,
      last_action_status_index: data.user.last_action_status_index,
      channel_info: data.user.channel_info,
      online_status_color: data.user.online_status_color,
      abt: data.user.abt,
      call_status: data.user.call_status,
      online_status_label: data.user.online_status_label,
      voice_call_waiting: data.user.voice_call_waiting,
      region: region(data.user.region),
      ava_id: data.user.ava_id,
      age: data.user.age,
      video_call_waiting: data.user.video_call_waiting,
      point: data.point,
    })) || [];

  if (
    openMovieCode ||
    openImageCode ||
    unOpenMovieCode ||
    unOpenImageCode ||
    videoRankingCode ||
    imageRankingCode
  )
    return {
      props: { type: 'error', message: 'エラーが発生しました' },
    };

  return {
    props: {
      type: 'success',
      openMovies: favoriteOpenMovies.concat(unFavoriteMovies),
      openImages: favoriteOpenImages.concat(unFavoriteImages),
      unOpenMovies: unOpenMovies,
      unOpenImages: unOpenImages,
      videoRankingList: videoRankingList,
      imageRankingList: imageRankingList,
    },
  };
};

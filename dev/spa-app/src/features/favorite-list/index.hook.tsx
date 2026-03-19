import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import {
  type GetUserInfoForWebResponseData,
  getUserInfoForWebRequest,
} from '@/apis/get-user-inf-for-web';
import {
  type GetUtageWebPointInfoResponseData,
  getUtageWebPointInfoRequest,
} from '@/apis/get-utage-web-point-info';
import { type LstFavResponseElementData, lstFavRequest } from '@/apis/lst-fav';
import { type LstFvtResponseElementData, lstFvtRequest } from '@/apis/lst-fvt';
import type { ResponseData } from '@/types/NextApi';
import { getUserToken } from '@/utils/cookie';
import { postToJambo } from '@/utils/jambo';
import { type Region, region } from '@/utils/region';
import { isMobileUserAgent } from '@/utils/userAgent';

export type FavoriteListUserInfo = {
  userId: string;
  userName: string;
  age: number;
  about: string;
  region: Region;
  avatarId: string;
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
  bustSize?: string;
  hLevel?: string;
  isNewUser: boolean;
  hasLovense: boolean;
  isCalling: boolean;
};

export const getServerSideProps: GetServerSideProps<
  ResponseData<{
    myFavoriteList: FavoriteListUserInfo[];
    favoritedMeList: FavoriteListUserInfo[];
    isPurchased: boolean;
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

  const myFavoriteRequest = lstFavRequest(token);
  const favoritedMeRequest = lstFvtRequest(token);
  const pointInfoRequest = getUtageWebPointInfoRequest(token);

  const [
    { code: myCode, data: myData },
    { code: otherCode, data: otherData },
    { code: creditCode, data: creditData },
  ] = await Promise.all([
    postToJambo<LstFavResponseElementData[]>(myFavoriteRequest, context.req),
    postToJambo<LstFvtResponseElementData[]>(favoritedMeRequest, context.req),
    postToJambo<GetUtageWebPointInfoResponseData>(
      pointInfoRequest,
      context.req,
    ),
  ]);

  if (myCode || otherCode) {
    return {
      props: {
        type: 'error',
        message: 'エラーが発生しました',
      },
    };
  }

  const myFavoriteUserIds = myData?.map((data) => data.user_id) || [];
  const favoritedMeUserIds = otherData?.map((data) => data.user_id) || [];

  const myFavoriteUserDetailsPromises = myFavoriteUserIds.map((userId) => {
    const userInfoRequest = getUserInfoForWebRequest(userId);
    return postToJambo<GetUserInfoForWebResponseData>(
      userInfoRequest,
      context.req,
    );
  });

  const favoritedMeUserDetailsPromises = favoritedMeUserIds.map((userId) => {
    const userInfoRequest = getUserInfoForWebRequest(userId);
    return postToJambo<GetUserInfoForWebResponseData>(
      userInfoRequest,
      context.req,
    );
  });

  const myFavoriteUserDetailsResponses = await Promise.all(
    myFavoriteUserDetailsPromises,
  );

  const favoritedMeUserDetailsResponses = await Promise.all(
    favoritedMeUserDetailsPromises,
  );

  const myFavoriteUserDetailsMap = new Map<
    string,
    GetUserInfoForWebResponseData
  >();
  myFavoriteUserDetailsResponses.forEach((response) => {
    if (response.code === 0 && response.data) {
      myFavoriteUserDetailsMap.set(response.data.user_id, response.data);
    }
  });

  const favoritedMeUserDetailsMap = new Map<
    string,
    GetUserInfoForWebResponseData
  >();
  favoritedMeUserDetailsResponses.forEach((response) => {
    if (response.code === 0 && response.data) {
      favoritedMeUserDetailsMap.set(response.data.user_id, response.data);
    }
  });

  return {
    props: {
      type: 'success',
      myFavoriteList:
        myData?.map((data) => {
          const myUserDetails = myFavoriteUserDetailsMap.get(data.user_id);

          return {
            userId: data.user_id,
            avatarId: data.ava_id,
            videoCallWaiting: data.video_call_waiting ?? false,
            voiceCallWaiting: data.voice_call_waiting ?? false,
            about: data.abt ?? '',
            age: data.age,
            region: region(data.region),
            userName: data.user_name,
            bustSize: myUserDetails?.bust_size || '',
            hLevel: myUserDetails?.h_level || '',
            isNewUser: myUserDetails?.is_new ?? false,
            hasLovense: myUserDetails?.has_lovense ?? false,
            isCalling: false,
          };
        }) ?? ([] as FavoriteListUserInfo[]),

      favoritedMeList:
        otherData?.map((data) => {
          const favoritedMeUserDetails = favoritedMeUserDetailsMap.get(
            data.user_id,
          );

          return {
            userId: data.user_id,
            avatarId: data.ava_id,
            videoCallWaiting: data.video_call_waiting ?? false,
            voiceCallWaiting: data.voice_call_waiting ?? false,
            about: data.abt ?? '',
            age: data.age,
            region: region(data.region),
            userName: data.user_name,
            bustSize: favoritedMeUserDetails?.bust_size || '',
            hLevel: favoritedMeUserDetails?.h_level || '',
            isNewUser: favoritedMeUserDetails?.is_new ?? false,
            hasLovense: favoritedMeUserDetails?.has_lovense ?? false,
            isCalling: false,
          };
        }) ?? ([] as FavoriteListUserInfo[]),
      isPurchased: !!creditData?.is_purchased,
    },
  };
};

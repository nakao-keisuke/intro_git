import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import {
  type GetUserInfoForWebResponseData,
  getUserInfoForWebRequest,
} from '@/apis/get-user-inf-for-web';
import {
  type ListBookmarkResponseElementData,
  listBookmarkRequest,
} from '@/apis/list-bookmark';
import type { ResponseData } from '@/types/NextApi';
import { getUserToken } from '@/utils/cookie';
import { postToJambo } from '@/utils/jambo';
import { type Region, region } from '@/utils/region';
import { isMobileUserAgent } from '@/utils/userAgent';

export type BookmarkListUserInfo = {
  userId: string;
  userName: string;
  age: number;
  about: string;
  region: Region;
  avatarId: string;
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
  bustSize: string;
  hLevel: string;
  isNewUser: boolean;
  hasLovense: boolean;
  lastLoginTime: string;
};

export const getServerSideProps: GetServerSideProps<
  ResponseData<{
    bookmarkList: BookmarkListUserInfo[];
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

  const bookmarkListRequest = listBookmarkRequest(token);

  const { code, data } = await postToJambo<ListBookmarkResponseElementData[]>(
    bookmarkListRequest,
    context.req,
  );

  if (code) {
    return {
      props: {
        type: 'error',
        message: 'エラーが発生しました',
      },
    };
  }

  // お気に入りリストからユーザーIDを取得
  const userIds = data?.map((data) => data.user_id) || [];

  // 各ユーザーの詳細情報を取得
  const userDetailsPromises = userIds.map((userId) => {
    const userInfoRequest = getUserInfoForWebRequest(userId);
    return postToJambo<GetUserInfoForWebResponseData>(
      userInfoRequest,
      context.req,
    );
  });

  const userDetailsResponses = await Promise.all(userDetailsPromises);

  // ユーザー詳細情報をマッピング
  const userDetailsMap = new Map<string, GetUserInfoForWebResponseData>();
  userDetailsResponses.forEach((response) => {
    if (response.code === 0 && response.data) {
      userDetailsMap.set(response.data.user_id, response.data);
    }
  });

  const bookmarkDataList = data
    ? Array.from(new Map(data.map((data) => [data.user_id, data])).values())
    : [];

  return {
    props: {
      type: 'success',
      bookmarkList:
        bookmarkDataList.map((data) => {
          const userDetails = userDetailsMap.get(data.user_id);
          return {
            userId: data.user_id,
            avatarId: data.ava_id,
            videoCallWaiting: data.video_call_waiting ?? false,
            voiceCallWaiting: data.voice_call_waiting ?? false,
            about: data.abt ?? '',
            age: data.age,
            region: region(data.region),
            userName: data.user_name,
            bustSize: userDetails?.bust_size || '',
            hLevel: userDetails?.h_level || '',
            isNewUser: userDetails?.is_new ?? false,
            hasLovense: userDetails?.has_lovense ?? false,
            lastLoginTime:
              userDetails?.last_login_time_from_user_collection || '',
          };
        }) ?? ([] as BookmarkListUserInfo[]),
    },
  };
};

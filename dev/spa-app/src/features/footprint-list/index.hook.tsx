import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import {
  type FooterPrintResponseData,
  getFooterPrintHistoryRequest,
} from '@/apis/get-foot-print-list';
import { type LstFavResponseElementData, lstFavRequest } from '@/apis/lst-fav';
import type { ResponseData } from '@/types/NextApi';
import { getUserToken } from '@/utils/cookie';
import { postToJambo } from '@/utils/jambo';
import { type Region, region } from '@/utils/region';

export type FootprintListUserInfo = {
  userId: string;
  userName: string;
  age: number;
  about: string;
  region: Region;
  avatarId: string;
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
  lastLoginTime: string;
  checkTime: string;
  isFavorited: boolean;
  bustSize?: string;
  hLevel?: string;
  isNewUser: boolean;
  timeStamp: string; // For infinite scroll
};

export const getServerSideProps: GetServerSideProps<
  ResponseData<{
    list: FootprintListUserInfo[];
  }>
> = async (context: GetServerSidePropsContext) => {
  const token = await getUserToken(context.req);
  if (!token)
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };

  // 足跡履歴とお気に入り一覧取得
  const footprintRequest = getFooterPrintHistoryRequest(token);
  const myFavoriteRequest = lstFavRequest(token);

  const [
    { code: footerPrintCode, data: footerPrintData },
    { code: favCode, data: favData },
  ] = await Promise.all([
    postToJambo<FooterPrintResponseData[]>(footprintRequest, context.req),
    postToJambo<LstFavResponseElementData[]>(myFavoriteRequest, context.req),
  ]);

  // 足跡履歴とお気に入り一覧取得のエラーチェック
  if (footerPrintCode || favCode) {
    return {
      props: {
        type: 'error',
        message: 'エラーが発生しました',
      },
    };
  }

  // 足あとリストからユーザーIDを取得
  const favList = favData?.map((data) => data.user_id) ?? [];

  return {
    props: {
      type: 'success',
      list:
        footerPrintData?.map((data) => {
          return {
            userId: data.user_id,
            avatarId: data.ava_id,
            videoCallWaiting: data.video_call_waiting ?? false,
            voiceCallWaiting: data.voice_call_waiting ?? false,
            about: data.abt ?? '',
            age: data.age,
            region: region(data.region),
            userName: data.user_name,
            lastLoginTime: data.last_login ?? '202401010000',
            checkTime: data.chk_time,
            isFavorited: favList.includes(data.user_id),
            bustSize: data?.bust_size || '',
            hLevel: data?.h_level || '',
            isNewUser: data?.is_new_user ?? false,
            timeStamp: data.chk_time, // Use checkTime as timeStamp for infinite scroll
          };
        }) ?? [],
    },
  };
};

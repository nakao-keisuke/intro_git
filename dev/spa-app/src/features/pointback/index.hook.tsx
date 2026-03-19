import type { GetServerSideProps } from 'next';
import {
  type GetPeriodPointBackInfoResponseData,
  getPeriodPointBackInfoRequest,
} from '@/apis/get-period-point-back-info';
import {
  type GetUtageWebPointInfoResponseData,
  getUtageWebPointInfoRequest,
} from '@/apis/get-utage-web-point-info';
import { getUserToken } from '@/utils/cookie';
import { postToJambo } from '@/utils/jambo';

export const getServerSideProps: GetServerSideProps<{
  isLoggedIn: boolean;
  isPurchased: boolean;
  consumedPoint: number;
  periodPointBackInfo: GetPeriodPointBackInfoResponseData | null;
}> = async (context) => {
  const token = await getUserToken(context.req);
  if (!token)
    return {
      props: {
        isLoggedIn: false,
        isPurchased: false,
        consumedPoint: 0,
        periodPointBackInfo: null,
      },
    };

  const pointInfoRequest = getUtageWebPointInfoRequest(token);
  const { code, data } = await postToJambo<GetUtageWebPointInfoResponseData>(
    pointInfoRequest,
    context.req,
  );

  // 期間ポイントバック情報を取得
  const periodPointBackRequest = getPeriodPointBackInfoRequest(token, 'weekly');
  const { code: periodCode, data: periodData } =
    await postToJambo<GetPeriodPointBackInfoResponseData>(
      periodPointBackRequest,
      context.req,
    );

  return {
    props: {
      isLoggedIn: true,
      isPurchased: !!data?.is_purchased,
      consumedPoint: data?.point || 0,
      periodPointBackInfo: periodCode ? null : periodData,
    },
  };
};

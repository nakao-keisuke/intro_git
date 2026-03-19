import type { GetServerSideProps } from 'next';
import {
  type GetPeriodPointBackInfoResponseData,
  getPeriodPointBackInfoRequest,
} from '@/apis/get-period-point-back-info';
import type { ResponseData } from '@/types/NextApi';
import { getUserToken } from '@/utils/cookie';
import { postToJambo } from '@/utils/jambo';

export const getServerSideProps: GetServerSideProps<{
  data: ResponseData<{
    predicted_points_at_next_level: number;
    used_point: number;
    points_until_next_level: number;
    predicted_return_points: number;
    period_type: string;
    return_point: number;
    token: string;
  }>;
}> = async (context) => {
  const token = await getUserToken(context.req);
  if (!token)
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  const getPeriodPointBackRequest = getPeriodPointBackInfoRequest(
    token,
    'weekly',
  );

  const [{ code: pointBackCode, data: pointBackData }] = await Promise.all([
    postToJambo<GetPeriodPointBackInfoResponseData>(
      getPeriodPointBackRequest,
      context.req,
    ),
  ]);

  return {
    props: {
      data: {
        type: 'success',
        predicted_points_at_next_level:
          pointBackData?.predicted_points_at_next_level ?? 0,
        used_point: pointBackData?.used_point || 0,
        points_until_next_level: pointBackData?.points_until_next_level || 0,
        predicted_return_points: pointBackData?.predicted_return_points || 0,
        period_type: pointBackData?.period_type ?? 'daily',
        return_point: pointBackData?.return_point || 0,
        token,
      },
    },
  };
};

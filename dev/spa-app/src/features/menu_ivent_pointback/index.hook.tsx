import type { GetServerSideProps } from 'next';
import {
  campaignForMaleRequest,
  type VideochatCampaignResponseData,
} from '@/apis/get-second-apps-campaign-info';
import {
  type GetUserInfoResponseData,
  getUserInfoRequest,
} from '@/apis/get-user-inf';
import type { ResponseData } from '@/types/NextApi';
import { getUserToken } from '@/utils/cookie';
import { postToJambo } from '@/utils/jambo';

export const getServerSideProps: GetServerSideProps<{
  data: ResponseData<{
    isLogin: boolean;
    userName?: string;
    count?: number;
    consumePoint?: number;
  }>;
}> = async (context) => {
  const token = await getUserToken(context.req);
  if (!token)
    return {
      props: {
        data: {
          type: 'success',
          isLogin: false,
        },
      },
    };
  const request = campaignForMaleRequest(token);
  const userRequest = getUserInfoRequest(token);
  const [{ code, data: campaignInfoData }, { code: userCode, data: userData }] =
    await Promise.all([
      postToJambo<VideochatCampaignResponseData>(request, context.req),
      postToJambo<GetUserInfoResponseData>(userRequest, context.req),
    ]);

  const campaignInfoResponseData = {
    count: campaignInfoData?.total_count_of_sending_present_menu ?? 0,
    consumePoint: campaignInfoData?.total_consume_point_of_present_menu ?? 0,
  };

  const getUserData = {
    userName: userData?.user_name ?? '',
  };

  return {
    props: {
      data: {
        type: 'success',
        isLogin: true,
        ...campaignInfoResponseData,
        ...getUserData,
      },
    },
  };
};

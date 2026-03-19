import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import type { ResponseData } from '@/types/NextApi';
import type { UpdateUserInfo } from '@/types/UpdateUserInfo';
import { getUserToken } from '@/utils/cookie';

export type Props = {
  data: ResponseData<{
    updateUserInfo: UpdateUserInfo;
  }>;
};

import {
  type GetUserInfoResponseData,
  getUserInfoRequest,
} from '@/apis/get-user-inf';
import { bodyType } from '@/utils/bodyType';
import {
  isBonusAvailable,
  profileIndexOfAbout,
  profileIndexOfAge,
  profileIndexOfAvatar,
  profileIndexOfBodytype,
  profileIndexOfHobby,
} from '@/utils/bonusAvailable';
import { hobby } from '@/utils/hobby';
import { postToJambo } from '@/utils/jambo';
import { personality } from '@/utils/personality';
import { region } from '@/utils/region';
import { talkTheme } from '@/utils/talkTheme';

export const getServerSideProps: GetServerSideProps<Props> = async (
  context: GetServerSidePropsContext,
) => {
  const token = await getUserToken(context.req);
  if (!token)
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  const request = getUserInfoRequest(token);
  const { code, data } = await postToJambo<GetUserInfoResponseData>(
    request,
    context.req,
  );
  if (code)
    return {
      props: {
        data: {
          type: 'error',
          message: 'ユーザー情報が取得できません',
        },
      },
    };
  const bonusFlag = data?.bonus_flag;
  const isAboutBonusAvailable = isBonusAvailable(
    bonusFlag,
    profileIndexOfAbout,
  );
  const isAvatarBonusAvailable = isBonusAvailable(
    bonusFlag,
    profileIndexOfAvatar,
  );
  const isAgeBonusAvailable = isBonusAvailable(bonusFlag, profileIndexOfAge);
  const isHobbyBonusAvailable = isBonusAvailable(
    bonusFlag,
    profileIndexOfHobby,
  );
  const isBodytypeBonusAvailable = isBonusAvailable(
    bonusFlag,
    profileIndexOfBodytype,
  );

  return {
    props: {
      data: {
        updateUserInfo: {
          userId: data?.user_id,
          userName: data?.user_name,
          avatarId: data?.ava_id,
          age: data?.age,
          region: region(data?.region),
          talktheme: talkTheme(data?.talk_theme),
          inters: hobby(data?.inters),
          about: data?.abt || '',
          personality: personality(data?.personalities),
          bodyType: bodyType(data?.bdy_tpe?.[0] ?? 0),
          isAboutBonusAvailable,
          isAvatarBonusAvailable,
          isAgeBonusAvailable,
          isHobbyBonusAvailable,
          isBodytypeBonusAvailable,
          // 新規追加フィールド：文字列のみ使用
          activeTime: (typeof data?.often_visit_time === 'string'
            ? data?.often_visit_time
            : '未設定') as import('@/utils/activeTime').ActiveTime,
          occupation: (typeof data?.job === 'string'
            ? data?.job
            : '未設定') as import('@/utils/occupation').Occupation,
          preferredLooks: (typeof data?.looks === 'string'
            ? data?.looks
            : '未設定') as import('@/utils/preferredLooks').PreferredLooks,
          holiday: (typeof data?.holidays === 'string'
            ? data?.holidays
            : '未設定') as import('@/utils/holiday').Holiday,
          housemate: (typeof data?.housemate === 'string'
            ? data?.housemate
            : '未設定') as import('@/utils/housemate').Housemate,
          bloodType: (typeof data?.blood_type === 'string'
            ? data?.blood_type
            : '未設定') as import('@/utils/bloodType').BloodType,
          alcohol: (typeof data?.alcohol === 'string'
            ? data?.alcohol
            : '未設定') as import('@/utils/alcohol').Alcohol,
          smoking: (typeof data?.smoking_status === 'string'
            ? data?.smoking_status
            : '未設定') as import('@/utils/smoking').Smoking,
        },
      },
    },
  };
};

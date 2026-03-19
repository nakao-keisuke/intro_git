import { useEffect, useMemo, useState } from 'react';
import type { MyPageInitialData } from '@/services/my-page/type';
import type { User } from '@/services/shared/type';
import { useMyPageStore } from '@/stores/myPageStore';
import type { ResponseData } from '@/types/NextApi';
import type { UpdateUserInfo } from '@/types/UpdateUserInfo';
import { bodyType } from '@/utils/bodyType';
import { hobby } from '@/utils/hobby';
import { personality } from '@/utils/personality';
import { region } from '@/utils/region';
import { talkTheme } from '@/utils/talkTheme';
import { useMyPageService } from './useMyPageService';

const buildUpdateUserInfo = (
  detail: User,
  sharedData: MyPageInitialData,
): UpdateUserInfo => {
  return {
    userId: detail.userId,
    userName: detail.userName,
    avatarId: detail.avaId,
    age: detail.age,
    region: region(detail.region),
    about: detail.abt ?? '',
    talktheme: talkTheme(detail.talkTheme ?? 0),
    inters: hobby(detail.inters ?? []),
    personality: personality(detail.personalities ?? []),
    bodyType: bodyType(detail.bdyTpe?.[0] ?? 0),
    isAboutBonusAvailable: sharedData.isAboutBonusAvailable,
    isAvatarBonusAvailable: sharedData.isAvatarBonusAvailable,
    isAgeBonusAvailable: sharedData.isAgeBonusAvailable,
    isBodytypeBonusAvailable: sharedData.isBodytypeBonusAvailable,
    isHobbyBonusAvailable: sharedData.isHobbyBonusAvailable,
    // 新規追加フィールド：文字列のみ使用
    activeTime: (typeof detail.oftenVisitTime === 'string'
      ? detail.oftenVisitTime
      : '未設定') as import('@/utils/activeTime').ActiveTime,
    occupation: (typeof detail.job === 'string'
      ? detail.job
      : '未設定') as import('@/utils/occupation').Occupation,
    preferredLooks: (typeof detail.looks === 'string'
      ? detail.looks
      : '未設定') as import('@/utils/preferredLooks').PreferredLooks,
    holiday: (typeof detail.holidays === 'string'
      ? detail.holidays
      : '未設定') as import('@/utils/holiday').Holiday,
    housemate: (typeof detail.housemate === 'string'
      ? detail.housemate
      : '未設定') as import('@/utils/housemate').Housemate,
    bloodType: (typeof detail.bloodType === 'string'
      ? detail.bloodType
      : '未設定') as import('@/utils/bloodType').BloodType,
    alcohol: (typeof detail.alcohol === 'string'
      ? detail.alcohol
      : '未設定') as import('@/utils/alcohol').Alcohol,
    smoking: (typeof detail.smokingStatus === 'string'
      ? detail.smokingStatus
      : '未設定') as import('@/utils/smoking').Smoking,
  };
};

const buildSuccessResponse = (
  detail: User,
  sharedData: MyPageInitialData,
): ResponseData<{ updateUserInfo: UpdateUserInfo }> => ({
  type: 'success',
  updateUserInfo: buildUpdateUserInfo(detail, sharedData),
});

const buildErrorResponse = (
  message = 'ユーザー情報が取得できません',
): ResponseData<{ updateUserInfo: UpdateUserInfo }> => ({
  type: 'error',
  message,
});

export const useEditProfileInitialData = () => {
  const setSharedData = useMyPageStore((s) => s.setInitialData);
  const service = useMyPageService();

  const [data, setData] = useState<
    ResponseData<{ updateUserInfo: UpdateUserInfo }>
  >(() => {
    const sharedData = useMyPageStore.getState().initialData;
    if (sharedData?.userDetail) {
      return buildSuccessResponse(sharedData.userDetail, sharedData);
    }
    return buildErrorResponse();
  });
  const [isLoading, setIsLoading] = useState(() => {
    const sharedData = useMyPageStore.getState().initialData;
    return !sharedData?.userDetail;
  });

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      const sharedData = useMyPageStore.getState().initialData;
      if (sharedData?.userDetail) {
        setData(buildSuccessResponse(sharedData.userDetail, sharedData));
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await service.getInitialData();
        if (!isMounted) {
          return;
        }

        setSharedData(result);

        if (result.userDetail) {
          setData(buildSuccessResponse(result.userDetail, result));
        } else {
          setData(buildErrorResponse());
        }
      } catch (_error) {
        if (!isMounted) {
          return;
        }
        setData(buildErrorResponse());
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    hydrate();

    return () => {
      isMounted = false;
    };
  }, []); // 初回のみ実行

  const resolvedData = useMemo(() => {
    const sharedData = useMyPageStore.getState().initialData;
    if (sharedData?.userDetail) {
      return buildSuccessResponse(sharedData.userDetail, sharedData);
    }
    return data;
  }, [data]);

  return {
    data: resolvedData,
    isLoading,
  };
};

export default useEditProfileInitialData;

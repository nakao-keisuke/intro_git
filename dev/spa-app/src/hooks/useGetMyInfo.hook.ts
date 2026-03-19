import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { GetMyUserInfoResponse } from '@/apis/http/userInfo';
import { HTTP_GET_MY_USER_INFO } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import { useMyPageStore } from '@/stores/myPageStore';
import type { MyUserInfo } from '@/types/MyUserInfo';
import type { ResponseData } from '@/types/NextApi';
import type { Region } from '@/utils/region';

export type GetMyInfoState =
  | {
      isLoginUser: true;
      myUserInfo: MyUserInfo & {
        isRegisteredEmail: boolean;
        voiceCallWaiting: boolean;
        videoCallWaiting: boolean;
        token: string;
        region?: Region;
        regDate?: string;
        bustSize?: string;
        hLevel?: string;
        isFirstBonusCourseExist?: boolean;
        isSecondBonusCourseExist?: boolean;
        isThirdBonusCourseExist?: boolean;
        isFourthBonusCourseExist?: boolean;
      };
      isLoading: false;
      data: {
        token: string;
        userId: string;
        userName: string;
        age: number;
        point: number;
        avatarId: string;
        isRegisteredEmail: boolean;
        hobby?: number[] | undefined;
        voiceCallWaiting: boolean;
        videoCallWaiting: boolean;
        region?: Region;
        regDate?: string;
        bustSize?: string;
        hLevel?: string;
        isFirstBonusCourseExist?: boolean;
        isSecondBonusCourseExist?: boolean;
        isThirdBonusCourseExist?: boolean;
        isFourthBonusCourseExist?: boolean;
      };
    }
  | {
      isLoginUser: false;
      myUserInfo: undefined;
      isLoading: false;
      data: undefined;
    }
  | {
      isLoginUser: undefined;
      myUserInfo: undefined;
      isLoading: true;
      data: undefined;
    };

export const useGetMyInfo = () => {
  const setMyPageInitialData = useMyPageStore((s) => s.setInitialData);

  const {
    data: queryData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['myUserInfo'],
    queryFn: async () => {
      const client = new ClientHttpClient();
      const response = await client.post<ResponseData<GetMyUserInfoResponse>>(
        HTTP_GET_MY_USER_INFO,
        {},
      );

      if (response.type === 'error') {
        throw new Error('Failed to fetch user info');
      }

      return response;
    },
    staleTime: 5 * 60 * 1000, // 5分間キャッシュを新鮮として扱う
    gcTime: 10 * 60 * 1000, // 10分間キャッシュを保持
    retry: false, // エラー時は即座に失敗状態にする
  });

  // 購入コース情報を store に設定
  useEffect(() => {
    if (queryData && !isError) {
      // 購入コース情報がある場合のみ更新
      if (
        queryData.isFirstBonusCourseExist !== undefined ||
        queryData.isSecondBonusCourseExist !== undefined ||
        queryData.isThirdBonusCourseExist !== undefined ||
        queryData.isFourthBonusCourseExist !== undefined
      ) {
        // 最新の store の値を取得
        const currentData = useMyPageStore.getState().initialData;

        if (currentData) {
          // 既存データがある場合はマージ
          setMyPageInitialData({
            ...currentData,
            isFirstBonusCourseExist:
              queryData.isFirstBonusCourseExist ??
              currentData.isFirstBonusCourseExist,
            isSecondBonusCourseExist:
              queryData.isSecondBonusCourseExist ??
              currentData.isSecondBonusCourseExist,
            isThirdBonusCourseExist:
              queryData.isThirdBonusCourseExist ??
              currentData.isThirdBonusCourseExist,
            isFourthBonusCourseExist:
              queryData.isFourthBonusCourseExist ??
              currentData.isFourthBonusCourseExist,
          });
        } else {
          // 初回取得時は最小限のデータで初期化
          setMyPageInitialData({
            myUserInfo: null,
            isRegisteredEmail: queryData.isRegisteredEmail,
            voiceCallWaiting: queryData.voiceCallWaiting,
            videoCallWaiting: queryData.videoCallWaiting,
            isAboutBonusAvailable: false,
            isAvatarBonusAvailable: false,
            isAgeBonusAvailable: false,
            isHobbyBonusAvailable: false,
            isBodytypeBonusAvailable: false,
            bannerList: [],
            checkTimeList: [],
            isFirstBonusCourseExist: queryData.isFirstBonusCourseExist ?? false,
            isSecondBonusCourseExist:
              queryData.isSecondBonusCourseExist ?? false,
            isThirdBonusCourseExist: queryData.isThirdBonusCourseExist ?? false,
            isFourthBonusCourseExist:
              queryData.isFourthBonusCourseExist ?? false,
            isFifthBonusCourseExist: false,
            userDetail: null,
            isOnboardingMissionCompleted: false,
          });
        }
      }
    }
  }, [queryData, isError, setMyPageInitialData]);

  // ローディング中
  if (isLoading) {
    return {
      isLoginUser: undefined,
      myUserInfo: undefined,
      isLoading: true,
      data: undefined,
    } as GetMyInfoState;
  }

  // エラーまたは未ログイン
  if (isError || !queryData) {
    return {
      isLoginUser: false,
      myUserInfo: undefined,
      isLoading: false,
      data: undefined,
    } as GetMyInfoState;
  }

  // 必須フィールドを持つベースオブジェクトを作成
  const dataBase = {
    token: queryData.token || '',
    userId: queryData.userId,
    userName: queryData.userName,
    age: queryData.age,
    point: queryData.point,
    avatarId: queryData.avatarId,
    isRegisteredEmail: queryData.isRegisteredEmail,
    hobby: queryData.hobby,
    voiceCallWaiting: queryData.voiceCallWaiting,
    videoCallWaiting: queryData.videoCallWaiting,
  };

  // オプショナルフィールドを条件付きで追加
  const data = {
    ...dataBase,
    ...(queryData.region !== undefined && { region: queryData.region }),
    ...(queryData.regDate !== undefined && { regDate: queryData.regDate }),
    ...(queryData.bustSize !== undefined && { bustSize: queryData.bustSize }),
    ...(queryData.hLevel !== undefined && { hLevel: queryData.hLevel }),
    ...(queryData.isFirstBonusCourseExist !== undefined && {
      isFirstBonusCourseExist: queryData.isFirstBonusCourseExist,
    }),
    ...(queryData.isSecondBonusCourseExist !== undefined && {
      isSecondBonusCourseExist: queryData.isSecondBonusCourseExist,
    }),
    ...(queryData.isThirdBonusCourseExist !== undefined && {
      isThirdBonusCourseExist: queryData.isThirdBonusCourseExist,
    }),
    ...(queryData.isFourthBonusCourseExist !== undefined && {
      isFourthBonusCourseExist: queryData.isFourthBonusCourseExist,
    }),
  };

  return {
    isLoginUser: true,
    myUserInfo: {
      ...queryData,
      token: queryData.token || '',
    },
    isLoading: false,
    data,
  } as GetMyInfoState;
};

import type { RecommendedUserData } from '@/apis/get-recommended-users';
import type { JamboRequest } from '@/types/JamboApi';

type GetFavoriteAnotherUsersRequest = JamboRequest & {
  readonly api: 'get_favorite_another_users';
  readonly token: string;
  readonly user_id: string;
  readonly req_user_id: string; // 修正: request_user_id → req_user_id
  readonly gender: number;
};

export type GetFavoriteAnotherUsersResponseData = RecommendedUserData[];

export const getFavoriteAnotherUsersRequest = (
  token: string,
  userId: string,
  reqUserId: string,
  gender: number = 0, // 0 = 女性（プロフィールユーザーの性別、Utageでは0=女性、1=男性）
): GetFavoriteAnotherUsersRequest => ({
  api: 'get_favorite_another_users',
  token,
  user_id: userId,
  req_user_id: reqUserId,
  gender,
});

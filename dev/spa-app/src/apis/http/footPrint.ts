import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';

/**
 * 足あとリスト取得APIのリクエストbody作成
 */
export const createFootprintListRequestBody = (
  token: string,
  skip: number = 0,
  take: number = 50,
) => {
  return {
    api: JAMBO_API_ROUTE.GET_FOOT_PRINT_LIST,
    token,
    skip,
    take,
  };
};

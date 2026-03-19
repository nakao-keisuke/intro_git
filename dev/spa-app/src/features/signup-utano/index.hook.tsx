import type { GetServerSideProps } from 'next';
import type { ResponseData } from '@/types/NextApi';
import { getUserToken } from '@/utils/cookie';

export const getServerSideProps: GetServerSideProps<ResponseData<{}>> = async (
  context,
) => {
  const userAgent = context.req.headers['user-agent'];
  if (!userAgent) {
    return { props: { type: 'error', message: '不正なリクエストです' } };
  }

  const token = await getUserToken(context.req);
  if (token)
    return { props: { type: 'error', message: 'ユーザー登録済みです' } };
  return {
    props: {},
  };
};

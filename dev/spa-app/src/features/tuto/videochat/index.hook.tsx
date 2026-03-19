import type { GetServerSideProps } from 'next';
import { checkIsRegistered } from '@/utils/cookie';

export const getServerSideProps: GetServerSideProps<{
  isRegistered: boolean;
}> = async (context) => {
  const isRegistered = await checkIsRegistered(context.req);
  return {
    props: { isRegistered },
  };
};

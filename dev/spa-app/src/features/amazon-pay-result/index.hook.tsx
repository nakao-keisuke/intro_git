import type { GetServerSideProps } from 'next';
import { getAmazonPayClient, postRequestToTitania } from '@/libs/amazonPay';
import { AmazonPaymentStatus } from '@/types/PaymentStatus';
import { getUserId } from '@/utils/cookie';

export const getServerSideProps: GetServerSideProps<{
  isError: boolean;
  message: string;
}> = async (context) => {
  const { amazonCheckoutSessionId } = context.query;
  let isError: boolean = false;
  let message: string = '';
  const userId = await getUserId(context.req);

  // amazonCheckoutSessionId が渡されていない場合はエラー表示
  if (!amazonCheckoutSessionId || typeof amazonCheckoutSessionId !== 'string') {
    isError = true;
    message = 'sessionIdが不正です。';
  }

  const response = await postRequestToTitania('/amazonPay/getLatestOrder', {
    user_id: userId,
    order_id: amazonCheckoutSessionId,
  });

  const moneyStoredInDB = response.data.data.AmazonPayStatus.money;
  const orderId = response.data.data.AmazonPayStatus.order_id;

  const client = await getAmazonPayClient();

  try {
    // Amazon Pay の決済状態を取得
    const checkoutSession = await client.getCheckoutSession(
      amazonCheckoutSessionId,
    );

    const amount = checkoutSession.data.paymentDetails.chargeAmount.amount;
    const state = checkoutSession.data.statusDetails.state;

    if (state !== 'Open') throw new Error('決済が開始されていません。');

    // AmazonPayの金額とあらかじめDBに保存してある金額が一致しなければ例外を投げる
    if (amount !== moneyStoredInDB) throw new Error('注文情報が不正です。');

    const response = await postRequestToTitania(
      '/amazonPay/updateOrderStatus',
      {
        order_id: orderId,
        status: AmazonPaymentStatus.Open,
      },
    );

    if (response.status === 200) {
      const _response = await client.completeCheckoutSession(
        amazonCheckoutSessionId,
        {
          chargeAmount: {
            amount: moneyStoredInDB,
            currencyCode: 'JPY',
          },
        },
      );
    }
  } catch (e: any) {
    console.log('error', e);
    isError = true;
    message = e.message;
  }

  return {
    props: {
      isError: isError,
      message: message,
      amazonCheckoutSessionId: amazonCheckoutSessionId,
    },
  };
};

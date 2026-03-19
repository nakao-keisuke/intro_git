import type { GetServerSideProps } from 'next';
import { getAmazonPayClient, postRequestToTitania } from '@/libs/amazonPay';
import { getCurrentTime } from '@/libs/date';
import { AmazonPaymentStatus } from '@/types/PaymentStatus';
import { getUserId } from '@/utils/cookie';

export const getServerSideProps: GetServerSideProps<{
  signature?: string;
  payload?: any;
}> = async (context) => {
  const amount = context.query.sid;

  const userId = await getUserId(context.req);
  const currentTime = getCurrentTime('yyyyMMddHHmmss');
  const client = await getAmazonPayClient();

  // Titaniaに注文情報を保存　→　決済確定前に注文の情報を照合するために利用
  const response = await postRequestToTitania('/amazonPay/createOrder', {
    user_id: userId,
    money: amount,
    order_id: `${userId}-${currentTime}`,
    status: AmazonPaymentStatus.Pending,
  });

  const responseStatus = response.status;
  const responseData = response.data.data.AmazonPayStatus;

  if (responseStatus !== 200) {
    throw new Error('決済情報の取得に失敗しました。');
  }

  const payload = {
    webCheckoutDetails: {
      checkoutResultReturnUrl: 'https://utage-web.com/amazon-pay-result',
      // checkoutResultReturnUrl: 'https://localhost:3000/amazon-pay-result',
      checkoutMode: 'ProcessOrder',
    },
    storeId: 'amzn1.application-oa2-client.8de4dfd0ed1c463695ec89317c083bd2',
    scopes: ['name'],
    chargePermissionType: 'OneTime',
    merchantMetadata: {
      merchantReferenceId: responseData.order_id,
      merchantStoreName: 'Utage',
      noteToBuyer:
        'ご購入ありがとうございます。すぐに反映されます。すぐにポイントが反映されない場合は、運営にお問い合わせください',
    },
    paymentDetails: {
      paymentIntent: 'AuthorizeWithCapture',
      canHandlePendingAuthorization: false,
      chargeAmount: {
        amount: amount,
        currencyCode: 'JPY',
      },
      presentmentCurrency: 'JPY',
      extendExpiration: false,
    },
  };

  const signature = await client.generateButtonSignature(payload);

  return {
    props: {
      signature,
      payload,
    },
  };
};

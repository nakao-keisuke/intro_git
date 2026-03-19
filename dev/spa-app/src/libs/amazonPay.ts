import path from 'node:path';
import axios from 'axios';

let client: any | null = null;

export const getAmazonPayClient = async (): Promise<any> => {
  if (!client) {
    try {
      const _fs =
        typeof window === 'undefined' ? require('node:fs/promises') : null;
      const _publicDirectory = path.join(process.cwd(), 'public');

      const config = {
        publicKeyId: import.meta.env.VITE_AMAZON_PAY_PUBLIC_KEY,
        privateKey: import.meta.env.AMAZON_PAY_PRIVATE_KEY,
        // publicKeyId: 'SANDBOX-AEPCS4ABFSK2UYF73MAAK4HX',
        // privateKey: await fs.readFile(
        //   publicDirectory +
        //     '/test/AmazonPay_SANDBOX-AEPCS4ABFSK2UYF73MAAK4HX.pem'
        // ),
        region: 'jp',
        // sandbox: true,
        sandbox: false,
      };

      const {
        WebStoreClient,
      } = require('@amazonpay/amazon-pay-api-sdk-nodejs');
      client = new WebStoreClient(config);
    } catch (e) {
      // ブラウザで呼ばれちゃったときのハンドリングやから処理なしで問題なし
      console.log('error', e);
    }
  }

  return client;
};

/**
 * リクエストをTitaniaに送信する
 */
export const postRequestToTitania = async (url: string, params: any) => {
  const response = await axios.post(
    (import.meta.env.TITANIA_URL as string) + url,
    params,
    {
      timeout: 10000,
    },
  );

  return response;
};

/**
 * 決済を確定する
 *
 * @async
 * @param {string} checkoutSessionId
 * @returns {unknown}
 */
export const finalizePayment = async (checkoutSessionId: string) => {
  const response = await axios.post('/api/amazon-pay-finalize-payment', {
    checkoutSessionId: checkoutSessionId,
  });

  if (response.status !== 200) return false;

  return response.data.success;
};

/**
 * 決済をキャンセルする
 *
 * @param {string} checkoutSessionId
 */
export const cancelPayment = (checkoutSessionId: string) => {
  axios.post('/api/amazon-pay-cancel-payment', {
    checkoutSessionId: checkoutSessionId,
  });
};

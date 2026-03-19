import axios from 'axios';
import { EventProvider } from '@/constants/eventProviders';
import { event } from '@/constants/ga4Event';

/**
 * Googleイベントのパラメーターインターフェイス
 */
export type GoogleEventParams = {
  [key: string]: string | number | boolean;
};

/**
 * Googleイベントのリクエストインターフェイス
 */
export type GoogleEventRequest = {
  client_id: string;
  events: Array<{
    name: string;
    params?: GoogleEventParams;
  }>;
};

/**
 * Google Analytics 4にイベントを送信する
 * @param clientId GA4のクライアントID
 * @param eventName 送信するイベント名（GA4推奨イベント名を使用することを推奨）
 * @param eventParams イベントに含めるパラメータ
 * @returns 送信結果
 */
export const sendGoogleEvent = async ({
  clientId,
  eventName,
  eventParams,
}: {
  clientId: string;
  eventName: keyof typeof event;
  eventParams?: GoogleEventParams;
}): Promise<boolean> => {
  try {
    const measurementId = import.meta.env.VITE_GOOGLE_MEASURE_ID;
    const apiSecret = import.meta.env.VITE_GA_API_SECRET;

    if (!measurementId || !apiSecret) {
      console.error('Google Analytics設定が不足しています');
      return false;
    }

    // GA4リクエストペイロードの作成
    const payload: GoogleEventRequest = {
      client_id: clientId,
      events: [
        {
          name: event[eventName][EventProvider.GA4], // イベント名の値を取得
          params: {
            ...eventParams,
            // Realtimeレポートに表示されるために必要
            engagement_time_msec: eventParams?.engagement_time_msec || 1,
          },
        },
      ],
    };

    // GA4 Measurement Protocol APIへの送信
    const response = await axios.post(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    // 成功: ステータスコード200または204
    return response.status === 200 || response.status === 204;
  } catch (error) {
    console.error('Google Analytics送信エラー:', error);
    return false;
  }
};

/**
 * クライアントIDを取得する
 * GA4の初期化が完了している必要がある
 */
export const getGoogleClientId = (): Promise<string | null> => {
  if (typeof window === 'undefined' || !window.gtag) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const measurementId = import.meta.env.VITE_GOOGLE_MEASURE_ID || '';
    const timer = setTimeout(() => resolve(null), 1000);

    try {
      window.gtag('get', measurementId, 'client_id', (clientId: string) => {
        clearTimeout(timer);
        resolve(clientId || null);
      });
    } catch (error) {
      clearTimeout(timer);
      console.error('クライアントID取得エラー:', error);
      resolve(null);
    }
  });
};

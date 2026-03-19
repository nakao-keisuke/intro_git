/**
 * Paidyの設定
 * @property {string} api_key - PaidyAPIキー
 * @property {function} closed - 支払いが完了した際のコールバック
 */
export type PaidyConfig = {
  api_key: string;
  closed?: (callbackData: PaidyCallbackData) => void;
};

/**
 * Paidyのコールバックデータ
 * @property {string} id - 支払いID
 * @property {number} amount - 支払い金額
 * @property {string} currency - 通貨
 * @property {string} created_at - 作成日時
 * @property {string} status - 支払いステータス
 */
export type PaidyCallbackData = {
  id: string;
  amount: number;
  currency: string;
  created_at: string;
  status: string;
};

/**
 * Paidyの支払い情報
 * @property {number} amount - 支払い金額
 * @property {string} currency - 通貨
 * @property {object} order - 注文情報
 * @property {object[]} order.items - 商品情報
 * @property {number} order.items[].quantity - 数量
 * @property {number} order.items[].unit_price - 単価
 */
export type PaidyPayload = {
  amount: number;
  currency: 'JPY';
  buyer: {
    name1: string;
  };
  buyer_data: {
    user_id: string;
  };
  order: {
    items: {
      title: string;
      quantity: number;
      unit_price: number;
    }[];
  };
};

/**
 * Paidyの初期化
 * @param closedCallback - 支払いが完了した際のコールバック
 * @returns {object} - Paidyの設定
 */
export const initializePaidy = (
  closedCallback: (callbackData: PaidyCallbackData) => void,
) => {
  const apiKey = import.meta.env.VITE_PAIDY_PUBLIC_API_KEY;
  if (!apiKey) {
    throw new Error('Paidy API key is not set.');
  }

  const config: PaidyConfig = {
    api_key: apiKey,
    closed: closedCallback,
  };

  if (window.Paidy) {
    return window.Paidy.configure(config);
  } else {
    throw new Error('Paidy script has not been loaded.');
  }
};

/**
 * globalにPaidyの型定義を追加
 * @param {object} payload - 支払い情報
 * @returns {void}
 */
declare global {
  interface Window {
    Paidy?: {
      configure: (config: PaidyConfig) => {
        launch: (payload: PaidyPayload) => void;
      };
    };
  }
}

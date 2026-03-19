/**
 * カード決済フォームの型定義
 */
export type Card = {
  attach: (selectorOrElement: string | HTMLElement) => Promise<void>;
  tokenize: () => Promise<TokenResult>;
  destroy: () => Promise<void>;
};

/**
 * カード決済フォームのトークン化結果
 */
type TokenResult = {
  errors: {
    field: string;
    message: string;
    type: string;
  }[];
  status: string;
  token: string;
};

/**
 * カード決済フォームのオプション
 */
type CardOptions = {
  postalCode?: string | undefined;
};

/**
 * globalにSquareの型定義を追加
 * @param {object} payload - 支払い情報
 * @returns {void}
 */
declare global {
  interface Window {
    Square?: {
      payments: (
        appId: string,
        locationId: string,
      ) => {
        card: () => Promise<Card>;
      };
    };
  }
}

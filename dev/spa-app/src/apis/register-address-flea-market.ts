import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

export interface RegisterAddressFleaMarketRequest extends JamboRequest {
  readonly api: 'register_address_flea_market';
  readonly token: string;
  readonly user_id: string;
  readonly last_name: string;
  readonly first_name: string;
  readonly postal_code: string;
  readonly prefecture: string;
  readonly city: string;
  readonly address_line1: string;
  readonly address_line2?: string;
  readonly phone_number: string;
  readonly is_default?: boolean;
}

export interface RegisterAddressFleaMarketResponse extends JamboResponseData {
  // レスポンスに特別なデータがない場合は空
}

export const registerAddressFleaMarketRequest = (
  token: string,
  data: {
    user_id: string;
    last_name: string;
    first_name: string;
    postal_code: string;
    prefecture: string;
    city: string;
    address_line1: string;
    address_line2?: string;
    phone_number: string;
    is_default?: boolean;
  },
): RegisterAddressFleaMarketRequest => {
  return {
    api: 'register_address_flea_market',
    token,
    ...data,
  };
};

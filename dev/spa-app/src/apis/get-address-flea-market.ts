import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

export interface GetAddressFleaMarketRequest extends JamboRequest {
  readonly api: 'get_address_flea_market';
  readonly token: string;
  readonly user_id: string;
}

export interface GetAddressFleaMarketResponseData extends JamboResponseData {
  readonly address_id: string;
  readonly user_id: string;
  readonly last_name: string;
  readonly first_name: string;
  readonly postal_code: string;
  readonly prefecture: string;
  readonly city: string;
  readonly address_line1: string;
  readonly address_line2?: string;
  readonly phone_number: string;
  readonly is_default: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

export const getAddressFleaMarketRequest = (
  token: string,
  userId: string,
): GetAddressFleaMarketRequest => {
  return {
    api: 'get_address_flea_market',
    token,
    user_id: userId,
  };
};

export type QuickChargeRequestData = {
  token: string;
  amount: number;
  point: number;
};

export type QuickChargeResponseData = {
  type: 'success' | 'error';
  payment_intent_id?: string;
  status?: string;
  message?: string;
  point?: number;
  notification?: object;
};

export const quickChargeRequest = async (
  data: QuickChargeRequestData,
): Promise<QuickChargeResponseData> => {
  // 開発環境ではlocalhost、本番環境では環境変数を使用
  const alvionUrl =
    import.meta.env.NODE_ENV === 'development'
      ? 'https://localhost:3001'
      : import.meta.env.VITE_ALVION_URL;

  const fullUrl = `${alvionUrl}/api/stripe/quick-charge`;

  const response = await fetch(fullUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Quick charge request failed');
  }

  return response.json();
};

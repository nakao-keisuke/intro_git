// 郵便番号から住所を取得するユーティリティ

export interface PostalCodeResponse {
  zipcode: string;
  prefcode: string;
  prefecture: string;
  city: string;
  town: string;
}

/**
 * 郵便番号から住所情報を取得
 * @param postalCode - ハイフンなしの7桁の郵便番号
 * @returns 住所情報
 */
export async function fetchAddressFromPostalCode(
  postalCode: string,
): Promise<PostalCodeResponse | null> {
  // ハイフンを除去して数字のみにする
  const cleanedPostalCode = postalCode.replace(/[^0-9]/g, '');

  // 7桁でない場合はnullを返す
  if (cleanedPostalCode.length !== 7) {
    return null;
  }

  try {
    // 郵便番号検索API（無料で使える日本郵便番号API）
    const apiBaseUrl =
      import.meta.env.VITE_ZIPCLOUD_API_BASE_URL ||
      'https://zipcloud.ibsnet.co.jp/api/search';
    if (!apiBaseUrl.startsWith('https://')) {
      throw new Error('API endpoint must use HTTPS');
    }
    const response = await fetch(`${apiBaseUrl}?zipcode=${cleanedPostalCode}`);

    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }

    const data = await response.json();

    if (data.status !== 200 || !data.results || data.results.length === 0) {
      return null;
    }

    const result = data.results[0];

    return {
      zipcode: result.zipcode,
      prefcode: result.prefcode,
      prefecture: result.address1,
      city: result.address2,
      town: result.address3,
    };
  } catch (error) {
    console.error('Error fetching address from postal code:', error);
    return null;
  }
}

/**
 * 郵便番号を3-4形式にフォーマット
 * @param value - 入力値
 * @returns フォーマットされた郵便番号
 */
export function formatPostalCode(value: string): string {
  // 数字のみを抽出
  const numbers = value.replace(/[^0-9]/g, '');

  // 3桁-4桁の形式にフォーマット
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}`;
  } else {
    // 7桁を超える場合は最初の7桁のみを使用
    const truncated = numbers.slice(0, 7);
    return `${truncated.slice(0, 3)}-${truncated.slice(3, 7)}`;
  }
}

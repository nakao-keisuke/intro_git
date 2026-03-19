/**
 * SHA-256ハッシュ化関数（内部使用）
 * @param value ハッシュ化する文字列
 * @returns SHA-256ハッシュ値（小文字の16進数文字列）
 */
async function sha256Hash(value: string): Promise<string> {
  if (!value) return '';

  // 文字列を小文字に変換し、前後の空白を削除
  const normalized = value.toLowerCase().trim();

  // TextEncoderでUTF-8バイト配列に変換
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);

  // Web Crypto APIでSHA-256ハッシュを生成
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // ArrayBufferを16進数文字列に変換
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return hashHex;
}

/**
 * TikTok Pixel にユーザー識別情報を送信
 * エラーが発生してもユーザー登録フローを中断しない
 * @param userId ユーザーID
 */
async function identifyTikTokUser(userId: string): Promise<void> {
  try {
    if (typeof window === 'undefined' || !window.ttq) {
      console.warn('TikTok Pixel is not loaded');
      return;
    }

    if (!userId) {
      console.warn('User ID is required for TikTok identify');
      return;
    }

    // ユーザーIDをハッシュ化
    const hashedUserId = await sha256Hash(userId);

    // identifyイベントを送信
    window.ttq.identify({
      external_id: hashedUserId,
    });
  } catch (error) {
    console.error('Failed to identify TikTok user:', error);
  }
}

/**
 * TikTok Pixel の CompleteRegistration イベントを送信
 * ユーザーIDが指定されている場合は、識別情報も送信する
 * エラーが発生してもユーザー登録フローを中断しない
 * @param userId ユーザーID（任意）
 */
export async function trackTikTokCompleteRegistration(
  userId?: string,
): Promise<void> {
  try {
    if (typeof window === 'undefined' || !window.ttq) {
      console.warn('TikTok Pixel is not loaded');
      return;
    }

    // ユーザーIDがある場合は識別情報を送信
    if (userId) {
      await identifyTikTokUser(userId);
    }

    // CompleteRegistrationイベントを送信
    window.ttq.track('CompleteRegistration');
  } catch (error) {
    console.error('Failed to send TikTok CompleteRegistration event:', error);
  }
}

/**
 * TikTok Pixel の Purchase イベントを送信
 * ユーザーIDが指定されている場合は、識別情報も送信する
 * エラーが発生しても決済フローを中断しない
 * @param userId ユーザーID（任意、未指定の場合はidentifyをスキップ）
 * @param value 購入金額（必須）
 * @param currency 通貨コード（必須、例: "JPY"）
 */
export async function trackTikTokPurchase(
  userId: string | undefined,
  value: number,
  currency: string,
): Promise<void> {
  try {
    if (typeof window === 'undefined' || !window.ttq) {
      console.warn('TikTok Pixel is not loaded');
      return;
    }

    // ユーザーIDがある場合は識別情報を送信
    if (userId) {
      await identifyTikTokUser(userId);
    }

    // Purchaseイベントを送信（必須パラメータのみ）
    window.ttq.track('Purchase', {
      value,
      currency,
    });
  } catch (error) {
    console.error('Failed to send TikTok Purchase event:', error);
  }
}

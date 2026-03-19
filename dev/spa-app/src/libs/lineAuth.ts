export type TokenSet = {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: 'Bearer';
};

export type BotPromptType = 'normal' | 'aggressive';

export type LineFriendshipStatus = {
  friendFlag: boolean;
};

/**
 * LINEログイン用の認可URLを生成
 */
export function generateLineAuthUrl(
  botPrompt: BotPromptType = 'normal',
  nextUrl: string = '/mission/onboarding/add-line-friend',
): string {
  const url = new URL('https://access.line.me/oauth2/v2.1/authorize');

  url.searchParams.set('response_type', 'code');
  url.searchParams.set(
    'client_id',
    import.meta.env.VITE_LINE_LOGIN_CHANNEL_ID!,
  );
  url.searchParams.set(
    'redirect_uri',
    import.meta.env.VITE_LINE_REDIRECT_URI!,
  );
  // state はLINE側でURLエンコードされるため事前に重ねてエンコードしない
  url.searchParams.set('state', nextUrl);
  // 友だち状態確認に必要なスコープを含める
  url.searchParams.set('scope', 'openid profile bot.friendship');
  url.searchParams.set('bot_prompt', botPrompt);
  // 既存同意があっても同意画面を表示し、友だち追加案内を確実に出す
  url.searchParams.set('prompt', 'consent');
  return url.toString();
}

/**
 * 認可コードをアクセストークンに交換
 */
export async function exchangeCodeForToken(code: string): Promise<TokenSet> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: import.meta.env.VITE_LINE_REDIRECT_URI!,
    client_id: import.meta.env.VITE_LINE_LOGIN_CHANNEL_ID!,
    client_secret: import.meta.env.LINE_CHANNEL_SECRET!,
  });

  const response = await fetch('https://api.line.me/oauth2/v2.1/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${errorText}`);
  }

  return (await response.json()) as TokenSet;
}

/**
 * LINE Friendship Status APIを使用して友だち状態を確認
 */
export async function checkLineFriendshipStatus(
  accessToken: string,
): Promise<LineFriendshipStatus> {
  const response = await fetch('https://api.line.me/friendship/v1/status', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Friendship status check failed: ${errorText}`);
  }

  return (await response.json()) as LineFriendshipStatus;
}

/**
 * アクセストークンとIDトークンの有効性を検証
 */
export async function validateAccessToken(
  accessToken: string,
  idToken?: string,
): Promise<boolean> {
  try {
    const requestBody: Record<string, string> = {
      access_token: accessToken,
    };

    // id_tokenがある場合は、id_token検証用のパラメータを設定
    if (idToken) {
      requestBody.id_token = idToken;
      requestBody.client_id = import.meta.env.VITE_LINE_LOGIN_CHANNEL_ID!; // チャネルIDを追加
    }

    const response = await fetch('https://api.line.me/oauth2/v2.1/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(requestBody).toString(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token validation error:', {
        status: response.status,
        errorText,
      });
    }

    return response.ok;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

/**
 * ID Tokenからline_idを取得
 */
export function extractLineIdFromIdToken(idToken: string): string | null {
  try {
    // JWT構造: header.payload.signature
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // payload部分をBase64デコード
    const payloadPart = parts[1];
    if (!payloadPart) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadPart, 'base64').toString());

    // subフィールドがLINE user IDに相当
    return payload.sub || null;
  } catch (error) {
    console.error('Failed to extract line_id from id_token:', error);
    return null;
  }
}

/**
 * Cookieの設定オプション
 */
export function getCookieOptions(maxAge: number) {
  // ngrok環境の検出
  const isNgrok =
    import.meta.env.VITE_LINE_REDIRECT_URI?.includes('ngrok.app') || false;
  const isProduction = import.meta.env.NODE_ENV === 'production';

  // HTTPS環境（本番またはngrok）ではsecure: trueを設定
  const shouldUseSecure = isProduction || isNgrok;

  return {
    httpOnly: true,
    secure: shouldUseSecure,
    sameSite: 'lax' as const,
    maxAge, // seconds
    path: '/',
  };
}

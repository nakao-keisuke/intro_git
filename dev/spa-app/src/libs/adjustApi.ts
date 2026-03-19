import axios from 'axios';
import type { AdjustEventRequest, AdjustEventResponse } from '@/apis/adjust';
import { ADJUST_UTAGE_APP_TOKEN } from '@/constants/adjustEventTokens';

/**
 * Adjustにイベントを送信する
 *
 * @param params イベント送信に必要なパラメータ
 * @returns 送信結果
 */
export const sendAdjustEventFromServer = async (
  params: AdjustEventRequest,
): Promise<AdjustEventResponse> => {
  const startTime = Date.now();
  const logPrefix = '[Adjust S2S API]';

  console.log(`${logPrefix} === 送信開始 ===`);
  console.log(`${logPrefix} タイムスタンプ:`, new Date().toISOString());
  console.log(`${logPrefix} NODE_ENV:`, import.meta.env.NODE_ENV);
  console.log(
    `${logPrefix} 環境:`,
    import.meta.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  );

  try {
    const { eventToken, webUUID } = params;

    // 入力パラメータの詳細ログ
    console.log(`${logPrefix} 受信パラメータ:`);
    console.log(`${logPrefix}   eventToken:`, eventToken);
    console.log(`${logPrefix}   webUUID:`, webUUID);
    console.log(`${logPrefix}   webUUID長さ:`, webUUID?.length);
    console.log(
      `${logPrefix}   webUUID形式チェック:`,
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        webUUID || '',
      ),
    );

    // 必須パラメータのバリデーション
    if (!eventToken || !webUUID) {
      const errorMsg =
        '必須パラメータが不足しています。eventToken, webUUIDは必須です。';
      console.error(`${logPrefix} パラメータエラー:`, errorMsg);
      console.log(`${logPrefix} === 送信終了（パラメータエラー） ===`);
      return {
        success: false,
        message: errorMsg,
      };
    }

    // Adjustへのリクエストパラメータ構築
    const requestParams: Record<string, string> = {
      s2s: '1', // サーバー間通信を示す固定値
      event_token: eventToken,
      app_token: ADJUST_UTAGE_APP_TOKEN,
      web_uuid: webUUID,
      environment:
        import.meta.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    };

    // リクエストパラメータの詳細ログ
    console.log(`${logPrefix} 送信パラメータ:`);
    console.log(`${logPrefix}   s2s:`, requestParams.s2s);
    console.log(`${logPrefix}   event_token:`, requestParams.event_token);
    console.log(`${logPrefix}   app_token:`, requestParams.app_token);
    console.log(`${logPrefix}   web_uuid:`, requestParams.web_uuid);
    console.log(`${logPrefix}   environment:`, requestParams.environment);

    // Adjustへリクエスト送信
    const adjustUrl = 'https://s2s.adjust.com/event';
    console.log(`${logPrefix} リクエスト送信開始:`, adjustUrl);

    const response = await axios.get(adjustUrl, { params: requestParams });

    const duration = Date.now() - startTime;

    // 成功時の詳細ログ
    console.log(`${logPrefix} === 送信成功 ===`);
    console.log(`${logPrefix} ステータス:`, response.status);
    console.log(`${logPrefix} ステータステキスト:`, response.statusText);
    console.log(
      `${logPrefix} レスポンスヘッダー:`,
      JSON.stringify(response.headers, null, 2),
    );
    console.log(
      `${logPrefix} レスポンスデータ:`,
      JSON.stringify(response.data, null, 2),
    );
    console.log(`${logPrefix} 処理時間:`, `${duration}ms`);
    console.log(`${logPrefix} 完了時刻:`, new Date().toISOString());

    return {
      success: response.status === 200,
      message: response.data,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;

    // エラー時の詳細ログ
    console.error(`${logPrefix} === 送信エラー ===`);
    console.error(`${logPrefix} 処理時間:`, `${duration}ms`);
    console.error(`${logPrefix} エラー時刻:`, new Date().toISOString());

    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      console.error(`${logPrefix} HTTPエラー詳細:`);
      console.error(`${logPrefix}   ステータス:`, status);
      console.error(
        `${logPrefix}   ステータステキスト:`,
        error.response.statusText,
      );
      console.error(
        `${logPrefix}   レスポンスヘッダー:`,
        JSON.stringify(error.response.headers, null, 2),
      );
      console.error(
        `${logPrefix}   レスポンスデータ:`,
        JSON.stringify(errorData, null, 2),
      );
      console.error(`${logPrefix}   リクエストURL:`, error.config?.url);
      console.error(
        `${logPrefix}   リクエストパラメータ:`,
        JSON.stringify(error.config?.params, null, 2),
      );
      console.error(
        `${logPrefix}   リクエストヘッダー:`,
        JSON.stringify(error.config?.headers, null, 2),
      );

      // 404エラー（Device not found）の場合
      if (status === 404) {
        console.error(`${logPrefix} 404エラー分析:`);
        console.error(
          `${logPrefix}   原因: デバイス（web_uuid）がAdjustサーバーに認識されていません`,
        );
        console.error(
          `${logPrefix}   web_uuid:`,
          error.config?.params?.web_uuid,
        );
        console.error(
          `${logPrefix}   app_token:`,
          error.config?.params?.app_token,
        );
        console.error(
          `${logPrefix}   environment:`,
          error.config?.params?.environment,
        );
        console.error(`${logPrefix}   対策候補:`);
        console.error(
          `${logPrefix}     1. Adjust Web SDKの初期化が完了していることを確認`,
        );
        console.error(
          `${logPrefix}     2. フロントエンドでAdjustトラッキングが正常に動作していることを確認`,
        );
        console.error(
          `${logPrefix}     3. AdjustダッシュボードでS2S設定を確認`,
        );
      }

      // 重複イベントエラーの場合は成功として扱う
      if (
        status === 400 &&
        errorData?.error?.includes('earlier unique event tracked')
      ) {
        console.log(`${logPrefix} 重複イベント検出:`);
        console.log(
          `${logPrefix}   既に送信済みのイベントのため、成功として扱います`,
        );
        console.log(`${logPrefix}   元のエラー:`, errorData.error);
        console.log(`${logPrefix} === 送信終了（重複により成功扱い） ===`);

        return {
          success: true,
          message: 'Event already tracked (duplicate)',
        };
      }

      console.log(`${logPrefix} === 送信終了（HTTPエラー） ===`);
      return {
        success: false,
        message: errorData?.error || error.response.statusText,
      };
    }

    // ネットワークエラーや他のエラーの場合
    console.error(`${logPrefix} 非HTTPエラー:`);
    console.error(`${logPrefix}   エラータイプ:`, error.constructor.name);
    console.error(`${logPrefix}   エラーメッセージ:`, error.message);
    console.error(`${logPrefix}   エラーコード:`, error.code);
    console.error(`${logPrefix}   エラースタック:`, error.stack);

    console.log(`${logPrefix} === 送信終了（非HTTPエラー） ===`);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : '不明なエラーが発生しました',
    };
  }
};

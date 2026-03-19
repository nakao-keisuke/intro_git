/**
 * サーバーサイド用ASP成果計上ユーティリティ関数
 */

import {
  type AspCvType,
  type AspMatchResult,
  AspProvider,
  getAspConfigWithParams,
} from '@/constants/aspConfig';

/**
 * サーバーサイドでASP成果計上を実行する
 * @param aspParams ASPパラメータオブジェクト
 * @param uid ユニークなユーザーデータ（手動承認の場合必須）
 * @param conversionType 成果計上タイプ（'register': 新規登録時、'message': メッセージ送信時）
 * @param utmParams UTMパラメータ（utmCriteriaマッチングに使用）
 * @returns 成果計上が実行されたかどうか
 */
export async function sendAspConversionServer(
  aspParams: Record<string, string>,
  uid?: string,
  conversionType?: AspCvType,
  utmParams?: Record<string, string>,
): Promise<boolean> {
  try {
    const aspMatch: AspMatchResult | null = getAspConfigWithParams(
      aspParams,
      utmParams,
    );
    if (!aspMatch) {
      console.log(
        'ASP conversion: No matching ASP configuration found or missing required parameters',
      );
      return false;
    }

    const { config, params } = aspMatch;

    // cvTypeとconversionTypeが一致する場合のみ成果計上を実行
    if (conversionType && config.cvType !== conversionType) {
      console.log(
        `ASP conversion: Skipping ${config.name} (cvType: ${config.cvType}, requested: ${conversionType})`,
      );
      return false;
    }

    // 成果計上用URLを構築
    const urlParams = new URLSearchParams(params);

    // キャナルの場合のみ uid パラメーターを追加
    if (config.requiresUid && uid && config.provider === AspProvider.CANAL) {
      urlParams.set('uid', uid);
    }

    const conversionUrl = `${config.conversionUrl}?${urlParams.toString()}`;

    // HTTPリクエストによる成果通知
    try {
      const response = await fetch(conversionUrl, {
        method: 'GET',
      });

      if (response.ok) {
        console.log(
          `ASP conversion sent successfully (${config.name}):`,
          conversionUrl,
        );
        return true;
      } else {
        console.error(
          `ASP conversion failed with status (${config.name}):`,
          response.status,
        );
        return false;
      }
    } catch (fetchError) {
      console.error(
        `ASP conversion network error (${config.name}):`,
        fetchError,
      );
      return false;
    }
  } catch (error) {
    console.error('ASP conversion error:', error);
    return false;
  }
}

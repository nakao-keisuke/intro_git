/**
 * ASP（アフィリエイト・サービス・プロバイダー）設定
 */

export enum AspProvider {
  CANAL = 'canal',
  MATCHING_AFFI = 'matching-affi',
}

export enum AspCampaign {
  CANAL_MESSAGE_251031 = 'canal-message-251031',
  CANAL_URBANE_1002 = 'urbane_1002',
  CANAL_URBANE_MESSAGE_251103 = 'urbane_message_251103',
  CANAL_251002 = '251002',
  CANAL_REGISTER_251111 = 'register_251111',
  CANAL_REGISTER_251118_A = 'register_251118_A',
  CANAL_REGISTER_251118_B = 'register_251118_B',
  CANAL_REGISTER_251118_C = 'register_251118_C',
  CANAL_REGISTER_251118_D = 'register_251118_D',
  MATCHING_AFFI_SIGNUP_250929 = 'signup_affi_2025_09_29',
}

export enum AspCvType {
  REGISTER = 'register',
  MESSAGE = 'message',
}
export interface AspConfig {
  name: string;
  provider: AspProvider;
  requiredParams: string[];
  conversionUrl: string;
  requiresUid?: boolean;
  cvType: AspCvType;
  utmCriteria?: Record<string, string>;
}

export interface AspMatchResult {
  config: AspConfig;
  params: Record<string, string>;
}

/**
 * 対応ASPの設定一覧
 */
export const ASP_CONFIGS: Record<string, AspConfig> = {
  [AspCampaign.CANAL_MESSAGE_251031]: {
    name: 'キャナル（プレミアフィリエイト - メッセージ送信 2024/10/31）',
    provider: AspProvider.CANAL,
    requiredParams: ['afid'],
    conversionUrl: 'https://preaf.jp/r.php',
    requiresUid: true,
    cvType: AspCvType.MESSAGE,
    utmCriteria: { utm_campaign: 'message_251031' },
  },
  [AspCampaign.CANAL_URBANE_1002]: {
    name: 'キャナル（プレミアフィリエイト - Urbane 1002）',
    provider: AspProvider.CANAL,
    requiredParams: ['afid'],
    conversionUrl: 'https://preaf.jp/r.php',
    requiresUid: true,
    cvType: AspCvType.REGISTER,
    utmCriteria: { utm_campaign: 'urbane_1002' },
  },
  [AspCampaign.CANAL_URBANE_MESSAGE_251103]: {
    name: 'キャナル（プレミアフィリエイト - Urbane メッセージ送信 2025/11/03）',
    provider: AspProvider.CANAL,
    requiredParams: ['afid'],
    conversionUrl: 'https://preaf.jp/r.php',
    requiresUid: true,
    cvType: AspCvType.MESSAGE,
    utmCriteria: { utm_campaign: 'urbane_message_251103' },
  },
  [AspCampaign.CANAL_251002]: {
    name: 'キャナル（プレミアフィリエイト - 251002）',
    provider: AspProvider.CANAL,
    requiredParams: ['afid'],
    conversionUrl: 'https://preaf.jp/r.php',
    requiresUid: true,
    cvType: AspCvType.REGISTER,
    utmCriteria: { utm_campaign: '251002' },
  },
  [AspCampaign.CANAL_REGISTER_251111]: {
    name: 'キャナル（プレミアフィリエイト - 会員登録 2025/11/11）',
    provider: AspProvider.CANAL,
    requiredParams: ['afid'],
    conversionUrl: 'https://preaf.jp/r.php',
    requiresUid: true,
    cvType: AspCvType.REGISTER,
    utmCriteria: { utm_campaign: 'register_251111' },
  },
  [AspCampaign.MATCHING_AFFI_SIGNUP_250929]: {
    name: 'マッチングアフィ（アフィリコード - 会員登録 2025/09/29）',
    provider: AspProvider.MATCHING_AFFI,
    requiredParams: ['cid', 'p'],
    conversionUrl: 'https://matching-affi.jp/track.php',
    requiresUid: true,
    cvType: AspCvType.MESSAGE,
    utmCriteria: { utm_campaign: 'signup_affi_2025_09_29' },
  },
  [AspCampaign.CANAL_REGISTER_251118_A]: {
    name: 'キャナル（プレミアフィリエイト - 会員登録 2025/11/18 A）',
    provider: AspProvider.CANAL,
    requiredParams: ['afid'],
    conversionUrl: 'https://preaf.jp/r.php',
    requiresUid: true,
    cvType: AspCvType.REGISTER,
    utmCriteria: { utm_campaign: 'register_251118_A' },
  },
  [AspCampaign.CANAL_REGISTER_251118_B]: {
    name: 'キャナル（プレミアフィリエイト - 会員登録 2025/11/18 B）',
    provider: AspProvider.CANAL,
    requiredParams: ['afid'],
    conversionUrl: 'https://preaf.jp/r.php',
    requiresUid: true,
    cvType: AspCvType.REGISTER,
    utmCriteria: { utm_campaign: 'register_251118_B' },
  },
  [AspCampaign.CANAL_REGISTER_251118_C]: {
    name: 'キャナル（プレミアフィリエイト - 会員登録 2025/11/18 C）',
    provider: AspProvider.CANAL,
    requiredParams: ['afid'],
    conversionUrl: 'https://preaf.jp/r.php',
    requiresUid: true,
    cvType: AspCvType.REGISTER,
    utmCriteria: { utm_campaign: 'register_251118_C' },
  },
  [AspCampaign.CANAL_REGISTER_251118_D]: {
    name: 'キャナル（プレミアフィリエイト - 会員登録 2025/11/18 D）',
    provider: AspProvider.CANAL,
    requiredParams: ['afid'],
    conversionUrl: 'https://preaf.jp/r.php',
    requiresUid: true,
    cvType: AspCvType.REGISTER,
    utmCriteria: { utm_campaign: 'register_251118_D' },
  },
};

/**
 * 有効なASPパラメータ名のリスト
 */
export const ASP_PARAM_NAMES = Object.values(ASP_CONFIGS).flatMap(
  (config) => config.requiredParams,
);

/**
 * 複数のパラメータからASP設定とそのパラメータ値を取得
 * @param aspParams ASPパラメータ（afid, cid, pなど）
 * @param utmParams UTMパラメータ（utm_campaignなど）
 */
export function getAspConfigWithParams(
  aspParams: Record<string, string>,
  utmParams?: Record<string, string>,
): AspMatchResult | null {
  for (const config of Object.values(ASP_CONFIGS)) {
    const matchedParams: Record<string, string> = {};
    let allRequiredParamsPresent = true;

    for (const paramName of config.requiredParams) {
      const paramValue = aspParams[paramName];
      if (paramValue) {
        matchedParams[paramName] = paramValue;
      } else {
        allRequiredParamsPresent = false;
        break;
      }
    }

    if (!allRequiredParamsPresent) {
      continue;
    }

    if (config.utmCriteria) {
      if (!utmParams) {
        continue;
      }

      const isMatched = Object.entries(config.utmCriteria).every(
        ([key, value]) => utmParams[key] === value,
      );

      if (!isMatched) {
        continue;
      }
    }

    return { config, params: matchedParams };
  }

  return null;
}

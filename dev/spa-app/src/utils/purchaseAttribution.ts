import type {
  PurchaseAttribution,
  PurchaseAttributionInput,
} from '@/types/purchaseAttribution';

const STORAGE_KEY = 'purchase_attribution_v1';
const DEFAULT_MAX_AGE_MS = 30 * 60 * 1000; // 30分

/**
 * source_uiからGA4用のシンプルなsource値へのマッピングルール
 *
 * 【拡張方法】
 * 新しいUI導線を追加する場合、ここにパターンとマッピング先を追加してください。
 *
 * パターンは正規表現で指定し、マッチした場合にsource値を返します。
 * 上から順に評価され、最初にマッチしたルールが適用されます。
 */
const SOURCE_MAPPING_RULES: Array<{
  pattern: RegExp;
  mapTo: string;
  description: string;
}> = [
  // ポイント不足モーダル系
  {
    pattern: /^modal\.call_point_shortage\./,
    mapTo: 'call_point_shortage_modal',
    description: '通話用ポイント不足モーダル',
  },
  {
    pattern: /^modal\.message_point_shortage\./,
    mapTo: 'message_point_shortage_modal',
    description: 'メッセージ用ポイント不足モーダル',
  },
  {
    pattern: /^modal\.media_point_shortage\./,
    mapTo: 'media_point_shortage_modal',
    description: 'メディア閲覧用ポイント不足モーダル',
  },
  {
    pattern: /^modal\.stream_point_shortage\./,
    mapTo: 'stream_point_shortage_modal',
    description: '配信視聴用ポイント不足モーダル',
  },
  // 通話中チャージ系（通話タイプ別）
  {
    pattern: /^modal\.in_call_charge\.live\./,
    mapTo: 'live_in_call_charge_modal',
    description: 'ライブ配信/ビデオチャット中チャージモーダル',
  },
  {
    pattern: /^modal\.in_call_charge\.videocall\./,
    mapTo: 'videocall_in_call_charge_modal',
    description: 'ビデオ通話中チャージモーダル',
  },
  {
    pattern: /^modal\.in_call_charge\.voicecall\./,
    mapTo: 'voicecall_in_call_charge_modal',
    description: '音声通話中チャージモーダル',
  },

  // ヘッダー系
  {
    pattern: /^header\./,
    mapTo: 'header_button',
    description: 'ヘッダーのポイント購入ボタン',
  },

  // サイドバー系
  {
    pattern: /^sidebar\./,
    mapTo: 'sidebar',
    description: 'サイドバーのポイント購入ボタン',
  },

  // ページ内ボタン系
  {
    pattern: /^mypage\./,
    mapTo: 'mypage',
    description: 'マイページからの遷移',
  },
  {
    pattern: /^page\.user_profile\./,
    mapTo: 'user_profile_page',
    description: 'ユーザープロフィールページ',
  },
  {
    pattern: /^page\.purchase\./,
    mapTo: 'purchase_page',
    description: '購入ページ',
  },
  {
    pattern: /^page\.message\./,
    mapTo: 'message_page',
    description: 'メッセージページ',
  },

  // バナー系
  {
    pattern: /^banner\./,
    mapTo: 'banner',
    description: 'バナー広告',
  },

  // ギャラリー系
  {
    pattern: /^page\.gallery\./,
    mapTo: 'gallery_page',
    description: 'ギャラリーページ',
  },
];

/**
 * source_uiをGA4用のシンプルなsource値にマッピング
 *
 * @param sourceUi - UI識別子（例: "modal.call_point_shortage.quick_charge"）
 * @returns GA4用のシンプルなsource値（例: "call_point_shortage_modal"）
 *
 * @example
 * mapSourceUiToSimpleSource("modal.call_point_shortage.quick_charge")
 * // => "call_point_shortage_modal"
 *
 * mapSourceUiToSimpleSource("header.point_purchase_button")
 * // => "header_button"
 *
 * mapSourceUiToSimpleSource("unknown.ui.element")
 * // => "unknown.ui.element" (マッチしない場合はそのまま返す)
 */
function mapSourceUiToSimpleSource(sourceUi: string): string {
  for (const rule of SOURCE_MAPPING_RULES) {
    if (rule.pattern.test(sourceUi)) {
      return rule.mapTo;
    }
  }

  // マッチするルールがない場合はsourceUiをそのまま返す
  return sourceUi;
}

/**
 * Purchase Attribution情報を保存
 */
export function setPurchaseAttribution(
  input: PurchaseAttributionInput,
): PurchaseAttribution {
  if (typeof window === 'undefined') {
    return { ...input, ts: Date.now(), nonce: '' };
  }

  const value: PurchaseAttribution = {
    ...input,
    ts: Date.now(),
    nonce: crypto.randomUUID(),
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch (error) {
    console.error('[PurchaseAttribution] Failed to save:', error);
  }

  return value;
}

/**
 * Purchase Attribution情報を取得（TTL管理付き）
 */
export function getPurchaseAttribution(
  maxAgeMs: number = DEFAULT_MAX_AGE_MS,
): PurchaseAttribution | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const value = JSON.parse(raw) as PurchaseAttribution;

    // TTLチェック
    if (Date.now() - value.ts > maxAgeMs) {
      clearPurchaseAttribution();
      return null;
    }

    return value;
  } catch (error) {
    console.error('[PurchaseAttribution] Failed to parse:', error);
    return null;
  }
}

/**
 * Purchase Attribution情報をクリア
 */
export function clearPurchaseAttribution(): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[PurchaseAttribution] Failed to clear:', error);
  }
}

/**
 * GA4のsourceパラメータ用にフォーマット
 * source_uiをシンプルな値にマッピングして返す
 *
 * @param attribution - Purchase Attribution情報
 * @returns GA4用のシンプルなsource値
 *
 * @example
 * const attribution = {
 *   source_ui: "modal.call_point_shortage.quick_charge",
 *   source_path: "/user/123",
 *   flow: "quick_charge",
 *   ts: 1234567890,
 *   nonce: "abc-123"
 * };
 *
 * formatAttributionForSource(attribution)
 * // => "call_point_shortage_modal"
 */
export function formatAttributionForSource(
  attribution: PurchaseAttribution | null,
): string {
  if (!attribution) {
    return 'direct';
  }

  // source_uiをシンプルなsource値にマッピング
  return mapSourceUiToSimpleSource(attribution.source_ui);
}

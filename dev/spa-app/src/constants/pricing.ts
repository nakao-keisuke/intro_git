export const PRICING_INFO = [
  {
    label: 'デイリーボーナス',
    labelKey: 'dailyBonus',
    price: 10,
    unit: 'pt/日 GET',
    unitKey: 'ptPerDayGet',
    showOnPcSidebar: false,
  },
  {
    label: 'プロフィール閲覧',
    labelKey: 'profileView',
    price: '無料',
    unit: '',
    unitKey: '',
    showOnPcSidebar: false,
  },
  {
    label: 'メッセージ受信',
    labelKey: 'messageReceive',
    price: '無料',
    unit: '',
    unitKey: '',
    showOnPcSidebar: false,
  },
  {
    label: '通話リクエスト',
    labelKey: 'callRequest',
    price: '無料',
    unit: '',
    unitKey: '',
    showOnPcSidebar: false,
  },
  {
    label: 'いいね',
    labelKey: 'like',
    price: '無料',
    unit: '',
    unitKey: '',
    showOnPcSidebar: false,
  },
  {
    label: '掲示板閲覧・投稿',
    labelKey: 'bulletinBoardViewPost',
    price: '無料',
    unit: '',
    unitKey: '',
    showOnPcSidebar: false,
  },
  {
    label: '画像開封',
    labelKey: 'imageOpen',
    price: 75,
    unit: 'pt/通',
    unitKey: 'ptPerMessage',
    showOnPcSidebar: true,
  },
  {
    label: '動画開封',
    labelKey: 'videoOpen',
    price: 120,
    unit: 'pt/通',
    unitKey: 'ptPerMessage',
    showOnPcSidebar: true,
  },
  {
    label: 'メッセージ送信',
    labelKey: 'messageSend',
    price: 60,
    unit: 'pt/通',
    unitKey: 'ptPerMessage',
    showOnPcSidebar: true,
  },
  {
    label: '音声通話',
    labelKey: 'voiceCall',
    price: 160,
    unit: 'pt/分',
    unitKey: 'ptPerMinute',
    showOnPcSidebar: true,
  },
  {
    label: 'ビデオ通話',
    labelKey: 'videoCall',
    price: 230,
    unit: 'pt/分',
    unitKey: 'ptPerMinute',
    showOnPcSidebar: true,
  },
  {
    label: '配信中のメッセージ送信',
    labelKey: 'streamMessageSend',
    price: '無料',
    unit: '',
    unitKey: '',
    showOnPcSidebar: false,
  },
  {
    label: 'ビデオチャット視聴',
    labelKey: 'videoChatView',
    price: 200,
    unit: 'pt/分',
    unitKey: 'ptPerMinute',
    showOnPcSidebar: true,
  },
] as const;

export const STREAMING_PRICING_LABELS = [
  '配信中のメッセージ送信',
  'ビデオチャット視聴',
] as const;

export const STREAMING_PRICING_SORT_ORDER = [
  '配信中のメッセージ送信',
  'ビデオチャット視聴',
] as const;

export type PricingInfo = (typeof PRICING_INFO)[number];
export type PricingLabel = PricingInfo['label'];
export type StreamingPricingLabel = (typeof STREAMING_PRICING_LABELS)[number];

export const PRICING_ADDITIONAL_INFO: Partial<Record<PricingLabel, string>> = {
  デイリーボーナス: '★ポイント購入から30日間2倍に！',
  画像開封: '★業界最安値！',
  動画開封: '★業界最安値！',
  ビデオ通話: '★業界最安値！',
};

export const isStreamingPricingLabel = (
  label: PricingLabel,
): label is StreamingPricingLabel =>
  STREAMING_PRICING_LABELS.includes(label as StreamingPricingLabel);

export const isStreamingPricingInfo = (
  info: PricingInfo,
): info is PricingInfo & { label: StreamingPricingLabel } =>
  isStreamingPricingLabel(info.label);

export const PRICING_DISPLAY_NAMES: Record<string, string> = {
  メッセージ送信: 'チャット送信',
  配信中のメッセージ送信: 'ビデオチャット中のチャット送信',
  ビデオチャット視聴: 'ビデオチャット視聴',
  ビデオチャット配信視聴: 'ビデオチャット視聴',
} as const;

const videoCallPricing = PRICING_INFO.find(
  (item) => item.label === 'ビデオ通話',
);

export const VIDEO_CALL_PRICE_TEXT =
  videoCallPricing?.price && typeof videoCallPricing.price === 'number'
    ? `${videoCallPricing.price}pt`
    : (videoCallPricing?.price ?? '');

const videoChatViewingPricing = PRICING_INFO.find(
  (item) => item.label === 'ビデオチャット視聴',
);

/** ビデオチャット視聴の1分あたりのポイント消費量 */
export const VIDEO_CHAT_VIEWING_PRICE =
  videoChatViewingPricing?.price &&
  typeof videoChatViewingPricing.price === 'number'
    ? videoChatViewingPricing.price
    : 200;

/** ビデオチャット視聴に必要な最低ポイント（1分あたりの消費量と同じ） */
export const MIN_POINT_FOR_VIDEO_CHAT_VIEWING = VIDEO_CHAT_VIEWING_PRICE;

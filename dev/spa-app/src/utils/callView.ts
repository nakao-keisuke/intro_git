import { PRICING_INFO, type PricingLabel } from '@/constants/pricing';

export type CallView = Pick<
  | VideoCallFromStandbyView
  | LiveView
  | SideWatchView
  | VideoCallFromOutGoingView
  | VideoChatFromOutGoingView
  | VoiceCallFromOutgoingView
  | VideoCallFromIncomingView
  | VideoChatFromIncomingView
  | VoiceCallView,
  | 'type'
  | 'stopModalText'
  | 'endedBeforeCallMessage'
  | 'endedCallByWomanMessage'
  | 'endedCallByManMessage'
>;
export type CallType = CallView['type'];
export type LiveCallView = Pick<
  VideoCallFromStandbyView | LiveView | SideWatchView,
  | 'type'
  | 'actionButtonText'
  | 'actionButtonTSpanText'
  | 'statusText'
  | 'promptText'
>;
export type LiveCallType = LiveCallView['type'] | 'sideWatch';
export type OutgoingCallType = Exclude<CallType, LiveCallType>;
export type IncomingCallType = Exclude<CallType, LiveCallType>;
const videoCallFromStandbyView = {
  type: 'videoCallFromStandby',
  actionButtonText: 'ビデオ通話待機中',
  actionButtonTSpanText: '  ビデオ通話する',
  statusText: '即ビデオ通話',
  promptText: '今すぐ話そう！',
  stopModalText: '通話中です。\n通話を終了しますか？',
  endedBeforeCallMessage:
    '待機が終了しました。\nチャットで通話をリクエストしてみましょう♪',
  endedCallByWomanMessage:
    '通話が終了しました。\nお相手をお気に入りに登録しませんか？',
  endedCallByManMessage:
    '通話を退出しました。\nお相手をお気に入りに登録しませんか？',
  typeText: 'ビデオ通話',
} as const;
type VideoCallFromStandbyView = typeof videoCallFromStandbyView;
const liveTextView = {
  type: 'live',
  actionButtonText: 'ビデオチャット待機中',
  actionButtonTSpanText: '  視聴する',

  statusText: 'コメント無料',
  promptText: '今すぐ見てみよう！',
  stopModalText: '配信視聴中です。\n視聴を終了しますか？',
  endedBeforeCallMessage:
    '待機が終了しました。\n待機をお願いするメッセージを送ってみましょう♪',
  endedCallByWomanMessage:
    '配信が終了しました。\nお相手をお気に入りに登録しませんか？',
  endedCallByManMessage:
    '配信を退出しました。\nお相手をお気に入りに登録しませんか？',
} as const;

type LiveView = typeof liveTextView;

const sideWatchView = {
  type: 'sideWatch',
  actionButtonText: 'ビデオチャット配信中',
  actionButtonTSpanText: '  視聴する',
  statusText: 'コメント無料',
  promptText: '今すぐ見てみよう！',
  stopModalText: '配信視聴中です。\n視聴を終了しますか？',
  endedBeforeCallMessage:
    '配信が終了しました。\n配信をお願いするメッセージを送ってみましょう♪',
  endedCallByWomanMessage:
    '配信が終了しました。\nお相手をお気に入りに登録しませんか？',
  endedCallByManMessage:
    '配信を退出しました。\nお相手をお気に入りに登録しませんか？',
} as const;

type SideWatchView = typeof sideWatchView;

const videoCallFromOutGoingView = {
  type: 'videoCallFromOutgoing',
  stopModalText: '通話中です。通話を終了しますか？',
  endedBeforeCallMessage:
    '通話が開始する前に終了しました。\n通話をお願いするメッセージを送ってみましょう♪',
  endedCallByWomanMessage:
    '通話が終了しました。\nお相手をお気に入りに登録しませんか？',
  endedCallByManMessage:
    '通話を退出しました。\nお相手をお気に入りに登録しませんか？',
} as const;
type VideoCallFromOutGoingView = typeof videoCallFromOutGoingView;
const voiceCallFromOutgoingView = {
  type: 'voiceCallFromOutgoing',
  stopModalText: '通話中です。通話を終了しますか？',
  endedBeforeCallMessage:
    '通話が開始する前に終了しました。\n通話をお願いするメッセージを送ってみましょう♪',
  endedCallByWomanMessage:
    '通話が終了しました。\nお相手をお気に入りに登録しませんか？',
  endedCallByManMessage:
    '通話を退出しました。\nお相手をお気に入りに登録しませんか？',
} as const;
type VoiceCallFromOutgoingView = typeof voiceCallFromOutgoingView;
const videoChatFromOutGoingView = {
  type: 'videoChatFromOutgoing',
  stopModalText: 'ビデオチャット中です。終了しますか？',
  endedBeforeCallMessage:
    'ビデオチャットが開始する前に終了しました。\nビデオチャットをお願いするメッセージを送ってみましょう♪',
  endedCallByWomanMessage:
    'ビデオチャットが終了しました。\nお相手をお気に入りに登録しませんか？',
  endedCallByManMessage:
    '通話を退出しました。\nお相手をお気に入りに登録しませんか？',
} as const;
type VideoChatFromOutGoingView = typeof videoChatFromOutGoingView;
const videoCallFromIncomingView = {
  type: 'videoCallFromIncoming',
  stopModalText: '通話中です。通話を終了しますか？',
  endedBeforeCallMessage:
    'ビデオ通話着信がありました。\nこちらから発信してみよう♪',
  endedCallByWomanMessage:
    '通話が終了しました。\nお相手をお気に入りに登録しませんか？',
  endedCallByManMessage:
    '通話を退出しました。\nお相手をお気に入りに登録しませんか？',
} as const;
type VideoCallFromIncomingView = typeof videoCallFromIncomingView;
const videoChatFromIncomingView = {
  type: 'videoChatFromIncoming',
  stopModalText: 'ビデオチャット中です。終了しますか？',
  endedBeforeCallMessage:
    'ビデオチャット着信がありました。\nこちらから発信してみよう♪',
  endedCallByWomanMessage:
    'ビデオチャットが終了しました。\nお相手をお気に入りに登録しませんか？',
  endedCallByManMessage:
    'ビデオチャットを退出しました。\nお相手をお気に入りに登録しませんか？',
} as const;
type VideoChatFromIncomingView = typeof videoChatFromIncomingView;

const voiceCallView = {
  type: 'voiceCall',
  stopModalText: '音声通話を終了しますか？',
  endedBeforeCallMessage: '音声通話が終了しました',
  endedCallByWomanMessage: '音声通話が終了しました',
  endedCallByManMessage: '音声通話が終了しました',
} as const;
type VoiceCallView = typeof voiceCallView;

export const getCallView = (type: CallType): CallView => {
  switch (type) {
    case 'videoCallFromStandby':
      return videoCallFromStandbyView;
    case 'live':
      return liveTextView;
    case 'sideWatch':
      return sideWatchView;
    case 'videoCallFromOutgoing':
      return videoCallFromOutGoingView;
    case 'voiceCallFromOutgoing':
      return voiceCallFromOutgoingView;
    case 'videoChatFromOutgoing':
      return videoChatFromOutGoingView;
    case 'videoCallFromIncoming':
      return videoCallFromIncomingView;
    case 'videoChatFromIncoming':
      return videoChatFromIncomingView;
    case 'voiceCall':
      return voiceCallView;
  }
};

export const getLiveCallView = (type: LiveCallType) => {
  switch (type) {
    case 'videoCallFromStandby':
      return videoCallFromStandbyView;
    case 'live':
      return liveTextView;
    case 'sideWatch':
      return sideWatchView;
  }
};

export const getLiveChannelerProfilePath = (type: LiveCallType) => {
  switch (type) {
    case 'videoCallFromStandby':
      return '/profile/video-call-broadcaster';
    case 'live':
      return '/profile/live-broadcaster';
    case 'sideWatch':
      return '/profile/channel';
    default:
      return '';
  }
};

export const getOutgoingCallPath = (type: OutgoingCallType) => {
  switch (type) {
    case 'videoCallFromOutgoing':
      return '/outgoing/video-call';
    case 'voiceCallFromOutgoing':
      return '/outgoing/voice-call';
    case 'videoChatFromOutgoing':
      return '/outgoing/video-chat';
    default:
      return '';
  }
};

export const getIncomingCallPath = (type: IncomingCallType) => {
  switch (type) {
    case 'videoCallFromIncoming':
      return '/incoming/video-call';
    case 'voiceCall':
      return '/incoming/voice-call';
    case 'videoChatFromIncoming':
      return '/incoming/video-chat';
    default:
      return '';
  }
};

/**
 * PRICING_INFO から指定されたラベルの料金を取得するヘルパー関数
 */
const getPriceByLabel = (label: PricingLabel): number => {
  const pricingInfo = PRICING_INFO.find((info) => info.label === label);
  if (!pricingInfo || typeof pricingInfo.price !== 'number') {
    throw new Error(`Price not found for label: ${label}`);
  }
  return pricingInfo.price;
};

export const payPointPerMinute = (callType: CallType) => {
  switch (callType) {
    case 'videoCallFromStandby':
    case 'videoCallFromOutgoing':
    case 'videoCallFromIncoming':
      return getPriceByLabel('ビデオ通話');
    case 'live':
    case 'sideWatch':
    case 'videoChatFromOutgoing':
    case 'videoChatFromIncoming':
      return getPriceByLabel('ビデオチャット視聴');
    case 'voiceCallFromOutgoing':
    case 'voiceCall':
      return getPriceByLabel('音声通話');
  }
};

/**
 * 通話の状態を元に、遷移するべきURLの主要部分を返す関数
 */
export const getLiveChannelerProfileUrlBase = (type: LiveCallType | null) => {
  switch (type) {
    case 'videoCallFromStandby':
      return '/profile/video-call-broadcaster';
    case 'live':
      return '/profile/live-broadcaster';
    case 'sideWatch':
      return '/profile/channel';
    default:
      return '/profile/unbroadcaster/';
  }
};

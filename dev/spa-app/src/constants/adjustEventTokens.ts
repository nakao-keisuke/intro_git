/**
 * Adjustのイベントトークンを管理している
 * トークン単体だとわかりにくいため
 */
export const UTANO_ADJUST_EVENT_TOKENS = {
  complete_edit_profile: '1rsm0e',
  complete_like: 'url31u',
  complete_lovense: 'gmypob',
  complete_send_board_message: 'o48lx8',
  complete_send_message: 'jiacat',
  complete_video_call: 'q8go53',
  complete_video_chat: 'lgdusp',
  complete_video_chat_main: 'gpc6ik',
  complete_video_chat_sub: 'jwc202',
  complete_voice_call: '1axixi',
  iOS_10000: '4huciy',
  iOS_2900: 'rqiket',
  iOS_480: '84b3b2',
  iOS_4900: '5wmtu8',
  iOS_800: 'ccrhsz',
  purchased: 'bpdtzq',
  register: 'on2nry',
  first_purchase: '5uipsj',
} as const;

/**
 * Adjustのイベントトークンを管理している
 */
export const UTAGE_ADJUST_EVENT_TOKENS = {
  register: 'uiupif',
} as const;

export const ADJUST_UTANO_APP_TOKEN = 'm73ytak9kdfk';
export const ADJUST_UTAGE_APP_TOKEN = 'igrb41n8c2kg';

// 型エクスポート
export type AdjustEventToken =
  (typeof UTANO_ADJUST_EVENT_TOKENS)[keyof typeof UTANO_ADJUST_EVENT_TOKENS];

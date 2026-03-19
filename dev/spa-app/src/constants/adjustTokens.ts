import { AdjustPlatform } from './eventProviders';

/**
 * Adjustイベントトークン定義
 *
 * Adjust管理画面から取得したイベントトークンを一元管理
 *
 * トークン取得方法:
 * 1. Adjust管理画面にログイン
 * 2. 対象アプリを選択
 * 3. イベント設定画面からCSVダウンロード
 * 4. 必要なイベントのトークンをここに追加
 */
export const ADJUST_TOKENS = {
  /**
   * ユーザー登録完了
   * GA4イベント名: sign_up
   */
  sign_up: {
    [AdjustPlatform.RenkaIos]: '3seu3y',
    [AdjustPlatform.RenkaAndroid]: 'x3qjkl',
    [AdjustPlatform.HikariIos]: 'HIKARI_SIGN_UP_TOKEN',
    [AdjustPlatform.SakuraIos]: 'SAKURA_SIGN_UP_TOKEN',
    [AdjustPlatform.SumireIos]: 'SUMIRE_SIGN_UP_TOKEN',
  },

  /**
   * プロフィール編集完了
   * GA4イベント名: edit_profile
   */
  edit_profile: {
    [AdjustPlatform.RenkaIos]: '3fdj7h',
    [AdjustPlatform.RenkaAndroid]: '74pbz6',
    [AdjustPlatform.HikariIos]: 'HIKARI_EDIT_PROFILE_TOKEN',
    [AdjustPlatform.SakuraIos]: 'SAKURA_EDIT_PROFILE_TOKEN',
    [AdjustPlatform.SumireIos]: 'SUMIRE_EDIT_PROFILE_TOKEN',
  },

  /**
   * メッセージ送信完了
   * GA4イベント名: COMPLETE_SEND_MESSAGE
   */
  COMPLETE_SEND_MESSAGE: {
    [AdjustPlatform.RenkaIos]: 'slvjvy',
    [AdjustPlatform.RenkaAndroid]: 'su7ub9',
    [AdjustPlatform.HikariIos]: 'HIKARI_COMPLETE_SEND_MESSAGE_TOKEN',
    [AdjustPlatform.SakuraIos]: 'SAKURA_COMPLETE_SEND_MESSAGE_TOKEN',
    [AdjustPlatform.SumireIos]: 'SUMIRE_COMPLETE_SEND_MESSAGE_TOKEN',
  },

  /**
   * 掲示板1-Tapメッセージ送信完了
   * GA4イベント名: COMPLETE_SEND_ONE_TAP_MESSAGE_FROM_BOARD
   */
  COMPLETE_SEND_ONE_TAP_MESSAGE_FROM_BOARD: {
    [AdjustPlatform.RenkaIos]: 'ph7fu6',
    [AdjustPlatform.RenkaAndroid]: 'jr9d8f',
    [AdjustPlatform.HikariIos]:
      'HIKARI_COMPLETE_SEND_ONE_TAP_MESSAGE_FROM_BOARD_TOKEN',
    [AdjustPlatform.SakuraIos]:
      'SAKURA_COMPLETE_SEND_ONE_TAP_MESSAGE_FROM_BOARD_TOKEN',
    [AdjustPlatform.SumireIos]:
      'SUMIRE_COMPLETE_SEND_ONE_TAP_MESSAGE_FROM_BOARD_TOKEN',
  },

  /**
   * 掲示板メッセージ送信完了
   * GA4イベント名: COMPLETE_SEND_FREE_MESSAGE_FROM_BOARD
   */
  COMPLETE_SEND_FREE_MESSAGE_FROM_BOARD: {
    [AdjustPlatform.RenkaIos]: '4caubw',
    [AdjustPlatform.RenkaAndroid]: 'lqe0e4',
    [AdjustPlatform.HikariIos]:
      'HIKARI_COMPLETE_SEND_FREE_MESSAGE_FROM_BOARD_TOKEN',
    [AdjustPlatform.SakuraIos]:
      'SAKURA_COMPLETE_SEND_FREE_MESSAGE_FROM_BOARD_TOKEN',
    [AdjustPlatform.SumireIos]:
      'SUMIRE_COMPLETE_SEND_FREE_MESSAGE_FROM_BOARD_TOKEN',
  },

  /**
   * いいね送信完了
   * GA4イベント名: SEND_GOOD
   */
  SEND_GOOD: {
    [AdjustPlatform.RenkaIos]: 'd6ki59',
    [AdjustPlatform.RenkaAndroid]: 'bxgz31',
    [AdjustPlatform.HikariIos]: 'HIKARI_SEND_GOOD_TOKEN',
    [AdjustPlatform.SakuraIos]: 'SAKURA_SEND_GOOD_TOKEN',
    [AdjustPlatform.SumireIos]: 'SUMIRE_SEND_GOOD_TOKEN',
  },

  /**
   * ビデオ通話開始
   * GA4イベント名: START_VIDEO_CALL
   */
  START_VIDEO_CALL: {
    [AdjustPlatform.RenkaIos]: 'e2dp92',
    [AdjustPlatform.RenkaAndroid]: '7fapxn',
    [AdjustPlatform.HikariIos]: 'HIKARI_START_VIDEO_CALL_TOKEN',
    [AdjustPlatform.SakuraIos]: 'SAKURA_START_VIDEO_CALL_TOKEN',
    [AdjustPlatform.SumireIos]: 'SUMIRE_START_VIDEO_CALL_TOKEN',
  },

  /**
   * ビデオチャット開始
   * GA4イベント名: START_VIDEO_CHAT
   */
  START_VIDEO_CHAT: {
    [AdjustPlatform.RenkaIos]: '1sji9a',
    [AdjustPlatform.RenkaAndroid]: '9vnh8e',
    [AdjustPlatform.HikariIos]: 'HIKARI_START_VIDEO_CHAT_TOKEN',
    [AdjustPlatform.SakuraIos]: 'SAKURA_START_VIDEO_CHAT_TOKEN',
    [AdjustPlatform.SumireIos]: 'SUMIRE_START_VIDEO_CHAT_TOKEN',
  },

  /**
   * ボイス通話開始
   * GA4イベント名: START_VOICE_CALL
   */
  START_VOICE_CALL: {
    [AdjustPlatform.RenkaIos]: 'tbw4j0',
    [AdjustPlatform.RenkaAndroid]: '3dglom',
    [AdjustPlatform.HikariIos]: 'HIKARI_START_VOICE_CALL_TOKEN',
    [AdjustPlatform.SakuraIos]: 'SAKURA_START_VOICE_CALL_TOKEN',
    [AdjustPlatform.SumireIos]: 'SUMIRE_START_VOICE_CALL_TOKEN',
  },

  /**
   * 動画購入完了
   * GA4イベント名: COMPLETE_BUY_VIDEO
   */
  COMPLETE_BUY_VIDEO: {
    [AdjustPlatform.RenkaIos]: 'g9x8xx',
    [AdjustPlatform.RenkaAndroid]: '50iu1f',
    [AdjustPlatform.HikariIos]: 'HIKARI_COMPLETE_BUY_VIDEO_TOKEN',
    [AdjustPlatform.SakuraIos]: 'SAKURA_COMPLETE_BUY_VIDEO_TOKEN',
    [AdjustPlatform.SumireIos]: 'SUMIRE_COMPLETE_BUY_VIDEO_TOKEN',
  },

  /**
   * 画像購入完了
   * GA4イベント名: COMPLETE_BUY_IMAGE
   */
  COMPLETE_BUY_IMAGE: {
    [AdjustPlatform.RenkaIos]: '9g71d4',
    [AdjustPlatform.RenkaAndroid]: '789ltc',
    [AdjustPlatform.HikariIos]: 'HIKARI_COMPLETE_BUY_IMAGE_TOKEN',
    [AdjustPlatform.SakuraIos]: 'SAKURA_COMPLETE_BUY_IMAGE_TOKEN',
    [AdjustPlatform.SumireIos]: 'SUMIRE_COMPLETE_BUY_IMAGE_TOKEN',
  },
} as const;

/**
 * Adjustトークンが定義されているイベントキーの型
 */
export type AdjustEventKey = keyof typeof ADJUST_TOKENS;

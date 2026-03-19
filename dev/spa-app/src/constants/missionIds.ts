/**
 * オンボーディングミッションID定数
 * 各ミッションに対応する一意のIDを定義
 */
export const MISSION_IDS = {
  /** 電話番号認証ミッション */
  PHONE_VERIFICATION: 1,
  /** メールアドレス認証ミッション */
  EMAIL_VERIFICATION: 2,
  /** ホームアプリ追加ミッション */
  HOME_APP_ADDITION: 3,
  /** クレジットカード登録ミッション */
  CREDIT_CARD_REGISTRATION: 4,
  /** LINE友だち追加ミッション */
  LINE_FRIEND_ADDITION: 5,
} as const;

export type MissionId = (typeof MISSION_IDS)[keyof typeof MISSION_IDS];

/**
 * 期間限定ミッション設定
 *
 * キャンペーンの切り替え時はこのファイルのみを編集してください。
 * enabled を false にすると、すべての画面でミッションバナーが非表示になります。
 */

export const LIMITED_MISSION = {
  /**
   * ミッション表示フラグ
   * true: 表示, false: 非表示
   */
  enabled: false,

  /**
   * マイページフッターバナー表示フラグ
   * true: 表示, false: 非表示
   */
  footerBannerEnabled: false,

  /**
   * バナー画像パス（ヘッダー用）
   * 主にホーム画面、デイリーボーナス、ニュース画面、通話終了モーダルで使用
   */
  bannerImageHeader: '/banner/male_call_mission_0123_h.webp',

  /**
   * バナー画像パス（フッター用）
   * マイページのフッターバナーで使用
   */
  bannerImageFooter: '/banner/male_call_mission_0123_f.webp',

  /**
   * リンク先のベースURL
   */
  baseUrl:
    'https://web2.marrytalk-mobile-app.com/news/male/making_call_mission',

  /**
   * バナーテキスト（ニュース画面用）
   */
  text: ['ビデオチャットミッション開催中！', '最大20,000pt貰える💕'] as const,

  /**
   * バナーのalt属性
   */
  alt: 'ビデオ通話ミッション',
} as const;

/**
 * セッショントークン付きのミッションURLを生成
 * @param token - ユーザーのセッショントークン
 * @returns トークン付きのURL
 */
export const getMissionUrl = (token?: string | null): string => {
  if (token) {
    return `${LIMITED_MISSION.baseUrl}?sid=${token}`;
  }
  return LIMITED_MISSION.baseUrl;
};

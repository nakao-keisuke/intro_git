/**
 * バッジIDから画像パスを取得
 * public/badge/ 配下の画像を使用
 * badgeId は Jambo API の BadgeConstants に合わせる
 */

const BADGE_IMAGE_MAP: Record<string, string> = {
  mood_booster_badge: '/badge/badge_moriage.webp',
  cute_smile_badge: '/badge/badge_cutesmile.webp',
  cute_voice_badge: '/badge/badge_cutevoice.webp',
  gap_moe_badge: '/badge/badge_gapmoe.webp',
  face_reveal_badge: '/badge/badge_kaodashi.webp',
  lovense_high_sensitivity_badge: '/badge/badge_lovense.webp',
  m_girl_badge: '/badge/badge_m.webp',
  s_girl_badge: '/badge/badge_s.webp',
  nice_style_badge: '/badge/badge_nicestyle.webp',
  plump_badge: '/badge/badge_muchimuchi.webp',
} as const;

/**
 * バッジIDから画像パスを取得
 * @param badgeId バッジID（例: "mood_booster_badge", "cute_voice_badge"）
 * @returns 画像パス（例: "/badge/badge_moriage.webp"）、見つからない場合はundefined
 */
export const getBadgeImagePath = (badgeId: string): string | undefined => {
  if (!badgeId) return undefined;
  return BADGE_IMAGE_MAP[badgeId];
};

/**
 * バッジIDから画像パスを取得（フォールバック付き）
 * APIから返されるimageUrlがある場合はそれを優先し、
 * ない場合やローカル画像を使いたい場合はpublic/badgeの画像を使用
 * @param badgeId バッジID
 * @param fallbackUrl APIから返される画像URL（フォールバック用）
 * @returns 画像パス
 */
export const getBadgeImagePathWithFallback = (
  badgeId: string,
  fallbackUrl?: string,
): string => {
  const localPath = getBadgeImagePath(badgeId);
  return localPath ?? fallbackUrl ?? '/badge/badge_default.webp';
};

/**
 * 手動付与バッジの定義
 * Jambo API の BadgeConstants に準拠したバッジIDを使用
 */

export type BadgeDefinition = {
  id: string;
  name: string;
  image: string;
};

/**
 * 手動付与バッジリスト
 * ReviewModal（バッジ付与）と ProfileBadgeSection（バッジ表示）で共通使用
 */
export const MANUAL_BADGES: readonly BadgeDefinition[] = [
  {
    id: 'mood_booster_badge',
    name: '盛り上げ上手',
    image: '/badge/badge_moriage.webp',
  },
  {
    id: 'cute_smile_badge',
    name: '笑顔かわいい',
    image: '/badge/badge_cutesmile.webp',
  },
  {
    id: 'cute_voice_badge',
    name: '声かわいい',
    image: '/badge/badge_cutevoice.webp',
  },
  {
    id: 'face_reveal_badge',
    name: '顔出し',
    image: '/badge/badge_kaodashi.webp',
  },
  {
    id: 'gap_moe_badge',
    name: 'ギャップ萌え',
    image: '/badge/badge_gapmoe.webp',
  },
  {
    id: 'lovense_high_sensitivity_badge',
    name: 'Lovense反応◎',
    image: '/badge/badge_lovense.webp',
  },
  {
    id: 'nice_style_badge',
    name: 'Niceスタイル',
    image: '/badge/badge_nicestyle.webp',
  },
  {
    id: 'plump_badge',
    name: 'ムチムチ',
    image: '/badge/badge_muchimuchi.webp',
  },
  { id: 's_girl_badge', name: 'S女', image: '/badge/badge_s.webp' },
  { id: 'm_girl_badge', name: 'M女', image: '/badge/badge_m.webp' },
] as const;

/**
 * バッジIDからバッジ定義を取得
 */
export const getBadgeById = (badgeId: string): BadgeDefinition | undefined => {
  return MANUAL_BADGES.find((badge) => badge.id === badgeId);
};

/**
 * バッジの背景色をバッジIDから取得
 */
export const getBadgeBackgroundColor = (badgeId: string): string => {
  const colorMap: Record<string, string> = {
    mood_booster_badge: 'bg-yellow-100',
    cute_smile_badge: 'bg-pink-100',
    cute_voice_badge: 'bg-green-100',
    gap_moe_badge: 'bg-blue-100',
    s_girl_badge: 'bg-red-100',
    m_girl_badge: 'bg-purple-100',
    face_reveal_badge: 'bg-pink-100',
    lovense_high_sensitivity_badge: 'bg-pink-100',
    nice_style_badge: 'bg-blue-100',
    plump_badge: 'bg-green-100',
  };

  return colorMap[badgeId] || 'bg-gray-100';
};

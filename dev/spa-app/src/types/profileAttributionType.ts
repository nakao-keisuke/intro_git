/**
 * プロフィール遷移のセクション名
 * 新しいセクションを追加する場合はここに追加してください
 */
export type SectionName =
  | 'new_users'
  | 'video_ranking'
  | 'young_users'
  | 'same_region'
  | 'flea_market_users';

export type ProfileAttributionInput = {
  /** クリック時点の遷移元パス（例: "/girls/all"） */
  source_path: string;
  /** セクション名（例: "video_ranking", "same_region"） */
  section_name?: SectionName | undefined;
};

export type ProfileAttribution = ProfileAttributionInput & {
  /** 保存時刻（ms） */
  ts: number;
  /** 一意識別子 */
  nonce: string;
};

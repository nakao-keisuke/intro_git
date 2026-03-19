/**
 * Lovense関連の定数定義
 */

/**
 * タイムスタンプの単位判定用の閾値
 * 10,000,000,000ミリ秒 = 10桁の秒タイムスタンプ
 * この値より大きい場合はミリ秒単位と判定
 */
export const MILLISECOND_THRESHOLD = 10 * 1000 * 1000 * 1000;

/**
 * 最近開始されたと判定する時間窓（ミリ秒）
 * 5分 = 300,000ミリ秒
 */
export const RECENT_START_WINDOW_MS = 5 * 60 * 1000;

/**
 * 最近開始されたと判定する時間窓（秒）
 * 5分 = 300秒
 */
export const RECENT_START_WINDOW_SEC = 5 * 60;

/**
 * Lovenseシーケンスパターン関連の定数
 */

/**
 * Lovenseの強度タイプ
 */
export type LovenseIntensityType =
  | '弱' // Weak
  | '中' // Medium
  | '強' // Strong
  | 'パルス' // Pulse
  | 'ウェーブ' // Wave
  | 'ファイアーワークス' // Fireworks
  | 'アースクエイク'; // Earthquake

/**
 * Lovenseアクションの定義
 */
export interface LovenseAction {
  /** 強度タイプ */
  intensity: LovenseIntensityType;
  /** カウントダウン時間（秒） */
  countdownSeconds: number;
  /** 発動時間（秒） */
  activationSeconds: number;
  /** 待機時間（秒） */
  waitSeconds: number;
}

/**
 * Lovenseシーケンスパターンの定義
 */
export interface LovensePattern {
  /** パターンID */
  id: number;
  /** パターン名 */
  name: string;
  /** アクションの配列 */
  actions: LovenseAction[];
}

/**
 * Lovenseシーケンスパターン1: 中 → 中 → ファイアーワークス
 */
export const LOVENSE_PATTERN_1: LovensePattern = {
  id: 1,
  name: '中 → 中 → ファイアーワークス',
  actions: [
    {
      intensity: '中',
      countdownSeconds: 5,
      activationSeconds: 20,
      waitSeconds: 0,
    },
    {
      intensity: '中',
      countdownSeconds: 5,
      activationSeconds: 20,
      waitSeconds: 0,
    },
    {
      intensity: 'ファイアーワークス',
      countdownSeconds: 5,
      activationSeconds: 20,
      waitSeconds: 0,
    },
  ],
};

/**
 * Lovenseシーケンスパターン2: 強 → 強 → 強
 */
export const LOVENSE_PATTERN_2: LovensePattern = {
  id: 2,
  name: '強 → 強 → 強',
  actions: [
    {
      intensity: '強',
      countdownSeconds: 5,
      activationSeconds: 20,
      waitSeconds: 0,
    },
    {
      intensity: '強',
      countdownSeconds: 5,
      activationSeconds: 20,
      waitSeconds: 0,
    },
    {
      intensity: '強',
      countdownSeconds: 5,
      activationSeconds: 20,
      waitSeconds: 0,
    },
  ],
};

/**
 * Lovenseシーケンスパターン3: 弱 → 強 → ウェーブ
 */
export const LOVENSE_PATTERN_3: LovensePattern = {
  id: 3,
  name: '弱 → 強 → ウェーブ',
  actions: [
    {
      intensity: '弱',
      countdownSeconds: 5,
      activationSeconds: 20,
      waitSeconds: 0,
    },
    {
      intensity: '強',
      countdownSeconds: 5,
      activationSeconds: 20,
      waitSeconds: 0,
    },
    {
      intensity: 'ウェーブ',
      countdownSeconds: 5,
      activationSeconds: 15,
      waitSeconds: 0,
    },
  ],
};

/**
 * Lovenseシーケンスパターン4: パルス → 弱 → 弱 → 強（4アクション）
 */
export const LOVENSE_PATTERN_4: LovensePattern = {
  id: 4,
  name: 'パルス → 弱 → 弱 → 強',
  actions: [
    {
      intensity: 'パルス',
      countdownSeconds: 5,
      activationSeconds: 15,
      waitSeconds: 0,
    },
    {
      intensity: '弱',
      countdownSeconds: 5,
      activationSeconds: 20,
      waitSeconds: 0,
    },
    {
      intensity: '弱',
      countdownSeconds: 5,
      activationSeconds: 20,
      waitSeconds: 0,
    },
    {
      intensity: '強',
      countdownSeconds: 5,
      activationSeconds: 20,
      waitSeconds: 0,
    },
  ],
};

/**
 * Lovenseシーケンスパターン5: 弱 → 弱 → アースクエイク
 */
export const LOVENSE_PATTERN_5: LovensePattern = {
  id: 5,
  name: '弱 → 弱 → アースクエイク',
  actions: [
    {
      intensity: '弱',
      countdownSeconds: 5,
      activationSeconds: 20,
      waitSeconds: 0,
    },
    {
      intensity: '弱',
      countdownSeconds: 5,
      activationSeconds: 20,
      waitSeconds: 0,
    },
    {
      intensity: 'アースクエイク',
      countdownSeconds: 5,
      activationSeconds: 20,
      waitSeconds: 0,
    },
  ],
};

/**
 * 全てのLovenseシーケンスパターンの配列
 * 各パターンの選択確率は20%
 */
export const LOVENSE_PATTERNS: LovensePattern[] = [
  LOVENSE_PATTERN_1,
  LOVENSE_PATTERN_2,
  LOVENSE_PATTERN_3,
  LOVENSE_PATTERN_4,
  LOVENSE_PATTERN_5,
];

/**
 * Lovenseパターンの総数
 */
export const LOVENSE_PATTERN_COUNT = LOVENSE_PATTERNS.length;

/**
 * 各パターンの選択確率（%）
 */
export const LOVENSE_PATTERN_PROBABILITY = 100 / LOVENSE_PATTERN_COUNT;

/**
 * LovenseIntensityType（日本語）からAPIのtype（英語）へのマッピング
 */
export const INTENSITY_TO_TYPE_MAP: Record<LovenseIntensityType, string> = {
  弱: 'weak',
  中: 'medium',
  強: 'strong',
  パルス: 'pulse',
  ウェーブ: 'wave',
  ファイアーワークス: 'fireworks',
  アースクエイク: 'earthquake',
};

/**
 * APIのtype（英語）からLovenseIntensityType（日本語）へのマッピング
 */
export const TYPE_TO_INTENSITY_MAP: Record<string, LovenseIntensityType> = {
  weak: '弱',
  medium: '中',
  strong: '強',
  pulse: 'パルス',
  wave: 'ウェーブ',
  fireworks: 'ファイアーワークス',
  earthquake: 'アースクエイク',
};

/**
 * ランダムにパターンを選択する
 */
export const getRandomPattern = (): LovensePattern => {
  const index = Math.floor(Math.random() * LOVENSE_PATTERNS.length);
  // LOVENSE_PATTERNSは常に5要素あるため、undefinedにはならない
  return LOVENSE_PATTERNS[index] as LovensePattern;
};

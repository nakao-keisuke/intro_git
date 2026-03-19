const regionArray = [
  '未設定',
  '北海道',
  '青森',
  '岩手',
  '秋田',
  '宮城',
  '山形',
  '福島',
  '茨城',
  '栃木',
  '群馬',
  '埼玉',
  '千葉',
  '東京',
  '神奈川',
  '山梨',
  '長野',
  '新潟',
  '富山',
  '石川',
  '福井',
  '静岡',
  '愛知',
  '岐阜',
  '三重',
  '滋賀',
  '京都',
  '大阪',
  '兵庫',
  '奈良',
  '和歌山',
  '島根',
  '鳥取',
  '岡山',
  '広島',
  '山口',
  '香川',
  '徳島',
  '高知',
  '愛媛',
  '福岡',
  '佐賀',
  '長崎',
  '大分',
  '熊本',
  '宮崎',
  '鹿児島',
  '沖縄',
] as const;

type RegionName =
  | '北海道'
  | '東北'
  | '関東'
  | '中部'
  | '関西'
  | '中国'
  | '四国'
  | '九州・沖縄';

const preferredRegionArray = ['東京', '大阪', '愛知', '福岡'] as const;
const nonPreferredRegionArray = regionArray.filter(
  (region) =>
    !preferredRegionArray.some(
      (prefferedRegion) => prefferedRegion === region,
    ) && region !== '未設定',
);

export const displayRegionArray = [
  ...preferredRegionArray,
  ...nonPreferredRegionArray,
] as const;

export type Region = (typeof regionArray)[number];

export const region = (number: number): Region => {
  return regionArray[number] ?? '未設定';
};

export const regionNumber = (region: Region): number => {
  return regionArray.indexOf(region);
};

// パフォーマンス最適化: Map化により O(n) から O(1) に改善
const regionNameToIndexMap = new Map(
  regionArray.map((name, index) => [name, index]),
);

export const regionFromString = (regionName: string): number => {
  return regionNameToIndexMap.get(regionName as Region) ?? -1;
};

/**
 * 数値/文字列入力から安全に地域名（都道府県名）を解決するユーティリティ
 * - number: そのまま `region(n)` で名称化（-1は未設定扱い）
 * - 数値文字列: numberに変換して `region(n)`
 * - 地域名文字列: `regionFromString` に存在すればそのまま
 * - 空文字列または無効な値: '未設定'
 */
export const regionText = (value: number | string): Region => {
  // 数値の場合: region()関数で変換
  if (typeof value === 'number') {
    // -1は未設定を表す特別な値
    if (value === -1) return '未設定';
    return region(value);
  }

  // 文字列の場合
  if (typeof value === 'string') {
    // 空文字列は未設定
    if (value === '') return '未設定';

    // 数値文字列（"0", "1"など）の場合は数値に変換
    const n = Number(value);
    if (!Number.isNaN(n)) {
      if (n === -1) return '未設定';
      return region(n);
    }

    // 既に地域名の場合: 有効性をチェック
    if (regionFromString(value) !== -1) {
      return value as Region;
    }

    // 無効な文字列
    return '未設定';
  }

  return '未設定';
};
// 地域から都道府県配列を取得するマッピング
const regionPrefectureMap: Record<RegionName, Region[]> = {
  北海道: ['北海道'],
  東北: ['青森', '岩手', '秋田', '宮城', '山形', '福島'],
  関東: ['茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川'],
  中部: [
    '山梨',
    '長野',
    '新潟',
    '富山',
    '石川',
    '福井',
    '静岡',
    '愛知',
    '岐阜',
  ],
  関西: ['三重', '滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山'],
  中国: ['鳥取', '島根', '岡山', '広島', '山口'],
  四国: ['香川', '徳島', '高知', '愛媛'],
  '九州・沖縄': [
    '福岡',
    '佐賀',
    '長崎',
    '大分',
    '熊本',
    '宮崎',
    '鹿児島',
    '沖縄',
  ],
};

/**
 * 地域名から対応する都道府県配列を取得する
 * @param regionName 地域名（'東北', '関東', etc.）
 * @returns 対応する都道府県の配列。見つからない場合は空配列
 */
export const getRegionPrefectures = (regionName: string): Region[] => {
  // RegionName型のキーかどうかをチェック
  const validRegionNames: RegionName[] = [
    '北海道',
    '東北',
    '関東',
    '中部',
    '関西',
    '中国',
    '四国',
    '九州・沖縄',
  ];

  if (validRegionNames.includes(regionName as RegionName)) {
    return regionPrefectureMap[regionName as RegionName];
  }

  return [];
};

/**
 * 地域名から対応する都道府県の数値インデックス配列を取得する
 * @param regionName 地域名（'東北', '関東', etc.）
 * @returns 対応する都道府県の数値インデックス配列。見つからない場合は空配列
 */
export const getRegionPrefectureNumbers = (regionName: string): number[] => {
  const prefectures = getRegionPrefectures(regionName);
  return prefectures.map((prefecture) => regionNumber(prefecture));
};

/**
 * 都道府県名から地方名を取得する
 * @param prefecture 都道府県名
 * @returns 地方名。見つからない場合はnull
 */
export const getRegionGroupName = (prefecture: Region): RegionName | null => {
  const entries = Object.entries(regionPrefectureMap) as [
    RegionName,
    Region[],
  ][];
  const matched = entries.find(([, prefectures]) =>
    prefectures.includes(prefecture),
  );
  return matched ? matched[0] : null;
};

/**
 * 地域パラメータを処理して都道府県インデックス配列を取得する
 * @param regionParam 地域パラメータ（地域名または都道府県名）
 * @returns 処理結果（regionIndices配列とオプションのエラーメッセージ）
 */
export const processRegionParameter = (
  regionParam: string,
): { regionIndices: number[]; error?: string } => {
  const regionIndicesArray = getRegionPrefectureNumbers(regionParam);
  if (regionIndicesArray.length > 0) {
    return { regionIndices: regionIndicesArray };
  }

  const regionIndex = regionNumber(regionParam as Region);
  if (regionIndex >= 0) {
    return { regionIndices: [regionIndex] };
  }

  return { regionIndices: [], error: '地域設定が無効です。' };
};

const defaultTuple = [-1, '未設定'] as const;
export const tupleList = [
  [0, '映画'],
  [1, '読書'],
  [2, 'テレビ'],
  [3, '音楽'],
  [4, '家族'],
  [5, 'ペット'],
  [6, 'お酒'],
  [7, 'グルメ'],
  [8, 'ショッピング'],
  [9, 'スポーツ鑑賞'],
  [10, 'スポーツをする'],
  [11, '旅行'],
  [12, 'ドライブ'],
  [13, 'ゲーム'],
] as const;

export const secondtupleList = [
  '映画',
  '読書',
  'テレビ',
  '音楽',
  '家族',
  'ペット',
  'お酒',
  'グルメ',
  'ショッピング',
  'スポーツ鑑賞',
  'スポーツをする',
  '旅行',
  'ドライブ',
  'ゲーム',
];

export const hobbyList = tupleList.map((hobby) => hobby[1]);
export type Hobby =
  | Array<(typeof defaultTuple)[1]>
  | Array<(typeof hobbyList)[number]>;

export const hobby = (numbers: readonly number[]): Hobby => {
  if (numbers.includes(defaultTuple[0])) return [defaultTuple[1]];
  return Array.from(
    new Set(
      numbers
        .filter((n1) => n1 in tupleList.map((personality) => personality[0]))
        .map((n2) => tupleList.find((tuple) => tuple[0] === n2)?.[1])
        .filter((v): v is NonNullable<typeof v> => v != null),
    ),
  );
};

export const hobbyNumber = (hobby: string): number => {
  return secondtupleList.indexOf(hobby);
};

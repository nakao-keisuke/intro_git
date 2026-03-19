export const housemateList = [
  '未設定',
  '一人暮らし',
  '実家暮らし',
  '家族と',
  'ペットと',
  'ルームシェア',
  'その他',
] as const;

export type Housemate = (typeof housemateList)[number];

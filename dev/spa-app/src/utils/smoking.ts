export const smokingList = [
  '未設定',
  '吸う',
  '吸う（電子タバコ）',
  'ときどき吸う',
  '非喫煙者の前では吸わない',
  '吸わない',
] as const;

export type Smoking = (typeof smokingList)[number];

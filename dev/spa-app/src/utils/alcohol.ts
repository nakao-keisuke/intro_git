export const alcoholList = [
  '未設定',
  '常に飲んでいたい',
  '飲む',
  'ときどき飲む',
  '飲まない',
] as const;

export type Alcohol = (typeof alcoholList)[number];

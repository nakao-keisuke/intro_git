export const preferredLooksList = [
  '未設定',
  'かわいい系',
  'キレイ系',
  'いやし系',
  'セレブ系',
  'ギャル系',
  'セクシー系',
  '清楚系',
  '童顔',
  'お姉さま系',
  '小悪魔系',
  'フェロモン系',
] as const;

export type PreferredLooks = (typeof preferredLooksList)[number];

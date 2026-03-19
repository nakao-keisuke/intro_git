export const activeTimeList = [
  '未設定',
  '朝',
  '昼',
  '夕方',
  '夜',
  '深夜・早朝',
  'いつでも',
  '不定期',
  'メールしてね！',
] as const;

export type ActiveTime = (typeof activeTimeList)[number];

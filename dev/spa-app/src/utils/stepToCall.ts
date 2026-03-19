const stepToCallList = [
  '未設定',
  'いきなりかけてもらって大丈夫です',
  '通話リクエストください',
  'ひとことメッセージください',
  'チャットのみでお願いします',
] as const;

export type StepToCall = (typeof stepToCallList)[number];

export const stepToCall = (value: number): StepToCall => {
  return stepToCallList[value + 1] ?? '未設定';
};

export const stepToCallNumber = (value: StepToCall): number => {
  const index = stepToCallList.indexOf(value);
  return index > 0 ? index - 1 : 0;
};

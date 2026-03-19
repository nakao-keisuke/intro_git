export const talkThemeList = [
  '未設定',
  'どんなお話でもOK',
  '普通のお話しましょ',
] as const;

export type TalkTheme = (typeof talkThemeList)[number];

export const talkTheme = (value: number): TalkTheme => {
  return talkThemeList[value + 1] ?? '未設定';
};

export const talkThemeNumber = (value: TalkTheme): number => {
  const index = talkThemeList.indexOf(value);
  return index > 0 ? index - 1 : 0;
};

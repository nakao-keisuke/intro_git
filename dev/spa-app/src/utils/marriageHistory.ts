const marriageHistoryList = [
  '未設定',
  '未婚',
  '離婚',
  '既婚(1~5年)',
  '既婚(5~10年)',
  '既婚(10年以上)',
] as const;

export const notSettingMarriageHistoryNumber =
  marriageHistoryList.indexOf('未設定');
export const notMarriedNumber = marriageHistoryList.indexOf('未婚');
export const divorcedNumber = marriageHistoryList.indexOf('離婚');
export const married1To5YearsNumber =
  marriageHistoryList.indexOf('既婚(1~5年)');
export const married5To10YearsNumber =
  marriageHistoryList.indexOf('既婚(5~10年)');
export const married10YearsNumber =
  marriageHistoryList.indexOf('既婚(10年以上)');
export type NotSettingMarriageHistoryNumber =
  typeof notSettingMarriageHistoryNumber;
export type NotMarriedNumber = typeof notMarriedNumber;
export type DivorcedNumber = typeof divorcedNumber;
export type Married1To5YearsNumber = typeof married1To5YearsNumber;
export type Married5To10YearsNumber = typeof married5To10YearsNumber;
export type Married10YearsNumber = typeof married10YearsNumber;
export type MarriageHistoryNumber =
  | NotSettingMarriageHistoryNumber
  | NotMarriedNumber
  | DivorcedNumber
  | Married1To5YearsNumber
  | Married5To10YearsNumber
  | Married10YearsNumber;

export const marriageHistory = (value: number): MarriageHistory => {
  return marriageHistoryList[value + 1] ?? '未設定';
};

export const marriageStatusList = ['未婚', '既婚'] as const;

export type MarriageHistory = (typeof marriageHistoryList)[number];

export type MarriageStatus = (typeof marriageStatusList)[number];

export const marriageHistoryNumber = (status: MarriageStatus): number[] => {
  switch (status) {
    case '未婚':
      return [0, 1]; // 未婚, 離婚 (サーバー値)
    case '既婚':
      return [2, 3, 4]; // 既婚(1~5年), 既婚(5~10年), 既婚(10年以上) (サーバー値)
    default:
      return [];
  }
};

export const marriageHistoryToNumber = (history: MarriageHistory): number => {
  const index = marriageHistoryList.indexOf(history);
  return index > 0 ? index - 1 : 0;
};

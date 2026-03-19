export interface DailyBonusData {
  isAddPoint: boolean;
  addPoint: number;
  doubleDailyBonusCount?: number;
  doubleDailyBonusLimitTime?: string;
  isFirstBonusCourseExist: boolean;
  isSecondBonusCourseExist: boolean;
  isThirdBonusCourseExist: boolean;
  isFourthBonusCourseExist: boolean;
  isFifthBonusCourseExist: boolean;
  isPurchased: boolean;
  consumedPoint: number;
  token: string;
  shouldShowConfetti: boolean;
}

export interface DailyBonusResponse {
  data: DailyBonusData;
}

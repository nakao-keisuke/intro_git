/**
 * 年齢パラメータを lower_age / upper_age に変換
 *
 * @param ageParam - 年齢パラメータ（'1': 20代以下, '2': 20代, '3': 30代, '4': 40代, '5': 50代以上）
 * @returns lower（下限）とupper（上限）を含むオブジェクト
 */
export function getAgeRange(ageParam: string): {
  lower?: number;
  upper?: number;
} {
  switch (ageParam) {
    case '1':
      return { upper: 19 };
    case '2':
      return { lower: 20, upper: 29 };
    case '3':
      return { lower: 30, upper: 39 };
    case '4':
      return { lower: 40, upper: 49 };
    case '5':
      return { lower: 50 };
    default:
      return {};
  }
}

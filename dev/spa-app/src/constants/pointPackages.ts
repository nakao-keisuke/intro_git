/**
 * ポイントパッケージの型定義と一覧
 * AlvionPaymentModalとAlvionQuickChargeModalで共通使用
 */

import {
  APPLICATION_ID,
  type ApplicationIdType,
  getApplicationId,
} from '@/constants/applicationId';

/**
 * appIdごとのpackageIdプレフィックスマッピング
 * デフォルト（Renka iOS/Android/Web）は 'renka' のまま
 */
const PACKAGE_PREFIX_MAP: Partial<Record<ApplicationIdType, string>> = {
  [APPLICATION_ID.HIKARI_IOS]: 'hikari',
  [APPLICATION_ID.SAKURA_IOS]: 'sakura',
  [APPLICATION_ID.SUMIRE_IOS]: 'sumire',
};

/**
 * 現在のappIdに応じてpackageIdのプレフィックスを変換
 * 例: renka_point_package_3 → hikari_point_package_3（appId=83の場合）
 */
export const resolvePackageId = (basePackageId: string): string => {
  const appId = getApplicationId();
  const prefix = PACKAGE_PREFIX_MAP[appId];
  if (!prefix) return basePackageId;
  // プレフィックスのみ置換（先頭の 'renka' だけを対象）
  if (basePackageId.startsWith('renka')) {
    return prefix + basePackageId.slice('renka'.length);
  }
  return basePackageId;
};

/**
 * ボーナスコース購入タイプ
 */
export type SpecialPurchaseType =
  | 'first'
  | 'second'
  | 'third'
  | 'fourth'
  | 'fifth';

/**
 * ボーナスコース画像設定の型
 */
export type BonusCourseImageConfig = {
  src: string;
  alt: string;
};

/**
 * ポイントコースの価格定数
 */
export const POINT_COURSE_PRICES = {
  FIRST: 800,
  SECOND: 2900,
  THIRD: 4900,
  FOURTH: 10000,
  FIFTH: 14900,
} as const;

/**
 * クイックチャージモーダル用のボーナスコース背景画像
 * 金額をキーとして対応する背景画像パスを返す
 */
export const QUICK_CHARGE_BONUS_IMAGES: Partial<Record<number, string>> = {
  [POINT_COURSE_PRICES.SECOND]: '/purchase/2ndpurchase_quick.webp',
  [POINT_COURSE_PRICES.THIRD]: '/purchase/3rdpurchase_quick.webp',
  [POINT_COURSE_PRICES.FOURTH]: '/purchase/4thpurchase_quick.webp',
  [POINT_COURSE_PRICES.FIFTH]: '/purchase/5thpurchase_quick.webp',
};

export type PointPackage = {
  point: number;
  money: number;
  color?: string;
  text?: string;
  text2?: string;
  plus?: number;
  beforePoint?: number;
  isBonusExist?: boolean | undefined;
  packageId: string;
};

export type BonusPointPackage = {
  point: number;
  money: number;
  text: string;
  text2?: string;
  beforePoint: number;
  isBonusExist?: boolean | undefined;
  packageId: string;
};

/**
 * 基本ポイントパッケージ一覧
 * 価格は税込み（円）、ポイント数は付与される値
 */
export const POINT_PACKAGES: PointPackage[] = [
  {
    point: 12000,
    money: 14900,
    color: '#e9bf2a',
    text: '一番おトク！',
    plus: 3000,
    isBonusExist: false,
    packageId: 'renka_point_package_5',
  },
  {
    point: 8000,
    money: 10000,
    color: '#e9bf2a',
    plus: 2000,
    isBonusExist: false,
    packageId: 'renka_point_package_4',
  },
  {
    point: 3600,
    money: 4900,
    color: '#f54646',
    text: '一番人気！',
    plus: 500,
    isBonusExist: false,
    packageId: 'renka_point_package_3',
  },
  {
    point: 2000,
    money: 2900,
    color: '#808080',
    isBonusExist: false,
    packageId: 'renka_point_package_2',
  },
  {
    point: 550,
    money: 800,
    color: '#bababa',
    isBonusExist: false,
    packageId: 'renka_point_package_1',
  },
];

/**
 * ボーナスポイントパッケージ一覧
 * creditPurchaseCourseInfoに基づいて表示制御される
 */
export const BONUS_POINT_PACKAGES: BonusPointPackage[] = [
  {
    point: 1000,
    money: 800,
    text: '初回限定！',
    text2: '75%ポイント増量！',
    beforePoint: 550,
    isBonusExist: undefined, // 実行時にcreditPurchaseCourseInfo?.canBuyFirstBonusCourseを設定
    packageId: 'renka_point_package_1',
  },
  {
    point: 2500,
    money: 2900,
    text: '2回目限定！',
    text2: '30%おトク！',
    beforePoint: 2000,
    isBonusExist: undefined, // 実行時にcreditPurchaseCourseInfo?.canBuySecondBonusCourseを設定
    packageId: 'renka_point_package_2',
  },
  {
    point: 4400,
    money: 4900,
    text: '3回目限定！',
    text2: '800ptおトク！',
    beforePoint: 3600,
    isBonusExist: undefined, // 実行時にcreditPurchaseCourseInfo?.canBuyThirdBonusCourseを設定
    packageId: 'renka_point_package_3',
  },
  {
    point: 9000,
    money: 10000,
    text: '4回目限定！',
    text2: '1000ptおトク！',
    beforePoint: 8000,
    isBonusExist: undefined, // 実行時にcreditPurchaseCourseInfo?.canBuyFourthBonusCourseを設定
    packageId: 'renka_point_package_4',
  },
  {
    point: 14000,
    money: 14900,
    text: '5回目限定！',
    text2: '2000ptおトク！',
    beforePoint: 12000,
    isBonusExist: undefined, // 実行時にcreditPurchaseCourseInfo?.canBuyFifthBonusCourseを設定
    packageId: 'renka_point_package_5',
  },
];

/**
 * hideLowestPackageオプションを適用したポイントパッケージを取得
 * @param hideLowestPackage 最低額パッケージを非表示にするかどうか
 * @returns フィルタされたポイントパッケージ一覧
 */
export const getFilteredPointPackages = (
  hideLowestPackage: boolean = false,
): PointPackage[] => {
  if (hideLowestPackage) {
    // 最低額パッケージ（550pt/800円）を除外
    return POINT_PACKAGES.filter((pkg) => pkg.money !== 800);
  }
  return POINT_PACKAGES;
};

/**
 * ボーナスポイントパッケージをcreditPurchaseCourseInfoで更新して取得
 * @param creditPurchaseCourseInfo ボーナスコース購入可能情報
 * @returns ボーナス情報が設定されたボーナスポイントパッケージ一覧
 */
export const getBonusPointPackages = (creditPurchaseCourseInfo?: {
  canBuyFirstBonusCourse?: boolean;
  canBuySecondBonusCourse?: boolean;
  canBuyThirdBonusCourse?: boolean;
  canBuyFourthBonusCourse?: boolean;
  canBuyFifthBonusCourse?: boolean;
}): BonusPointPackage[] => {
  return BONUS_POINT_PACKAGES.map((pkg, index) => {
    const bonusFlags = [
      creditPurchaseCourseInfo?.canBuyFirstBonusCourse,
      creditPurchaseCourseInfo?.canBuySecondBonusCourse,
      creditPurchaseCourseInfo?.canBuyThirdBonusCourse,
      creditPurchaseCourseInfo?.canBuyFourthBonusCourse,
      creditPurchaseCourseInfo?.canBuyFifthBonusCourse,
    ];

    return {
      ...pkg,
      isBonusExist: bonusFlags[index],
    };
  });
};

/**
 * 金額からボーナスコースタイプを取得する
 * @param money 金額（円）
 * @returns ボーナスコースタイプ、該当なしの場合はnull
 */
export const getBonusCourseTypeByMoney = (
  money: number,
): SpecialPurchaseType | null => {
  const typeMap: Record<number, SpecialPurchaseType> = {
    [POINT_COURSE_PRICES.FIRST]: 'first',
    [POINT_COURSE_PRICES.SECOND]: 'second',
    [POINT_COURSE_PRICES.THIRD]: 'third',
    [POINT_COURSE_PRICES.FOURTH]: 'fourth',
    [POINT_COURSE_PRICES.FIFTH]: 'fifth',
  };
  return typeMap[money] ?? null;
};

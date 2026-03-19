import { region } from './region';

/**
 * 地域番号から地域名を取得する関数
 * @param regionNumber 地域番号
 * @returns 地域名（文字列）
 */
export const getRegionName = (regionNumber: number): string => {
  return region(regionNumber);
};

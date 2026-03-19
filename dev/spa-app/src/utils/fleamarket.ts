/**
 * フリマ関連のユーティリティ関数
 */

/**
 * 送料を計算する（価格の20%）
 * @param price 商品価格
 * @returns 送料（小数点以下切り捨て）
 */
export const calculateShippingFee = (price: number): number => {
  return Math.floor(price * 0.2);
};

/**
 * 商品価格と送料の合計を計算する
 * @param price 商品価格
 * @returns 合計金額（商品価格 + 送料）
 */
export const calculateTotalPrice = (price: number): number => {
  return price + calculateShippingFee(price);
};

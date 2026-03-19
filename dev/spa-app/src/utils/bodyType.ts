export const bodyTypeList = [
  '未設定',
  'スレンダー',
  '小柄',
  'ややスレンダー',
  '普通',
  'ぽっちゃり',
  'グラマー',
  'ややぽっちゃり',
  'セクシー',
  'かなりスレンダー',
  '長身',
  'マシュマロ',
  'モデル',
] as const;

export const notSettingBodyTypeNumber = bodyTypeList.indexOf('未設定');
export const slimBodyTypeNumber = bodyTypeList.indexOf('スレンダー');
export const shortBodyTypeNumber = bodyTypeList.indexOf('小柄');
export const somewhatSlimBodyTypeNumber =
  bodyTypeList.indexOf('ややスレンダー');
export const normalBodyTypeNumber = bodyTypeList.indexOf('普通');
export const chubbyBodyTypeNumber = bodyTypeList.indexOf('ぽっちゃり');
export const somewhatChubbyBodyTypeNumber =
  bodyTypeList.indexOf('ややぽっちゃり');
export const sexyBodyTypeNumber = bodyTypeList.indexOf('セクシー');
export const quiteSlimBodyTypeNumber = bodyTypeList.indexOf('かなりスレンダー');
export const tallBodyTypeNumber = bodyTypeList.indexOf('長身');
export const marshmallowBodyTypeNumber = bodyTypeList.indexOf('マシュマロ');
export const modelBodyTypeNumber = bodyTypeList.indexOf('モデル');
export type NotSettingBodyTypeNumber = typeof notSettingBodyTypeNumber;
export type SlimBodyTypeNumber = typeof slimBodyTypeNumber;
export type ShortBodyTypeNumber = typeof shortBodyTypeNumber;
export type SomewhatSlimBodyTypeNumber = typeof somewhatSlimBodyTypeNumber;
export type NormalBodyTypeNumber = typeof normalBodyTypeNumber;
export type ChubbyBodyTypeNumber = typeof chubbyBodyTypeNumber;
export type SomewhatChubbyBodyTypeNumber = typeof somewhatChubbyBodyTypeNumber;
export type SexyBodyTypeNumber = typeof sexyBodyTypeNumber;
export type QuiteSlimBodyTypeNumber = typeof quiteSlimBodyTypeNumber;
export type TallBodyTypeNumber = typeof tallBodyTypeNumber;
export type MarshmallowBodyTypeNumber = typeof marshmallowBodyTypeNumber;
export type ModelBodyTypeNumber = typeof modelBodyTypeNumber;

export type BodyTypeNumber =
  | NotSettingBodyTypeNumber
  | SlimBodyTypeNumber
  | ShortBodyTypeNumber
  | SomewhatSlimBodyTypeNumber
  | NormalBodyTypeNumber
  | ChubbyBodyTypeNumber
  | SomewhatChubbyBodyTypeNumber
  | SexyBodyTypeNumber
  | QuiteSlimBodyTypeNumber
  | TallBodyTypeNumber
  | MarshmallowBodyTypeNumber
  | ModelBodyTypeNumber;

export type BodyType = (typeof bodyTypeList)[number];

export const bodyType = (number: number): BodyType => {
  return bodyTypeList[number + 1] ?? '未設定';
};

export const bodyTypeNumber = (bodyType: BodyType): number => {
  const index = bodyTypeList.indexOf(bodyType);
  return index > 0 ? index - 1 : 0;
};

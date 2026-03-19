import liveChannelLableStyles from '@/styles/home/livechannel/LiveChannelMeetPeople.module.css';
import type { CallType } from './callView';
import { parseTimestamp } from './time';

const defaultHobby = '未設定' as const;
const defaultTupleList = [
  [-1, defaultHobby],
  [0, defaultHobby],
] as const;
const tupleList = [
  [1, '明るい'],
  [2, '愛嬌がある'],
  [3, '癒やし系'],
  [4, 'おっとり'],
  [5, 'Sっぽい'],
  [6, 'Mっぽい'],
  [7, '甘えん坊'],
  [8, 'リードします'],
  [9, 'コスプレ好き'],
  [10, '小悪魔'],
  [11, '話し上手'],
  [12, '聞き上手'],
] as const;

export const personalitiesList = [
  '未設定',
  '明るい',
  '愛嬌がある',
  '癒やし系',
  'おっとり',
  'Sっぽい',
  'Mっぽい',
  '甘えん坊',
  'リードします',
  'コスプレ好き',
  '小悪魔',
  '話し上手',
  '聞き上手',
];

const personalityList = tupleList.map((personality) => personality[1]);
export type Personality =
  | Array<typeof defaultHobby>
  | Array<(typeof personalityList)[number]>;

export const personality = (
  numbers: readonly number[] | undefined,
): Personality => {
  if (!numbers || numbers.length === 0) return [defaultHobby];
  if (
    numbers.some((number) =>
      defaultTupleList.some((tuple) => tuple[0] === number),
    )
  )
    return [defaultHobby];
  return Array.from(
    new Set(
      numbers
        .map((n) => n + 1)
        .filter((n1) => tupleList.some(([index]) => index === n1))
        .map((n2) => tupleList.find((tuple) => tuple[0] === n2)?.[1])
        .filter((v): v is NonNullable<typeof v> => v != null),
    ),
  );
};

export const personalityNumber = (personality: string): number => {
  const index = personalitiesList.indexOf(personality);
  return index > 0 ? index - 1 : 0;
};

/**
 * オンラインステータスの色を取得する
 * @param {string} lastOnlineTimestamp 最終オンライン時間
 * @returns {string} オンラインステータスの色
 */
export const determineOnlineStatusColor = (
  lastOnlineTimestamp: string,
): string => {
  const currentTime = Date.now();
  const lastOnlineTime = parseTimestamp(lastOnlineTimestamp);

  if (!lastOnlineTime) {
    return 'status-grey'; // default color in case of error or undefined
  }

  const diffTime = currentTime - lastOnlineTime.getTime();

  if (diffTime <= 8 * 60 * 60 * 1000) {
    // online within the last 8 hours
    return 'status-green'; // online
  } else if (diffTime <= 24 * 60 * 60 * 1000) {
    // online within the last 24 hours
    return 'status-orange'; // online within 24 hours
  } else {
    // online more than 24 hours ago
    return 'status-grey'; // online more than 24 hours ago
  }
};

/**
 * オンラインステータスの色を取得
 * @param time 最終ログイン時間
 * @returns オンラインステータスの色をtailwindのクラス名で返却する(tailwindのクラス名)
 */
export const getOnlineStatusColor = (time: string): string => {
  const now = new Date();
  const lastLogin = parseTimestamp(time);

  const diffTime = Math.abs(now.getTime() - lastLogin.getTime());
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

  if (diffHours <= 8) {
    return 'bg-green-500';
  } else if (diffHours <= 24) {
    return 'bg-yellow-500';
  } else {
    return 'bg-gray-500';
  }
};

/**
 * ライブチャンネルのラベルを取得する
 * @param {string} type ライブチャンネルのタイプ
 * @returns {string} ライブチャンネルのラベル
 */
export const defaultLabel = (type: CallType) => {
  switch (type) {
    case 'live':
      return liveChannelLableStyles.live_label;
    case 'videoCallFromStandby':
      return liveChannelLableStyles.video_call_label;
    default:
      return liveChannelLableStyles.video_call_label;
  }
};

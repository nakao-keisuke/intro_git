export const CONFIG = {
  APPLICATION_ID: '15',
  APPLICATION_NAME: {
    IOS: 'utano',
    WEB: 'utage',
  },
};

// ポーリング間隔（ミリ秒）
export const POLLING_INTERVAL_MS = 3000;

// 第二世界線アプリ一覧
const SecondAppsGroup = [
  '15',
  '16',
  '19',
  '23',
  '26',
  '24',
  '27',
  '28',
  '29',
  '30',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '37',
  '38',
  '40',
  '43',
  '48',
  '50',
  '57',
  '60',
  '68',
];

// 第二世界線アプリかどうかを判定
export const isSecondAppsGroup = (applicationId: string) => {
  return SecondAppsGroup.includes(applicationId);
};

import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type DummyRequest = JamboRequest & {
  api: 'dummy';
};

export type DummyResponseData = JamboResponseData;

// 必ず失敗する(code: 1)ダミーAPI
export const getDummyRequest: () => DummyRequest = () => {
  return {
    api: 'dummy',
  };
};

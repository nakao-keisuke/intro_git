import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type ListBookmarkRequest = JamboRequest & {
  api: 'list_bookmark';
  token: string;
  skip: 0;
  take: 72;
};

export type ListBookmarkResponseElementData = JamboResponseData & {
  readonly user_id: string;
  readonly user_name: string;
  readonly age: number;
  readonly region: number;
  readonly ava_id: string;
  readonly abt?: string;
  readonly voice_call_waiting?: boolean;
  readonly video_call_waiting?: boolean;
};

export const listBookmarkRequest = (token: string): ListBookmarkRequest => ({
  api: 'list_bookmark',
  token,
  skip: 0,
  take: 72,
});

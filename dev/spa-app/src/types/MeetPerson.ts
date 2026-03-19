import type { Region } from '@/utils/region';

export type MeetPerson = {
  readonly userId: string;
  readonly avatarId: string;
  readonly about: string;
  readonly age: number;
  readonly userName: string;
  readonly region: Region;
  readonly voiceCallWaiting: boolean;
  readonly videoCallWaiting: boolean;
  readonly isNewUser: boolean;
  readonly isCalling: boolean;
  readonly lastLoginTime: string;
  readonly hasStory: boolean;
  readonly isListedOnFleaMarket: boolean;
  readonly bustSize?: string;
};

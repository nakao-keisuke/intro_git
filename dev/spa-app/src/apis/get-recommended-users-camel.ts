import type { JamboRequest } from '@/types/JamboApi';

type GetRecommendedUsersRequest = JamboRequest & {
  readonly api: 'get_recommended_users';
  readonly token: string;
};

export type RecommendedUserData = {
  readonly userId: string;
  readonly userName: string;
  readonly age: number;
  readonly region: number;
  readonly avaId: string;
  readonly voiceCallWaiting: boolean;
  readonly videoCallWaiting: boolean;
  readonly abt: string;
  readonly lastLogin: string;
  readonly isNewUser?: boolean;
  readonly isCalling?: boolean;
  readonly hasStory?: boolean;
  readonly gender: number;
  readonly showingFaceStatus: number;
  readonly talkTheme: number;
  readonly stepToCall: number;
  readonly hasLovense?: boolean;
  readonly hasStoryMovie?: boolean;
  readonly isOnline?: boolean;
  readonly appVersion?: number | null;
  readonly bustSize?: string | null;
  readonly bckstgNum?: number;
  readonly housemate?: string;
  readonly isSent?: boolean;
  readonly looks?: string;
  readonly constellation?: string;
  readonly holidays?: string;
  readonly instantCallWaiting?: boolean;
  readonly translatedUsernameInEnglish?: string;
  readonly lat?: number;
  readonly alcohol?: string;
  readonly marriageHistory?: number;
  readonly hLevel?: string | null;
  readonly applicationId?: string;
  readonly pbimgNum?: number;
  readonly preferredBodyTypes?: number[];
  readonly bodyType?: number[];
  readonly job?: string;
  readonly personalities?: number[];
  readonly status?: string | null;
  readonly isFavorite?: boolean;
  readonly smokingStatus?: string;
  readonly long?: number;
  readonly oftenVisitTime?: string;
};

export const getRecommendedUsersRequest = (
  token: string,
): GetRecommendedUsersRequest => ({
  api: 'get_recommended_users',
  token,
});

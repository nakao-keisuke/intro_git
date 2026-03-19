import type { MeetPerson } from '@/types/MeetPerson';
import type { ShowingFace } from '@/utils/showingFace';
import type { StepToCall } from '@/utils/stepToCall';
import type { TalkTheme } from '@/utils/talkTheme';

export type RecommendedUser = MeetPerson & {
  hasLovense: boolean;
  talk_theme: TalkTheme;
  showing_face_status: ShowingFace;
  step_to_call: StepToCall;
};

export type FavoriteAnotherUsersResponse = {
  recommendedUsers: RecommendedUser[];
};

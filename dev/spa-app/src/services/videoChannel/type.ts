import type { MeetPerson } from '@/types/MeetPerson';
import type { ShowingFace } from '@/utils/showingFace';
import type { StepToCall } from '@/utils/stepToCall';
import type { TalkTheme } from '@/utils/talkTheme';

export type VideoMeetPerson = MeetPerson & {
  hasLovense: boolean;
  lastActionStatusLabel: string;
  talkTheme: TalkTheme;
  showingFaceStatus: ShowingFace;
  stepToCall: StepToCall;
  lastCallEndTime?: string;
  bustSize?: string;
};

export type VideoChannelUser = {
  meetPerson: VideoMeetPerson;
};

export type VideoChannelResponse = {
  videoUsers: VideoChannelUser[];
  totalCount: number;
};

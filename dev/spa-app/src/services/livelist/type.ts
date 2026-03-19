import type { BodyType } from '@/utils/bodyType';
import type { LiveCallType } from '@/utils/callView';
import type { Hobby } from '@/utils/hobby';
import type { MarriageHistory } from '@/utils/marriageHistory';
import type { Personality } from '@/utils/personality';
import type { Region } from '@/utils/region';
import type { ShowingFace } from '@/utils/showingFace';
import type { StepToCall } from '@/utils/stepToCall';
import type { TalkTheme } from '@/utils/talkTheme';

export interface LiveListChannel {
  broadcaster: {
    userName: string;
    age: number;
    about: string;
    avatarId: string;
    userId: string;
    isNewUser: boolean;
    hobby: Hobby;
    bodyType: BodyType;
    marriageHistory: MarriageHistory;
    personality: Personality;
    region: Region;
    showingFace: ShowingFace;
    stepToCall: StepToCall;
    talkTheme: TalkTheme;
    isLive: boolean;
    lastLoginTime: string;
    oftenVisitTime: string;
    job: string;
    looks: string;
    holidays: string;
    hometown: string;
    bloodType: string;
    housemate: string;
    alcohol: string;
    smokingStatus: string;
    constellation: string;
    hasLovense: boolean;
    applicationId: string;
  };
  channelInfo: {
    rtcChannelToken: string;
    appId: string;
    channelId: string;
    userCount: number;
    thumbnailImageId: string;
  };
  type: LiveCallType;
  isInProgress: boolean;
}

export interface LiveListResponse {
  liveChannels: LiveListChannel[];
}

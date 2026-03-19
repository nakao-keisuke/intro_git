import type { ChannelInfo } from '@/types/ChannelInfo';
import type { BodyType } from '@/utils/bodyType';
import type { Hobby } from '@/utils/hobby';
import type { MarriageHistory } from '@/utils/marriageHistory';
import type { Personality } from '@/utils/personality';
import type { Region } from '@/utils/region';
import type { ShowingFace } from '@/utils/showingFace';
import type { StepToCall } from '@/utils/stepToCall';
import type { TalkTheme } from '@/utils/talkTheme';

export type LiveChannel = {
  readonly broadcaster: {
    readonly userName: string;
    readonly age: number;
    readonly about: string;
    readonly avatarId: string;
    readonly userId: string;
    readonly isNewUser: boolean;
    readonly bodyType: BodyType;
    readonly hobby: Hobby;
    readonly marriageHistory: MarriageHistory;
    readonly personality: Personality;
    readonly region: Region;
    readonly showingFace: ShowingFace;
    readonly stepToCall: StepToCall;
    readonly talkTheme: TalkTheme;
    readonly isLive: boolean;
    readonly lastLoginTime: string;
    readonly oftenVisitTime: string;
    readonly job: string;
    readonly looks: string;
    readonly holidays: string;
    readonly hometown: string;
    readonly bloodType: string;
    readonly housemate: string;
    readonly smokingStatus: string;
    readonly alcohol: string;
    readonly constellation: string;
    readonly isIdentified?: boolean;
    readonly hasLovense: boolean;
    readonly bustSize?: string;
    readonly hLevel?: string;
    readonly applicationId?: string;
  };
  readonly channelInfo: ChannelInfo;
  readonly isInProgress?: boolean; // 配信中フラグ
};

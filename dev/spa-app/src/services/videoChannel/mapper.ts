import type { RecentVideoCallUser } from '@/services/home/type';
import { type Region, region } from '@/utils/region';
import { type ShowingFace, showingFace } from '@/utils/showingFace';
import { type StepToCall, stepToCall } from '@/utils/stepToCall';
import { type TalkTheme, talkTheme } from '@/utils/talkTheme';
import type { VideoChannelUser } from './type';

export const mapRecentVideoCallUserToVideoChannelUser = (
  item: RecentVideoCallUser,
): VideoChannelUser | null => {
  if (!item.user) {
    return null;
  }

  return {
    meetPerson: {
      userId: item.user.userId,
      userName: item.user.userName,
      age: item.user.age,
      region: region(item.user.region) as Region,
      avatarId: item.user.avaId,
      voiceCallWaiting: item.user.voiceCallWaiting,
      videoCallWaiting: item.user.videoCallWaiting,
      about: item.user.abt || '',
      lastLoginTime: item.user.lastLoginTime,
      isNewUser: item.user.isNewUser,
      isCalling: item.user.isCalling,
      hasStory: item.user.hasStoryMovie,
      isListedOnFleaMarket: false,
      hasLovense: item.hasLovense || item.user.hasLovense || false,
      lastActionStatusLabel: '',
      lastCallEndTime: item.endTime,
      talkTheme: talkTheme(item.user.talkTheme) as TalkTheme,
      showingFaceStatus: showingFace(
        item.user.showingFaceStatus,
      ) as ShowingFace,
      stepToCall: stepToCall(item.user.stepToCall) as StepToCall,
      ...(item.user.bustSize ? { bustSize: item.user.bustSize } : {}),
    },
  };
};

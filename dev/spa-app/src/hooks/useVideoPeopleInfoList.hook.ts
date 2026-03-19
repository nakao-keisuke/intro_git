import { useEffect, useState } from 'react';
import { GET_VIDEO_USERS } from '@/constants/endpoints';
import { useLiveStore } from '@/features/live/store/liveStore';
import type { MeetPerson } from '@/types/MeetPerson';
import { getFromNext } from '@/utils/next';
import type { ShowingFace } from '@/utils/showingFace';
import type { StepToCall } from '@/utils/stepToCall';
import type { TalkTheme } from '@/utils/talkTheme';

export type MeetPersonWithTalkTheme = MeetPerson & {
  hasLovense: boolean;
  last_action_status_label: string;
  talk_theme: TalkTheme;
  showing_face_status: ShowingFace;
  step_to_call: StepToCall;
};

export const useVideoPeopleInfoList = () => {
  const isToRefresh = useLiveStore((s) => s.isNeedToRefreshLivePeople);
  const setIsToRefresh = useLiveStore((s) => s.setIsNeedToRefreshLivePeople);
  const [videoPeopleInfoList, setVideoPeopleInfoList] = useState<
    { meetPerson: MeetPersonWithTalkTheme }[] | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVideoPeopleList = async () => {
    try {
      setIsLoading(true);
      const responseData = await getFromNext<{
        recommendedUsers: (MeetPerson & {
          hasLovense: boolean;
          last_action_status_label: string;
          talk_theme: TalkTheme;
          showing_face_status: ShowingFace;
          step_to_call: StepToCall;
          isListedOnFleaMarket: boolean;
        })[];
      }>(GET_VIDEO_USERS);
      if (responseData.type === 'error') {
        throw new Error('Error fetching video people list');
      }
      const newMeetPeople: { meetPerson: MeetPersonWithTalkTheme }[] =
        responseData.recommendedUsers.map((user) => ({
          meetPerson: {
            userId: user.userId,
            userName: user.userName,
            age: user.age,
            region: user.region,
            about: user.about,
            avatarId: user.avatarId,
            isNewUser: user.isNewUser,
            voiceCallWaiting: user.voiceCallWaiting,
            videoCallWaiting: user.videoCallWaiting,
            isCalling: user.isCalling,
            lastLoginTime: user.lastLoginTime,
            hasStory: user.hasStory,
            isListedOnFleaMarket: user.isListedOnFleaMarket,
            hasLovense: user.hasLovense,
            last_action_status_label: user.last_action_status_label,
            talk_theme: user.talk_theme,
            showing_face_status: user.showing_face_status,
            step_to_call: user.step_to_call,
          },
        }));
      setVideoPeopleInfoList(newMeetPeople);
    } catch (error) {
      console.error('Failed to fetch video people list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideoPeopleList();
  }, []);

  useEffect(() => {
    if (!isToRefresh) return;
    setIsToRefresh(false);
    fetchVideoPeopleList();
  }, [isToRefresh]);

  return { videoPeopleInfoList, isLoading };
};

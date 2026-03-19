import { useEffect, useState } from 'react';
import { GET_UTAGE_VIDEO_CALL_CHANNELS } from '@/constants/endpoints';
import { useLiveStore } from '@/features/live/store/liveStore';
import type { ChannelInfo } from '@/types/ChannelInfo';
import type { LiveChannel } from '@/types/LiveChannel';
import type { MeetPerson } from '@/types/MeetPerson';
import {
  getLiveCallView,
  type LiveCallType,
  type LiveCallView,
} from '@/utils/callView';
import { getFromNext } from '@/utils/next';

export type MeetPersonWithTalkTheme = MeetPerson & {
  talkTheme: string;
  hasLovense: boolean;
  userCount: number;
  hLevel: string;
  bustSize: string;
};

export const useLivePeopleInfoList = () => {
  const isToRefresh = useLiveStore((s) => s.isNeedToRefreshLivePeople);
  const setIsToRefresh = useLiveStore((s) => s.setIsNeedToRefreshLivePeople);
  const [livePeopleInfoList, setLivePeopleInfoList] = useState<
    | ({ meetPerson: MeetPersonWithTalkTheme } & {
        liveCallView: LiveCallView;
        isInProgress?: boolean;
        hasLovense: boolean;
        userCount: number;
        channelInfo: ChannelInfo;
        hLevel: string;
        bustSize: string;
      })[]
    | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLiveChannelList = async () => {
    setIsLoading(true);
    const responseData = await getFromNext<
      (LiveChannel & { type: LiveCallType; hasLovense: boolean })[]
    >(GET_UTAGE_VIDEO_CALL_CHANNELS);
    if (responseData.type === 'error') {
      setTimeout(() => setIsLoading(false), 2000);
      return;
    }

    // データを変換
    const newMeetPeople = responseData.map((e) => ({
      meetPerson: {
        userId: e.broadcaster.userId,
        userName: e.broadcaster.userName,
        age: e.broadcaster.age,
        region: e.broadcaster.region,
        about: e.broadcaster.about,
        avatarId: e.broadcaster.avatarId,
        isNewUser: e.broadcaster.isNewUser,
        voiceCallWaiting: false,
        videoCallWaiting: false,
        isCalling: false,
        lastLoginTime: e.broadcaster.lastLoginTime,
        hasStory: false,
        talkTheme: e.broadcaster.talkTheme,
        hasLovense: e.broadcaster.hasLovense,
        userCount: e.channelInfo.userCount,
        hLevel: e.broadcaster.hLevel,
        bustSize: e.broadcaster.bustSize,
      },
      liveCallView: getLiveCallView('live'),
      isInProgress: e.isInProgress,
      channelInfo: {
        rtcChannelToken: e.channelInfo.rtcChannelToken,
        rtmChannelToken: e.channelInfo.rtmChannelToken,
        appId: e.channelInfo.appId,
        channelId: e.channelInfo.channelId,
        peerId: e.channelInfo.peerId,
        userCount: e.channelInfo.userCount,
        thumbnailImageId: e.channelInfo.thumbnailImageId,
      },
    }));
    // ビデオチャット配信中のユーザーを先頭に、待機中ユーザーをシャッフル
    const videoChatUsers = newMeetPeople.filter((e) => e.isInProgress === true);
    const otherUsers = newMeetPeople.filter((e) => e.isInProgress !== true);

    // otherUsersをシャッフルする関数
    const shuffleArray = (array: any) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // 要素の交換
      }
      return array;
    };

    const shuffledOtherUsers = shuffleArray(otherUsers);

    // ビデオチャット中のユーザーを優先して、配列をマージ
    const finalList = [...videoChatUsers, ...shuffledOtherUsers];

    setLivePeopleInfoList(finalList);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLiveChannelList();
  }, []);
  useEffect(() => {
    if (!isToRefresh) return;
    setIsToRefresh(false);
    fetchLiveChannelList();
  }, [isToRefresh]);

  return { livePeopleInfoList, isLoading };
};

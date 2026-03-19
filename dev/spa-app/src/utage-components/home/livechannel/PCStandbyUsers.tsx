import { memo } from 'react';
import { useLivePeopleInfoList } from '@/hooks/useLivePeopleInfoList.hook';
import styles from '@/styles/home/livechannel/PCLiveChannelMeetpeople.module.css';

const _RefleshPic = '/reflesh.webp';

import { ClipLoader } from 'react-spinners';
import type { MeetPerson } from '@/types/MeetPerson';
import PCLiveUser from './PCLiveUser';
import PCStandByChannelListTitle from './PCStandByChannelListTitle';
import PCStandbyUser from './PCStandbyUser';

type MeetPersonExtended = MeetPerson & {
  isLive: boolean;
  isCallWaiting: boolean;
  rank?: number;
  hasLovense: boolean;
};

const LiveAndStandbyUsers = memo(
  ({
    totalRankingMeetPeople,
  }: {
    totalRankingMeetPeople: MeetPersonExtended[];
  }) => {
    const { livePeopleInfoList, isLoading } = useLivePeopleInfoList();

    // 今すぐ話せる女の子
    const filteredStandbyItems = livePeopleInfoList?.filter(
      (item) =>
        item.liveCallView.type === 'live' ||
        item.liveCallView.type === 'videoCallFromStandby',
    );

    // 配信中のライブ
    const filteredLiveItems = livePeopleInfoList?.filter(
      (item) => item.liveCallView.type === 'live',
    );

    const StandbyItems = livePeopleInfoList?.map(
      ({ meetPerson, liveCallView, channelInfo }) => {
        return (
          <PCStandbyUser
            meetPerson={meetPerson}
            liveCallView={liveCallView}
            channelInfo={channelInfo}
            rank={
              totalRankingMeetPeople.find(
                (person) => person.userId === meetPerson.userId,
              )?.rank
            }
            key={meetPerson.userId}
          />
        );
      },
    );

    const _LiveItems = filteredLiveItems?.map(
      ({ meetPerson, liveCallView, channelInfo }) => {
        return (
          <PCLiveUser
            user={meetPerson}
            liveCallView={liveCallView}
            channelInfo={channelInfo}
            key={meetPerson.userId}
          />
        );
      },
    );

    return (
      <div>
        {/* 今すぐ話せる女の子 */}
        <div className={styles.titleContainer}>
          <PCStandByChannelListTitle />
        </div>
        {isLoading ? (
          <div className={styles.none}>
            <ClipLoader size={24} />
          </div>
        ) : filteredStandbyItems &&
          filteredLiveItems &&
          filteredStandbyItems.length > 0 ? (
          <div className={styles.liveItemsContainer}>{StandbyItems}</div>
        ) : (
          <div className={styles.containerFixedHeight}>
            <li className={styles.none}>現在配信中のユーザーはいません。</li>
          </div>
        )}
      </div>
    );
  },
);

export default LiveAndStandbyUsers;
LiveAndStandbyUsers.displayName = 'LiveChannelMeetPeople';

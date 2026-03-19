import { useEffect, useState } from 'react';
import VideoChannelListTitle from '@/components/home/livechannel/VideoChannelListTitle';
import VideoChannelMeetPeople from '@/components/home/livechannel/VideoChannelMeetPeople';
import { useVideoPeopleInfoList } from '@/hooks/useVideoPeopleInfoList.hook';
import styles from '@/styles/chatlist/TopMessageListTitle.module.css';
import type { MeetPerson } from '@/types/MeetPerson';

type MeetPersonExtended = MeetPerson & {
  isLive: boolean;
  isCallWaiting: boolean;
  rank?: number;
  hasLovense: boolean;
};

type Props = {
  totalRankingMeetPeople: MeetPersonExtended[];
};

const VideoChannelListCard = ({ totalRankingMeetPeople }: Props) => {
  const { videoPeopleInfoList, isLoading } = useVideoPeopleInfoList();
  const [listCount, setListCount] = useState(0);
  const filterVideoPeopleInfoList = videoPeopleInfoList?.filter(
    ({ meetPerson }) => meetPerson.videoCallWaiting,
  );

  useEffect(() => {
    if (filterVideoPeopleInfoList) {
      setListCount(filterVideoPeopleInfoList.length);
    }
  }, [filterVideoPeopleInfoList]);

  return (
    <div style={{ height: '180px' }}>
      <VideoChannelListTitle listCount={listCount} />
      {isLoading ? (
        <div className={styles.containerFixedHeight}>
          <div className={styles.loader}></div>
        </div>
      ) : (
        <VideoChannelMeetPeople
          totalRankingMeetPeople={totalRankingMeetPeople}
        />
      )}
    </div>
  );
};

export default VideoChannelListCard;

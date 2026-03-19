import styles from '@/styles/home/livechannel/PCLiveChannelListCard.module.css';
import PCLiveAndStandbyUsers from './PCStandbyUsers';

const PCLiveChannelListCard = () => {
  return (
    <div className={styles.wrapper}>
      <PCLiveAndStandbyUsers totalRankingMeetPeople={[]} />
    </div>
  );
};

export default PCLiveChannelListCard;

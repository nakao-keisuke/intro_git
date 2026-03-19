import styles from '@/styles/home/livechannel/PCLiveChannelListTitle.module.css';

const PCLiveChannelListTitle = () => {
  return (
    <div className={styles.content}>
      <div className={styles.title}>　配信中の女の子</div>

      {/* <Link href="/live-list/pc">
        <div className={styles.button}>　もっと見る　&gt;</div>
      </Link> */}
    </div>
  );
};

export default PCLiveChannelListTitle;

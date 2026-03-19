import { Link } from '@tanstack/react-router';
import styles from '@/styles/home/livechannel/PCLiveChannelListTitle.module.css';

const PCStandByChannelListTitle = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className={styles.content}>
      <h5 className={styles.title}>　今すぐ話せる女の子</h5>

      <div className={styles.reload} onClick={handleRefresh}>
        リスト更新<span className={styles.dliRedo}></span>
      </div>

      <Link href="/live-list">
        <div className={styles.button}>　もっと見る　&gt;</div>
      </Link>
    </div>
  );
};

export default PCStandByChannelListTitle;

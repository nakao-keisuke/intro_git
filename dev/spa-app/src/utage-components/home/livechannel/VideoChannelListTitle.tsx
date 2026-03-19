import { Link } from '@tanstack/react-router';
import styles from '@/styles/home/livechannel/LiveChannelListTitle.module.css';

const VideoChannelListTitle = ({ listCount }: { listCount: number }) => {
  return (
    <div className={styles.content}>
      <h5 className={styles.title}>
        　今すぐビデオ通話ができるユーザー
        <div className={styles.count}>
          現在<span className={styles.countNumber}>{listCount}</span>人
        </div>
      </h5>
      <div className={styles.right}>
        <Link href="/video-list">
          <div className={styles.all}>すべて見る</div>
        </Link>
      </div>
    </div>
  );
};

export default VideoChannelListTitle;

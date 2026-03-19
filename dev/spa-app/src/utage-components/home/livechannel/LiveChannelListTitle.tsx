// Image component removed (use <img> directly);
import styles from '@/styles/home/livechannel/LiveChannelListTitle.module.css';

const RefleshPic = '/reflesh.webp';

const LiveChannelListTitle = () => {
  const handleRefresh = () => {
    window.location.reload();
  };
  return (
    <div className={styles.content}>
      <h5 className={styles.title}>　今すぐ話せる女の子</h5>
      <div className={styles.reload} onClick={handleRefresh}>
        <Image src={RefleshPic} alt="switcher" width={20} height={20} />
        <br />
        更新
      </div>
    </div>
  );
};

export default LiveChannelListTitle;

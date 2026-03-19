// Image component removed (use <img> directly);
import styles from '@/styles/home/meetpeople/MeetPeopleListTitle.module.css';

const RefleshPic = '/reflesh.webp';

const MeetPeopleListTitle = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className={styles.content}>
      <h5 className={styles.title}>　すべての女の子一覧</h5>
      <div className={styles.search} onClick={handleRefresh}>
        <Image src={RefleshPic} alt="switcher" width={20} height={20} />
        <br />
        更新
      </div>
    </div>
  );
};

export default MeetPeopleListTitle;

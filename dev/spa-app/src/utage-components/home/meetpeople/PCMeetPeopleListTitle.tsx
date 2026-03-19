// Image component removed (use <img> directly);
import styles from '@/styles/home/meetpeople/PCMeetPeopleListTitle.module.css';
import type { MeetPeopleMode } from './MeetPeopleListCard';
import PCMeetPeopleSearchModal from './PCMeetPeopleSearchModal';

const filterPic = '/filter.webp';

import { useState } from 'react';

type Props = {
  currentMode: MeetPeopleMode;
  changeMode: (modeTo: MeetPeopleMode) => void;
};

const PCMeetPeopleListTitle = ({ currentMode, changeMode }: Props) => {
  const [searchModal, setSearchModal] = useState(false);
  const handleRefresh = () => {
    window.location.reload();
  };
  return (
    <>
      <div className={styles.container}>
        <div className={styles.title}>　女の子一覧</div>

        <div className={styles.rabel}>
          <div
            className={
              currentMode === 'login' ? styles.selected : styles.notselected
            }
            style={{ display: '' }}
            onClick={() => changeMode('login')}
          >
            ログイン
          </div>
          <div
            className={
              currentMode === 'ranking' ? styles.selected : styles.notselected
            }
            style={{ display: '' }}
            onClick={() => changeMode('ranking')}
          >
            ランキング
          </div>
          <div
            className={
              currentMode === 'new' ? styles.selected : styles.notselected
            }
            style={{ display: '' }}
            onClick={() => changeMode('new')}
          >
            新人
          </div>
        </div>
        <div
          className={styles.search}
          onClick={() => {
            setSearchModal(true);
          }}
        >
          <Image
            src={filterPic}
            alt="switcher"
            width={20}
            height={20}
            className={styles.filterPic}
          />
          <br />
          <div className={styles.filterText}>絞り込み</div>
        </div>
        <div className={styles.reload} onClick={handleRefresh}>
          リスト更新<span className={styles.dliRedo}></span>
        </div>
      </div>

      {searchModal && (
        <PCMeetPeopleSearchModal
          onClose={() => {
            setSearchModal(false);
          }}
        />
      )}
    </>
  );
};

export default PCMeetPeopleListTitle;

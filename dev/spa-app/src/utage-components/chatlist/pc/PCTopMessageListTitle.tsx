import styles from '@/styles/chatlist/PCChatList.module.css';
import type { ListConversationType } from '@/types/ListConversationType';

type Props = {
  selectedTab: ListConversationType;
  onTabChange: (tab: ListConversationType) => void;
};

const PCTopMessageListTitle = ({ selectedTab, onTabChange }: Props) => {
  const handleChangeTab = (tab: ListConversationType) => {
    onTabChange(tab);
  };

  const tabs: { key: ListConversationType; label: string }[] = [
    { key: 'all', label: 'すべて' },
    { key: 'conversation', label: 'やり取り中' },
    { key: 'bookmark', label: 'お気に入り' },
  ];

  return (
    <div className={styles.combinedHeader}>
      <div className={styles.title}>
        <div className={styles.bar}>
          {tabs.map(({ key, label }) => (
            <span
              key={key}
              className={selectedTab === key ? styles.active : styles.barItem}
              onClick={() => handleChangeTab(key)}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PCTopMessageListTitle;

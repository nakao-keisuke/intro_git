// Image component removed (use <img> directly);
import { useState } from 'react';
import styles from '@/styles/videocall/Tabs.module.css';

const lovenseWhitePic = '/lovense.webp';
const _lovenseGrayPic = '/lovense_gray.webp';
const lovensePinkPic = '/lovense_pink.webp';
const presentMenuPic = '/live/menu.webp';

export type TabProps = {
  tabs: { title: 'プレゼントメニュー' | 'Lovense'; content: React.ReactNode }[];
};

export const Tabs: React.FC<TabProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  return (
    <div className={styles.container}>
      <ul className={styles.tabList}>
        {tabs.map((tab, index) => (
          <li key={index} className={styles.tabItem}>
            <button
              className={`${styles.tabButton} ${
                activeTab === index ? styles.activeTabButton : ''
              }`}
              onClick={() => handleTabClick(index)}
            >
              {tab.title === 'Lovense' && (
                <Image
                  src={activeTab === index ? lovensePinkPic : lovenseWhitePic}
                  alt="lovense icon"
                />
              )}
              {tab.title === 'プレゼントメニュー' && (
                <Image src={presentMenuPic} alt="present menu icon" />
              )}
              {tab.title}
            </button>
          </li>
        ))}
      </ul>
      {tabs[activeTab] && <div>{tabs[activeTab]?.content}</div>}
    </div>
  );
};

import type React from 'react';
import {
  NOTIFICATION_TYPE_LABELS,
  NotificationType,
} from '@/constants/notificationTypes';
import mobileStyles from '@/styles/Notification.module.css';
import pcStyles from '@/styles/PCNotification.module.css';

type Props = {
  selectedTab: NotificationType;
  onTabChange: (tabType: NotificationType) => void;
  usePC?: boolean;
  hasUnread?: (tabType: NotificationType) => boolean;
};

const NotificationTabs: React.FC<Props> = ({
  selectedTab,
  onTabChange,
  usePC = false,
  hasUnread,
}) => {
  const styles = usePC ? pcStyles : mobileStyles;

  return (
    <div className={styles.barback}>
      <div className={usePC ? styles.choicebar : styles.bar}>
        {Object.values(NotificationType).map((tabType) => (
          <div
            key={tabType}
            className={`${styles.barItem} ${
              selectedTab === tabType ? styles.active : ''
            }`}
            onClick={() => onTabChange(tabType)}
          >
            <div className={styles.tabContent}>
              {hasUnread?.(tabType) && <div className={styles.unreadDot} />}
              {NOTIFICATION_TYPE_LABELS[tabType]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationTabs;

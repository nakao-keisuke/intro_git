import { IconChevronLeft } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import type React from 'react';
import styles from '@/styles/fleamarket/transaction-list.module.css';

type TransactionTab = 'buying' | 'bought';

interface TransactionTabHeaderProps {
  activeTab?: TransactionTab;
  onTabChange?: (tab: TransactionTab) => void;
  onBack?: () => void;
  showHeader?: boolean;
}

const TransactionTabHeader: React.FC<TransactionTabHeaderProps> = ({
  activeTab = 'buying',
  onTabChange,
  onBack,
  showHeader = true,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleTabChange = (tab: TransactionTab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      // デフォルトのナビゲーション動作
      if (tab === 'buying') {
        router.push('/fleamarket/transactions/buying');
      } else if (tab === 'bought') {
        router.push('/fleamarket/transactions/bought');
      }
    }
  };

  return (
    <>
      {showHeader && (
        <div className={styles.header}>
          <button onClick={handleBack} className={styles.backButton}>
            <IconChevronLeft size={20} />
          </button>
          <h1 className={styles.title}>取引中</h1>
        </div>
      )}

      {/* タブ */}
      <div className={styles.tabsSection}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === 'buying' ? styles.active : ''
            }`}
            onClick={() => handleTabChange('buying')}
          >
            取引中
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === 'bought' ? styles.active : ''
            }`}
            onClick={() => handleTabChange('bought')}
          >
            過去の取引
          </button>
        </div>
      </div>
    </>
  );
};

export default TransactionTabHeader;

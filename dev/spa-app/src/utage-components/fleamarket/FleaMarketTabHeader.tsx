import { IconChecklist, IconChevronLeft } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useSession } from '#/hooks/useSession';
import type React from 'react';
import { useEffect, useState } from 'react';
import { getFleaMarketTransactionListRequest } from '@/apis/get-flea-market-transaction-list';
import { GET_FLEA_MARKET_TRANSACTION_LIST } from '@/constants/endpoints';
import styles from '@/styles/fleamarket/seller-detail.module.css';
import type { TransactionWithItem } from '@/types/fleamarket/shared';
import { postToNext } from '@/utils/next';

type Tab = 'items' | 'transactions' | 'favorites';

interface FleaMarketTabHeaderProps {
  sellerId?: string;
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
  onBack?: () => void;
}

const FleaMarketTabHeader: React.FC<FleaMarketTabHeaderProps> = ({
  sellerId,
  activeTab = 'items',
  onTabChange,
  onBack,
}) => {
  const router = useRouter();
  const session = useSession();
  const [todoCount, setTodoCount] = useState<number>(0);

  const token = session.data?.user.token || (router.query.sid as string) || '';

  useEffect(() => {
    if (!token || !session.data?.user?.id) {
      return;
    }

    fetchTodoCount();
  }, [token, session.data?.user?.id]);

  const fetchTodoCount = async () => {
    try {
      const request = getFleaMarketTransactionListRequest(
        token,
        session.data?.user?.id || '',
        1,
        100,
      );

      const response = await postToNext<{
        code: number;
        data: {
          transactions: TransactionWithItem[];
          total: number;
        } | null;
        message?: string;
      }>(GET_FLEA_MARKET_TRANSACTION_LIST, request);

      if (response.type !== 'error' && response.code === 0) {
        const responseData = response.data;

        if (responseData?.transactions) {
          // shipping ステータス（発送済み）の取引のみカウント
          const todoTransactions = responseData.transactions.filter(
            (transactionData: TransactionWithItem) => {
              const transaction = transactionData.transaction;
              return (
                transaction.status === 'shipping' &&
                transaction.buyer_id === session.data?.user?.id
              );
            },
          );

          setTodoCount(todoTransactions.length);
        }
      }
    } catch (_error) {
      // エラーハンドリング
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/my-page');
    }
  };

  const handleTabChange = (tab: Tab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      // デフォルトのナビゲーション動作
      if (tab === 'items') {
        router.push('/fleamarket/items');
      } else if (tab === 'transactions') {
        router.push('/fleamarket/transactions');
      } else if (tab === 'favorites') {
        router.push('/fleamarket/favorites');
      }
    }
  };

  return (
    <>
      <div className={styles.header}>
        <button onClick={handleBack} className={styles.backButton}>
          <IconChevronLeft style={{ width: '30px', height: '30px' }} />
        </button>
        <h1 className={styles.title}>
          {sellerId ? '出品者の商品一覧' : 'フリーマーケット'}
        </h1>
        <button
          onClick={() => router.push('/fleamarket/todos')}
          className={styles.checkButton}
        >
          <div className={styles.checkButtonContainer}>
            <IconChecklist style={{ width: '28px', height: '28px' }} />
            {todoCount > 0 && (
              <span className={styles.notificationBadge}>
                {todoCount > 99 ? '99+' : todoCount}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* タブナビゲーション */}
      {!sellerId && (
        <div className={styles.tabContainer}>
          <button
            className={`${styles.tabButton} ${
              activeTab === 'items' ? styles.activeTab : ''
            }`}
            onClick={() => handleTabChange('items')}
          >
            すべての出品
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === 'favorites' ? styles.activeTab : ''
            }`}
            onClick={() => handleTabChange('favorites')}
          >
            いいね
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === 'transactions' ? styles.activeTab : ''
            }`}
            onClick={() => handleTabChange('transactions')}
          >
            取引履歴
          </button>
        </div>
      )}
    </>
  );
};

export default FleaMarketTabHeader;

import { IconBox, IconShoppingBag } from '@tabler/icons-react';
// Image component removed (use <img> directly);
import { useRouter } from 'next/router';
import { useSession } from '#/hooks/useSession';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  type FleaMarketTransactionListItem,
  getFleaMarketTransactionListRequest,
} from '@/apis/get-flea-market-transaction-list';
import { GET_FLEA_MARKET_TRANSACTION_LIST } from '@/constants/endpoints';
import styles from '@/styles/fleamarket/transaction-list.module.css';
import type {
  TransactionDisplay,
  TransactionListResponseData,
} from '@/types/fleamarket/transaction';
import {
  formatDate,
  getBoughtTransactions,
  getBuyingTransactions,
  getStatusClass,
  getStatusLabel,
  transformTransactionItemToDisplay,
} from '@/utils/fleamarket/transaction';
import { imageUrlForFleaMarket } from '@/utils/image';
import { postToNext } from '@/utils/next';
import TransactionTabHeader from './TransactionTabHeader';

interface FleaMarketTransactionListProps {
  token?: string;
  userId?: string | undefined;
  transactionType?: 'buy' | 'sell' | 'all';
  onTransactionsLoaded?: (totalCount: number, hasTransactions: boolean) => void;
  showHeader?: boolean;
  onBackClick?: () => void;
}

const FleaMarketTransactionList: React.FC<FleaMarketTransactionListProps> = ({
  token: propToken,
  userId,
  // transactionType = 'all', // 将来の機能拡張用
  onTransactionsLoaded,
  showHeader = false,
  onBackClick,
}) => {
  const router = useRouter();
  const session = useSession();
  const token = propToken || session.data?.user.token || '';
  const [transactions, setTransactions] = useState<TransactionDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'buying' | 'bought'>('buying');
  const limit = 20;

  const fetchTransactions = useCallback(
    async (pageNum: number = 1) => {
      const effectiveUserId = userId || session.data?.user?.id;

      if (!token || !effectiveUserId) {
        setError('認証が必要です');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const request = getFleaMarketTransactionListRequest(
          token,
          effectiveUserId,
          pageNum,
          limit,
        );

        const response = await postToNext<{
          code: number;
          data: {
            transactions: FleaMarketTransactionListItem[];
            total: number;
          } | null;
          message?: string;
        }>(GET_FLEA_MARKET_TRANSACTION_LIST, request);

        if (response.type === 'error') {
          setError(response.message || '取引履歴の取得に失敗しました');
        } else if (response.code === 0) {
          const responseData: TransactionListResponseData =
            response.data || (response as TransactionListResponseData);
          const transactions = responseData?.transactions || [];
          const total = responseData?.total || 0;

          const transactionArray = Array.isArray(transactions)
            ? transactions
            : [];

          const transactionDisplays: TransactionDisplay[] =
            transactionArray.map(transformTransactionItemToDisplay);

          setTransactions(transactionDisplays);
          onTransactionsLoaded?.(total, transactionArray.length > 0);
        } else {
          setError(response.message || '取引履歴の取得に失敗しました');
        }
      } catch (_err) {
        setError('取引履歴の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    },
    [token, userId, session.data?.user?.id, onTransactionsLoaded],
  );

  useEffect(() => {
    const effectiveUserId = userId || session.data?.user?.id;
    if (effectiveUserId && token) {
      fetchTransactions(1);
    }
  }, [fetchTransactions, userId, session.data?.user?.id, token]);

  const handleTransactionClick = (transactionId: string) => {
    router.push(`/fleamarket/transaction/${transactionId}`);
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  const buyingTransactions = getBuyingTransactions(transactions);
  const boughtTransactions = getBoughtTransactions(transactions);

  const currentTransactions =
    activeTab === 'buying' ? buyingTransactions : boughtTransactions;

  if (!token || !userId) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>ログインすると取引履歴が表示されます</p>
        </div>
      </div>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <div className={styles.container}>
        <TransactionTabHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onBack={handleBackClick}
          showHeader={showHeader}
        />
        <div className={styles.errorMessage}>
          <p>{error}</p>
          <button onClick={handleBackClick} className={styles.retryButton}>
            戻る
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && transactions.length === 0) {
    return (
      <div className={styles.container}>
        <TransactionTabHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onBack={handleBackClick}
          showHeader={showHeader}
        />
        <div className={styles.loadingContainer}>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <TransactionTabHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBack={handleBackClick}
        showHeader={showHeader}
      />

      {currentTransactions.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            {activeTab === 'buying' ? (
              <IconBox size={50} />
            ) : (
              <IconShoppingBag size={50} />
            )}
          </div>
          <h3 className={styles.emptyTitle}>
            {activeTab === 'buying'
              ? '取引中の商品はありません'
              : '過去の取引はありません'}
          </h3>
          <p className={styles.emptyDescription}>
            {activeTab === 'buying'
              ? '購入した商品がここに表示されます'
              : '取引が完了した商品がここに表示されます'}
          </p>
        </div>
      ) : (
        <div className={styles.transactionsList}>
          {currentTransactions.map((transaction) => (
            <div
              key={transaction.transaction_id}
              className={styles.transactionItem}
              onClick={() => handleTransactionClick(transaction.transaction_id)}
            >
              <div className={styles.transactionContent}>
                {/* 商品画像 */}
                {transaction.item_images &&
                transaction.item_images.length > 0 ? (
                  <Image
                    src={imageUrlForFleaMarket(
                      transaction.item_images[0] || '',
                    )}
                    alt={transaction.item_title || '商品画像'}
                    width={60}
                    height={60}
                    className={styles.productImage}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const nextElement = e.currentTarget
                        .nextElementSibling as HTMLElement;
                      if (nextElement) {
                        nextElement.style.display = 'flex';
                      }
                    }}
                  />
                ) : (
                  <div className={styles.productImagePlaceholder}>
                    <IconBox size={20} />
                  </div>
                )}

                {/* 商品情報 */}
                <div className={styles.transactionDetails}>
                  <h3 className={styles.productTitle}>
                    {transaction.item_title || `商品 #${transaction.item_id}`}
                  </h3>

                  <div className={styles.transactionMeta}>
                    <span
                      className={`${styles.transactionStatus} ${styles[getStatusClass(transaction.status) as keyof typeof styles] || ''}`}
                    >
                      {getStatusLabel(transaction.status)}
                    </span>
                    <span className={styles.transactionDate}>
                      {formatDate(transaction.created_at)}
                    </span>
                  </div>

                  <div className={styles.transactionPrice}>
                    {transaction.price.toLocaleString()}pt
                  </div>
                </div>
              </div>

              {/* 新着マーク */}
              {transaction.status === 'pending' && (
                <span className={styles.transactionBadge}>NEW</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FleaMarketTransactionList;

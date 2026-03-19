// Image component removed (use <img> directly);
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import type { ConversationMarkReadRouteResponse } from '@/apis/http/conversationMarkRead';
import { HTTP_CONVERSATION_MARK_READ } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import styles from '@/styles/chatlist/TopMessageListTitle.module.css';
import type { ListConversationType } from '@/types/ListConversationType';
import type { TopMessage } from '@/types/TopMessage';

const RefleshPic = '/reflesh_p.webp';

type Props = {
  selectedTab: string;
  onTabChange: (tab: ListConversationType) => void;
  allMessages: TopMessage[];
  conversationMessages: TopMessage[];
  bookmarkMessages: TopMessage[];
  onMessagesUpdate?: (messages: {
    all: TopMessage[];
    conversation: TopMessage[];
    bookmark: TopMessage[];
  }) => void;
};

const TopMessageListTitle = ({
  selectedTab,
  onTabChange,
  allMessages,
  conversationMessages,
  bookmarkMessages,
  onMessagesUpdate,
}: Props) => {
  const router = useRouter();
  const [isReadModalOpen, setIsReadModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const readopen = () => {
    setIsReadModalOpen(true);
  };
  const readclose = () => {
    setIsReadModalOpen(false);
  };

  const isBadge = useCallback(
    (tab: ListConversationType) => {
      switch (tab) {
        case 'all':
          return allMessages.some((message) => message.unreadNum > 0);
        case 'conversation':
          return conversationMessages.some((message) => message.unreadNum > 0);
        case 'bookmark':
          return bookmarkMessages.some((message) => message.unreadNum > 0);
        default:
          return false;
      }
    },
    [allMessages, conversationMessages, bookmarkMessages],
  );

  const onClick = async () => {
    setLoading(true);
    let partnerIds;
    let isError = false;

    switch (selectedTab) {
      case 'conversation':
        partnerIds = conversationMessages.map((message) => message.partnerId);
        isError = conversationMessages.length === 0;
        break;
      case 'bookmark':
        partnerIds = bookmarkMessages.map((message) => message.partnerId);
        isError = bookmarkMessages.length === 0;
        break;
      default:
        partnerIds = allMessages.map((message) => message.partnerId);
        isError = allMessages.length === 0;
    }

    if (isError) {
      alert('エラーが発生しました。');
      setLoading(false);
      return;
    }

    try {
      const httpClient = new ClientHttpClient();
      const response = await httpClient.post<ConversationMarkReadRouteResponse>(
        HTTP_CONVERSATION_MARK_READ,
        { partnerIds },
      );

      if (response.type === 'error') {
        setLoading(false);
        alert(response.message);
        return;
      }

      // メッセージリストを更新
      const updatedMessages = {
        all: allMessages.map((msg) => ({ ...msg, unreadNum: 0 })),
        conversation: conversationMessages.map((msg) => ({
          ...msg,
          unreadNum: 0,
        })),
        bookmark: bookmarkMessages.map((msg) => ({ ...msg, unreadNum: 0 })),
      };

      // 親コンポーネントに更新を通知
      if (onMessagesUpdate) {
        onMessagesUpdate(updatedMessages);
      }

      setLoading(false);
      setIsReadModalOpen(false);
      router.replace(router.asPath);
    } catch (_error) {
      setLoading(false);
      alert('予期せぬエラーが発生しました。');
    }
  };
  const handleChangeTab = (tab: ListConversationType) => {
    onTabChange(tab);
  };

  const tabs: { key: ListConversationType; label: string }[] = [
    { key: 'all', label: 'すべて' },
    { key: 'conversation', label: 'やり取り中' },
    { key: 'bookmark', label: 'お気に入り' },
  ];

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className={styles.top}>
      {isReadModalOpen && (
        <div className={styles.modalBackdrop} onClick={readclose}>
          <div className={styles.modalContent}>
            <div className={styles.close} onClick={readclose}>
              ×
            </div>
            すべてのメッセージを既読にしますか？
            <div className={styles.yes} onClick={onClick}>
              はい
            </div>
          </div>
        </div>
      )}
      {loading && <div className={styles.loader}></div>}
      <h5 className={styles.title}>
        <div className={styles.read} onClick={readopen}>
          全て既読にする
        </div>
        メッセージ一覧
        <div className={styles.reload} onClick={handleRefresh}>
          <Image src={RefleshPic} alt="reload" width={23} height={23} />
        </div>
      </h5>
      <div className={styles.barback}>
        <div className={styles.bar}>
          {tabs.map(({ key, label }) => (
            <div key={key} className={styles.barItemContainer}>
              <span
                className={selectedTab === key ? styles.active : styles.barItem}
                onClick={() => handleChangeTab(key)}
              >
                {isBadge(key) && <div className={styles.unreadDot} />}

                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopMessageListTitle;

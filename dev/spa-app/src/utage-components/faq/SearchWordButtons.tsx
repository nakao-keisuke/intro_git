import { useRouter } from 'next/router';
import type React from 'react';
import styles from '@/styles/category_faq/SearchWordButtons.module.css';

type SearchWordItem = {
  label: string;
  icon: '📱' | '👩' | '👤' | '🎁' | '🔰' | '💰' | '🔍';
  categorySlug?: string;
  searchTerm?: string;
};

type Props = {
  searchWords: SearchWordItem[];
};

export const SearchWordButtons: React.FC<Props> = ({ searchWords }) => {
  const router = useRouter();

  const handleWordClick = (item: SearchWordItem) => {
    // 動的ルートに遷移
    router.push(`/faq/${item.categorySlug}`);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🔍 注目のカテゴリー</h2>
      <div className={styles.buttonGrid}>
        {searchWords.map((item, index) => (
          <button
            key={index}
            className={styles.searchButton}
            onClick={() => handleWordClick(item)}
            type="button"
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

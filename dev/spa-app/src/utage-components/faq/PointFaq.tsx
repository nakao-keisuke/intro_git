import type React from 'react';
import { useEffect, useState } from 'react';
import styles from '@/styles/category_faq/FaqCategory.module.css'; // パス修正

type Props = {
  searchTerm?: string;
  forceExpand?: boolean;
  autoExpandMatches?: boolean;
  showCategoryHeader?: boolean;
};

const PointFaq: React.FC<Props> = ({
  searchTerm,
  forceExpand,
  autoExpandMatches = false,
  showCategoryHeader = true,
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [categoryExpanded, setCategoryExpanded] = useState(false);

  const faqData = [
    {
      id: 'point-1',
      q: '最もお得なポイント購入方法を教えてください。',
      a: '初回限定パックが最もお得です。<br />1,000pt(800円)から始まり、段階的に12,000pt(14,900円)まで購入可能です。一番人気は3,600pt(4,900円)です。',
      keywords: [
        'ポイント',
        'ポイント購入',
        '購入',
        '支払い',
        '料金',
        'ポイント購入方法',
        'ポイント購入方法',
        '初回限定パック',
        '初回限定',
        '初回',
        '限定',
        'パック',
        'お得',
        'お得なポイント購入方法',
        'お得なポイント購入方法',
      ],
    },
    {
      id: 'point-2',
      q: 'クレジットカード以外の支払い方法はありますか？',
      a: 'クレジットカードの他にもPaidy・Apple Pay・Google Pay・Amazon Payが利用可能です。',
      keywords: [
        'ポイント',
        'ポイント消費',
        'ビデオ通話',
        '消費',
        '課金',
        '料金',
      ],
    },
    {
      id: 'point-3',
      q: 'ポイント購入後のキャンセル・返金は可能ですか？',
      a: 'デジタルコンテンツの性質上、購入後のキャンセル・返金は原則受け付けていません。購入前に金額をよくご確認ください。',
      keywords: [
        '料金',
        '料金が発生するかどうか',
        '料金が発生するかどうかを教えてください',
        '料金が発生するかどうかを教えてください',
        '料金が発生するかどうかを教えてください',
        '料金が発生するかどうかを教えてください',
        '料金が発生するかどうかを教えてください',
        '料金が発生するかどうかを教えてください',
        '料金が発生するかどうかを教えてください',
        '料金が発生するかどうかを教えてください',
        '料金が発生するかどうかを教えてください',
        '料金が発生するかどうかを教えてください',
      ],
    },
    {
      id: 'point-4',
      q: '月額制のプランはありますか？',
      a: '現在は都度購入のポイント制のみです。<br />使った分だけの支払いなので、自分のペースで利用できます。<br />解約忘れの心配もありません。',
      keywords: [
        'ポイント',
        'ポイント消費',
        'ビデオ通話',
        '消費',
        '課金',
        '料金',
      ],
    },
    // {
    //     id: 'point-5',
    //     q: 'ポイント消費履歴は確認できますか？',
    //     a: 'はい、マイページの「ポイント履歴」から、購入・消費の詳細履歴を確認できます。<br />通話時間や送信メッセージ数なども記録されています。',
    //     keywords: ['ポイント', 'ポイント消費', 'ビデオ通話', '消費', '課金', '料金', 'ポイント履歴', '履歴', '確認できる', '確認'],
    // },
  ];

  const filteredFaqData = searchTerm
    ? faqData.filter((item) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          item.q.toLowerCase().includes(searchLower) ||
          item.a.toLowerCase().includes(searchLower) ||
          item.keywords.some((keyword) =>
            keyword.toLowerCase().includes(searchLower),
          )
        );
      })
    : faqData;

  useEffect(() => {
    if (forceExpand || (searchTerm && filteredFaqData.length > 0)) {
      setCategoryExpanded(true);

      if (autoExpandMatches && searchTerm) {
        const matchingIds = filteredFaqData.map((item) => item.id);
        setExpanded(new Set(matchingIds));
      }
    }
  }, [searchTerm, filteredFaqData.length, forceExpand, autoExpandMatches]);

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  if (searchTerm && filteredFaqData.length === 0) {
    return null;
  }

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isOpen = (id: string) => expanded.has(id);

  const _stripHtmlTags = (html: string): string => {
    return html.replace(/<[^>]*>/g, '');
  };

  const toggleCategory = () => {
    setCategoryExpanded(!categoryExpanded);
  };

  // showCategoryHeaderがfalseの場合は、常にcategoryExpandedをtrueにする
  const shouldShowContent = showCategoryHeader ? categoryExpanded : true;

  return (
    <section className={styles.faqCategory} aria-label="料金・ポイントについて">
      {/* 検索結果表示 */}
      {searchTerm && (
        <div className={styles.searchResultHeader}>
          <h2 className={styles.searchResultTitle}>
            「{searchTerm}」の検索結果：全 {filteredFaqData.length} 件を表示中
          </h2>
        </div>
      )}
      {/* カテゴリーヘッダー（条件付き表示） */}
      {showCategoryHeader && (
        <header className={styles.categoryHeader}>
          <button
            className={styles.categoryHeaderButton}
            onClick={toggleCategory}
            aria-expanded={categoryExpanded}
            aria-controls="point-faq-content"
          >
            <h2 className={styles.categoryTitle}>
              料金について
              {searchTerm && filteredFaqData.length > 0 && (
                <span className={styles.searchResultCount}>
                  ({filteredFaqData.length}件)
                </span>
              )}
            </h2>
          </button>
        </header>
      )}
      {/* FAQ項目（条件付き表示） */}
      {shouldShowContent && (
        <div id="point-faq-content" className={styles.faqItems} role="list">
          {filteredFaqData.map((item) => (
            <div key={item.id} className={styles.faqItem}>
              <button
                className={styles.faqButton}
                onClick={() => toggle(item.id)}
                aria-expanded={isOpen(item.id)}
                aria-controls={`faq-answer-${item.id}`}
              >
                {/* 9. 質問と回答の表示部分を変更 */}
                <span
                  className={styles.faqQuestion}
                  dangerouslySetInnerHTML={{
                    __html: searchTerm
                      ? highlightSearchTerm(item.q, searchTerm)
                      : item.q,
                  }}
                />
                <span className={styles.faqArrow} aria-hidden="true">
                  {isOpen(item.id) ? '▲' : '▼'}
                </span>
              </button>
              {isOpen(item.id) && (
                <div
                  id={`faq-answer-${item.id}`}
                  className={styles.faqAnswer}
                  role="region"
                  dangerouslySetInnerHTML={{
                    __html: searchTerm
                      ? highlightSearchTerm(item.a, searchTerm)
                      : item.a,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
export { PointFaq };

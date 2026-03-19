import type React from 'react';
import { useEffect, useState } from 'react';
import styles from '@/styles/category_faq/FaqCategory.module.css';

type Props = {
  searchTerm?: string;
  forceExpand?: boolean;
  autoExpandMatches?: boolean;
  showCategoryHeader?: boolean;
};

const FleaMarketFaq: React.FC<Props> = ({
  searchTerm,
  forceExpand,
  autoExpandMatches = false,
  showCategoryHeader = true,
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [categoryExpanded, setCategoryExpanded] = useState(false);

  const faqData = [
    {
      id: 'fleamarket-1',
      q: 'フリーマーケットとは何ですか？',
      a: 'フリーマーケットは、女の子が使用済みの下着や衣類、私物などを出品・販売できる機能です。<br />購入者は気になる商品を見つけて購入することができます。',
      keywords: [
        'フリーマーケット',
        'フリマ',
        '出品',
        '販売',
        '購入',
        '下着',
        '衣類',
        '私物',
        '商品',
      ],
    },
    {
      id: 'fleamarket-2',
      q: 'どのような商品が出品されていますか？',
      a: 'パンティー、ブラジャー、B＆Pセット、衣類系、その他下着、リクエスト商品、私物などが出品されています。<br />各商品には写真、説明、価格が記載されています。',
      keywords: [
        '商品',
        '出品',
        'パンティー',
        'ブラジャー',
        '下着',
        '衣類',
        '私物',
        'リクエスト',
        'カテゴリ',
      ],
    },
    {
      id: 'fleamarket-3',
      q: '商品の購入方法を教えてください。',
      a: '気になる商品を見つけたら、商品詳細ページで「購入する」ボタンをタップします。<br />購入後は取引履歴で確認でき、出品者とのやり取りも可能です。',
      keywords: ['購入', '購入方法', '商品', '取引', '履歴', '出品者'],
    },
    {
      id: 'fleamarket-4',
      q: 'お気に入り機能の使い方は？',
      a: '商品のハートマークをタップするとお気に入りに追加されます。<br />「いいね」タブからお気に入り商品を一覧で確認できます。',
      keywords: ['お気に入り', 'いいね', 'ハート', '追加', '一覧', '確認'],
    },
    {
      id: 'fleamarket-5',
      q: '出品者の情報は確認できますか？',
      a: 'はい、商品ページから出品者のプロフィールを確認できます。<br />出品者の他の商品も一覧で見ることができます。',
      keywords: ['出品者', 'プロフィール', '情報', '確認', '他の商品', '一覧'],
    },
    {
      id: 'fleamarket-6',
      q: '取引履歴はどこで確認できますか？',
      a: '「取引履歴」タブから過去の購入履歴を確認できます。<br />購入した商品の詳細や出品者とのやり取りも見ることができます。',
      keywords: [
        '取引履歴',
        '購入履歴',
        '履歴',
        '確認',
        '購入',
        '商品',
        '出品者',
      ],
    },
    {
      id: 'fleamarket-7',
      q: '商品の検索やフィルタリングはできますか？',
      a: '現在はカテゴリ別での表示が可能です。<br />「すべての出品」タブで全商品を、「いいね」タブでお気に入り商品を確認できます。',
      keywords: [
        '検索',
        'フィルタ',
        'カテゴリ',
        '表示',
        'すべての出品',
        'いいね',
      ],
    },
    {
      id: 'fleamarket-8',
      q: '商品の価格はどのように決まっていますか？',
      a: '商品の価格は出品者が設定します。<br />各商品の詳細ページで価格を確認してから購入を決めることができます。',
      keywords: ['価格', '設定', '出品者', '確認', '購入', '決める'],
    },
  ];

  // 検索条件に一致するFAQをフィルタリング
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

  // 検索結果がある場合は自動的にカテゴリーと一致する質問を展開
  useEffect(() => {
    if (forceExpand || (searchTerm && filteredFaqData.length > 0)) {
      setCategoryExpanded(true);

      // autoExpandMatchesがtrueの場合、一致する質問を自動展開
      if (autoExpandMatches && searchTerm) {
        const matchingIds = filteredFaqData.map((item) => item.id);
        setExpanded(new Set(matchingIds));
      }
    }
  }, [searchTerm, filteredFaqData.length, forceExpand, autoExpandMatches]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isOpen = (id: string) => expanded.has(id);

  const toggleCategory = () => {
    setCategoryExpanded(!categoryExpanded);
  };

  // 検索結果がない場合は表示しない
  if (searchTerm && filteredFaqData.length === 0) {
    return null;
  }

  // 検索結果の質問をハイライト表示する関数
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  // showCategoryHeaderがfalseの場合は、常にcategoryExpandedをtrueにする
  const shouldShowContent = showCategoryHeader ? categoryExpanded : true;

  return (
    <section
      className={styles.faqCategory}
      aria-label="フリーマーケットについて"
    >
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
            aria-controls="fleamarket-faq-content"
          >
            <h2 className={styles.categoryTitle}>
              フリーマーケットについて
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
        <div
          id="fleamarket-faq-content"
          className={styles.faqItems}
          role="list"
        >
          {filteredFaqData.map((item) => (
            <div key={item.id} className={styles.faqItem}>
              <button
                className={styles.faqButton}
                onClick={() => toggle(item.id)}
                aria-expanded={isOpen(item.id)}
                aria-controls={`faq-answer-${item.id}`}
              >
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

export { FleaMarketFaq };

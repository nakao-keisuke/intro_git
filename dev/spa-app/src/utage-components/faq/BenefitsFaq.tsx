import type React from 'react';
import { useEffect, useState } from 'react';
import styles from '@/styles/category_faq/FaqCategory.module.css';

type Props = {
  searchTerm?: string;
  forceExpand?: boolean;
  autoExpandMatches?: boolean;
  showCategoryHeader?: boolean;
};

const BenefitsFaq: React.FC<Props> = ({
  searchTerm,
  forceExpand,
  autoExpandMatches = false,
  showCategoryHeader = true,
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [categoryExpanded, setCategoryExpanded] = useState(false);

  const faqData = [
    {
      id: 'benefits-1',
      q: '新規登録でもらえるポイントの総額は？',
      a: 'ミッション達成で最大1,200円分のポイントを獲得可能です。<br />電話番号登録(300pt)、メール登録(300pt)、ホーム画面に追加(100pt)、LINE友達追加(100pt)の合計です。',
      keywords: [
        'ミッション',
        'ミッション達成',
        '無料',
        'ポイント',
        'ポイント獲得',
        '獲得',
        '獲得方法',
      ],
    },
    {
      id: 'benefits-2',
      q: 'デイリーボーナスは毎日何ポイントもらえますか？',
      a: '毎日10pt獲得できます。<br />課金ユーザーは30日間ボーナスが2倍になるため、さらにお得です。',
      keywords: [
        'デイリーボーナス',
        'ボーナス',
        'ポイント',
        'ポイント獲得',
        '獲得',
        '獲得方法',
      ],
    },
    {
      id: 'benefits-3',
      q: '無料ポイントだけで楽しむことは可能ですか？',
      a: '無料ポイントだけでもお楽しみいただけます。<br />デイリーボーナスと新規登録特典で、メッセージ送信(60pt/通)や通話リクエストが可能です。<br />まずは無料ポイントでサービスを体験してください。',
      keywords: [
        'ポイント',
        'ポイント消費',
        'ビデオ通話',
        '無料',
        '課金',
        '料金',
      ],
    },
    {
      id: 'benefits-4',
      q: '期間限定キャンペーンの情報はどこで確認できますか？',
      a: 'アプリ内の「お知らせ」やトップページのバナーで告知されます。<br />プッシュ通知を有効にすると、お得なキャンペーン情報を見逃しません。',
      keywords: ['キャンペーン', 'キャンペーン情報', '無料ポイント'],
    },
    {
      id: 'benefits-5',
      q: 'ポイントの有効期限はありますか？',
      a: '購入したポイントに有効期限はありません。<br />ただし、180日間ログインがない場合はアカウントが休眠状態となる可能性があります。',
      keywords: [
        'ポイント',
        'ポイント消費',
        '消費',
        '課金',
        '料金',
        '有効期限',
        '休眠状態',
        '休眠',
      ],
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

  const _stripHtmlTags = (html: string): string => {
    return html.replace(/<[^>]*>/g, '');
  };

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
    <section className={styles.faqCategory} aria-label="無料ポイントについて">
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
            aria-controls="benefits-faq-content"
          >
            <h2 className={styles.categoryTitle}>
              無料ポイントについて
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
        <div id="benefits-faq-content" className={styles.faqItems} role="list">
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

export { BenefitsFaq };

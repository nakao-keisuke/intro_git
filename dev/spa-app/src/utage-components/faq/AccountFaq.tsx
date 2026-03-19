import type React from 'react';
import { useEffect, useState } from 'react';
import styles from '@/styles/category_faq/FaqCategory.module.css';

type Props = {
  searchTerm?: string;
  forceExpand?: boolean;
  autoExpandMatches?: boolean;
  showCategoryHeader?: boolean;
};

const AccountFaq: React.FC<Props> = ({
  searchTerm,
  forceExpand,
  autoExpandMatches = false,
  showCategoryHeader = true, // デフォルトは表示
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [categoryExpanded, setCategoryExpanded] = useState(false);

  const faqData = [
    {
      id: 'account-1',
      q: '電話番号なしで登録できますか？',
      a: 'はい、Googleアカウントまたは LINEアカウントでも登録可能です。<br />ただし、電話番号登録すると300ポイントのボーナスがもらえます。',
      keywords: ['電話番号', '登録', 'アカウント', '再入会'],
    },
    {
      id: 'account-2',
      q: '退会方法を教えてください。',
      a: 'マイページの設定から「退会手続き」を選択してください。<br />残ポイントは退会と同時に失効しますのでご注意ください。<br />退会後の再登録も可能です。',
      keywords: ['退会', 'やめる', 'アカウント', '忘れた', 'パスワード忘れ'],
    },
    {
      id: 'account-3',
      q: 'パスワードを忘れた場合はどうすればいいですか？',
      a: 'ログイン画面の「パスワードを忘れた方」から、登録メールアドレスにリセット用リンクを送信できます。<br />メールアドレス未登録の場合はサポートまでご連絡ください。',
      keywords: [
        'パスワード',
        'パスワード忘れ',
        'パスワード再設定',
        'パスワードリセット',
        'アカウント',
      ],
    },
    {
      id: 'account-4',
      q: '複数アカウントの作成は可能ですか？',
      a: 'いいえ、1人1アカウントが原則です。<br />複数アカウントが発見された場合、全てのアカウントが停止される可能性があります。',
      keywords: [
        '複数アカウント',
        '複数アカウント作成',
        '複数アカウント禁止',
        '複数アカウント停止',
      ],
    },
    {
      id: 'account-5',
      q: 'プロフィール情報は後から変更できますか？',
      a: 'はい、マイページからニックネームやプロフィール画像をいつでも変更可能です。本人確認済みの情報（生年月日等）は変更できません。',
      keywords: ['プロフィール', 'プロフィール変更', 'プロフィール変更方法'],
    },
    {
      id: 'account-6',
      q: 'アカウントが凍結された場合の対処法は？',
      a: '利用規約違反の疑いで凍結される場合があります。<br />心当たりがない場合は、サポートに詳細を記載してお問い合わせください。<br />調査の上、適切に対応いたします。',
      keywords: ['凍結', 'アカウント', '凍結解除', '凍結解除方法'],
    },
  ];

  // 検索語を配列に正規化
  const searchTerms = Array.isArray(searchTerm)
    ? searchTerm
    : searchTerm
      ? [searchTerm]
      : [];

  // 複数検索語でのフィルタリング
  const filteredFaqData =
    searchTerms.length > 0
      ? faqData.filter((item) => {
          return searchTerms.some((term) => {
            const searchLower = term.toLowerCase();
            return (
              item.q.toLowerCase().includes(searchLower) ||
              item.a.toLowerCase().includes(searchLower) ||
              item.keywords.some((keyword) =>
                keyword.toLowerCase().includes(searchLower),
              )
            );
          });
        })
      : faqData;

  // 検索結果表示の修正
  const _displaySearchTerm =
    searchTerms.length > 1 ? searchTerms.join('・') : searchTerms[0] || '';

  // useEffectの修正
  useEffect(() => {
    if (forceExpand || (searchTerm && filteredFaqData.length > 0)) {
      setCategoryExpanded(true);

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
  if (searchTerms.length > 0 && filteredFaqData.length === 0) {
    return null;
  }

  // ハイライト表示の修正
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;

    let highlightedText = text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    return highlightedText;
  };

  // showCategoryHeaderがfalseの場合は、常にcategoryExpandedをtrueにする
  const shouldShowContent = showCategoryHeader ? categoryExpanded : true;

  return (
    <div className={styles.faqCategories}>
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
            aria-controls="account-faq-content"
          >
            <h2 className={styles.categoryTitle}>
              会員アカウント・登録情報について
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
        <div id="account-faq-content" className={styles.faqItems}>
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
                <span className={styles.faqToggleIcon} aria-hidden="true">
                  {isOpen(item.id) ? '▲' : '▼'}
                </span>
              </button>

              {isOpen(item.id) && (
                <div id={`faq-answer-${item.id}`} className={styles.faqAnswer}>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: searchTerm
                        ? highlightSearchTerm(item.a, searchTerm)
                        : item.a,
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { AccountFaq };

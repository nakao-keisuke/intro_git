import type React from 'react';
import { useEffect, useState } from 'react';
import styles from '@/styles/category_faq/FaqCategory.module.css';

type Props = {
  searchTerm?: string;
  forceExpand?: boolean;
  autoExpandMatches?: boolean;
  showCategoryHeader?: boolean;
};

const ConnectionFaq: React.FC<Props> = ({
  searchTerm,
  forceExpand,
  autoExpandMatches = false,
  showCategoryHeader = true,
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [categoryExpanded, setCategoryExpanded] = useState(false);

  const toggleCategory = () => {
    setCategoryExpanded(!categoryExpanded);
  };

  const faqData = [
    {
      id: 'connection-1',
      q: 'カメラやマイクの設定方法を教えてください。',
      a: 'ブラウザの設定から、Utageのカメラ・マイクアクセスを許可してください。<br />通話開始時に許可を求められた場合は「許可」を選択します。<br />スマホの場合は設定アプリからも確認可能です。',
      keywords: ['カメラ', 'マイク', '設定', '通話', '音声', '映像'],
    },
    {
      id: 'connection-2',
      q: 'カメラをOFFにして音声のみで通話できますか？',
      a: 'はい、音声通話機能があります。<br />カメラOFFの音声通話は160pt/分で、ビデオ通話(250pt/分)より料金もお得です。',
      keywords: ['カメラ・マイク', '設定', '通話', '音声', '映像'],
    },
    {
      id: 'connection-3',
      q: '相手の声が聞こえない・自分の声が届かない時はどうすればいいですか？',
      a: 'マイクの権限設定を確認し、端末の音量設定をチェックしてください。<br />他のアプリがマイクを使用していないか確認し、ブラウザを再読み込みすると改善する場合があります。',
      keywords: ['カメラ・マイク', '設定', '通話', '音声', '映像'],
    },
    {
      id: 'connection-4',
      q: 'ビデオ通話の画質が悪い時の対処法は？',
      a: 'Wi-Fi環境での利用を推奨します。<br />4G/5G回線の場合、電波状況により画質が低下することがあります。<br />不要なアプリを閉じることで改善する場合もあります。',
      keywords: ['カメラ・マイク', '設定', '通話', '音声', '映像'],
    },
    {
      id: 'connection-5',
      q: 'バーチャル背景や顔フィルターは使えますか？',
      a: '現在、バーチャル背景機能は搭載していません。<br />プライバシーが気になる場合は、背景をぼかすか、壁を背にして通話することをおすすめします。',
      keywords: [
        'バーチャル背景',
        '顔フィルター',
        'フィルター',
        '背景',
        'バーチャル',
        '背景',
        'カメラ・マイク',
      ],
    },
    {
      id: 'connection-6',
      q: '通話中に接続が切れてしまった場合、ポイントは返金されますか？',
      a: '技術的な問題で接続が切れた場合は、サポートに連絡いただければ状況を確認し、適切に対応いたします。<br />通話履歴から問題のあった通話を特定してお問い合わせください。',
      keywords: [
        '接続',
        '切れる',
        '切れた',
        'カメラ・マイク',
        '切れた時の対処法',
        '切れた時の対処法',
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

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  // showCategoryHeaderがfalseの場合は、常にcategoryExpandedをtrueにする
  const shouldShowContent = showCategoryHeader ? categoryExpanded : true;

  return (
    <section className={styles.faqCategory} aria-label="カメラ・マイクについて">
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
            aria-controls="connection-faq-content"
          >
            <h2 className={styles.categoryTitle}>カメラ・マイクについて</h2>
          </button>
        </header>
      )}
      {/* FAQ項目（条件付き表示） */}
      {shouldShowContent && (
        <div
          id="connection-faq-content"
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

export { ConnectionFaq };

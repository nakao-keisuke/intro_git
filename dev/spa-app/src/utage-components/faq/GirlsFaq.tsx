import type React from 'react';
import { useEffect, useState } from 'react';
import styles from '@/styles/category_faq/FaqCategory.module.css';

type Props = {
  searchTerm?: string;
  forceExpand?: boolean;
  autoExpandMatches?: boolean;
  showCategoryHeader?: boolean;
};

const GirlsFaq: React.FC<Props> = ({
  searchTerm,
  forceExpand,
  autoExpandMatches = false,
  showCategoryHeader = true,
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [categoryExpanded, setCategoryExpanded] = useState(false);

  const faqData = [
    {
      id: 'girls-1',
      q: '女の子の顔出しは必須ですか？',
      a: '多くの女の子が顔出しで配信していますが、顔出しは女の子の自由選択です。<br />リアルタイムの生配信なので、自然な姿でコミュニケーションを楽しめます。',
      keywords: ['女の子', '顔出し'],
    },
    {
      id: 'girls-2',
      q: 'アダルトな内容のビデオ通話はできますか？',
      a: '女の子によって対応内容は異なりますが、プロフィールやメッセージで事前に確認できます。<br />日本の法律の範囲内で、大人同士の自由なコミュニケーションをお楽しみいただけます。',
      keywords: [
        'アダルト',
        'アダルトな内容',
        'アダルトな内容のビデオ通話',
        'ビデオ通話',
      ],
    },
    {
      id: 'girls-3',
      q: '女の子のプロフィール写真は本物ですか？',
      a: 'Utageでは本人確認を実施しており、プロフィール写真は本人のものです。<br />さらにビデオ通話機能があるため、実際の姿をリアルタイムで確認できます。<br />写真と実物が違う場合は運営に通報可能で、厳正に対処しています。',
      keywords: [
        'プロフィール',
        '本人確認',
        'プロフィール写真',
        'リアルタイム',
      ],
    },
    {
      id: 'girls-4',
      q: '深夜や早朝でも女の子はログインしていますか？',
      a: '24時間365日、様々な時間帯に女の子がログインしています。<br />特に22時〜深夜2時は最も多くの女の子が待機しており、早朝や日中も一定数の女の子が活動しています。<br />「着信待ち」タブで現在待機中の女の子を確認できます.',
      keywords: [
        '時間帯',
        '深夜',
        '早朝',
        '女の子',
        '着信待ち',
        'ログイン',
        '24時間',
      ],
    },
    {
      id: 'girls-5',
      q: '年齢層はどれくらいですか？',
      a: '18歳から40代まで幅広い年齢層の女性が在籍しています。<br />人妻・熟女カテゴリーも人気で、落ち着いた大人の会話を楽しみたい方に好評です。<br />プロフィール検索で年齢やタイプで絞り込み可能です。',
      keywords: ['年齢層', '人妻', '熟女'],
    },
    {
      id: 'girls-6',
      q: '女の子からのアダルト動画や画像は保存できますか？',
      a: '購入した動画・画像は「動画/画像」ページでいつでも再視聴可能ですが、著作権保護のためダウンロード保存はできません。<br />購入済みコンテンツはアカウントに紐付いて永続的に閲覧可能です。',
      keywords: ['動画購入', '動画', 'ビデオ', '画像', '視聴', 'ダウンロード'],
    },
    {
      id: 'girls-7',
      q: 'サクラや業者はいませんか？素人の女の子と本当に話せますか？',
      a: 'Utageでは厳格な本人確認と審査を実施しており、サクラはありません。<br />登録している女の子は全て一般の女性で、リアルなコミュニケーションが可能です。<br />不審なアカウントは24時間体制で監視し、即座に対処しています。',
      keywords: ['サクラ', '業者', '素人', '女の子', '本当に話せる'],
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
    <section className={styles.faqCategory} aria-label="女の子について">
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
            aria-controls="girls-faq-content"
          >
            <h2 className={styles.categoryTitle}>
              女の子について
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
        <div id="girls-faq-content" className={styles.faqItems} role="list">
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

export { GirlsFaq };

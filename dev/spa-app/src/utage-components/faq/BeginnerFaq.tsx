import type React from 'react';
import { useEffect, useState } from 'react';
import {
  PRICING_INFO,
  type PricingInfo,
  type PricingLabel,
} from '@/constants/pricing';
import styles from '@/styles/category_faq/FaqCategory.module.css';

type Props = {
  searchTerm?: string;
  forceExpand?: boolean;
  autoExpandMatches?: boolean;
  showCategoryHeader?: boolean;
};

const formatPricingInfo = (pricing: PricingInfo) => {
  const { price, unit } = pricing;
  const priceText = typeof price === 'number' ? `${price}` : price;

  return unit ? `${priceText}${unit}` : priceText;
};

const formatPricingText = (label: PricingLabel, fallback: string) => {
  const pricing = PRICING_INFO.find((info) => info.label === label);
  if (!pricing) return fallback;

  return formatPricingInfo(pricing);
};

const BeginnersFaq: React.FC<Props> = ({
  searchTerm,
  forceExpand,
  autoExpandMatches = false,
  showCategoryHeader = true,
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [categoryExpanded, setCategoryExpanded] = useState(false);

  const videoCallPointText = formatPricingText('ビデオ通話', '230pt/分');
  const messagePointText = formatPricingText('メッセージ送信', '60pt/通');
  const faqData = [
    {
      id: 'beginners-1',
      q: '初心者でも簡単に遊べますか？',
      a: 'はい、直感的な操作で利用できます。<br /><br />「探す」画面から気になる女の子を選んで、メッセージや通話リクエストを送るだけです。<br />初回登録時のミッションで基本操作も学べます。',
      keywords: [
        '初心者',
        '簡単',
        '使い方',
        'サービス',
        'ライブチャット',
        'コミュニケーション',
        '遊び方',
      ],
    },
    {
      id: 'beginners-2',
      q: '女の子にメッセージを送る方法は？',
      a: `女の子のプロフィールページから「メッセージ」ボタンをタップし、テキストを入力して送信します。<br />${messagePointText}を消費しますが、相手からの返信を読むのは無料です。`,
      keywords: [
        'メッセージ',
        '送信',
        'メッセージ送信',
        '遊び方',
        'はじめに',
        '初回',
      ],
    },
    {
      id: 'beginners-3',
      q: 'お気に入り登録するとどうなりますか？',
      a: 'お気に入り登録した女の子がログインした時に通知が届き、メッセージ一覧の「お気に入り」タブから素早くアクセスできます。<br />女の子側にも通知されます。',
      keywords: [
        'お気に入り',
        '女の子',
        '登録',
        'お気に入り登録',
        '遊び方',
        '対面',
      ],
    },
    {
      id: 'beginners-4',
      q: '通話リクエストの仕組みを教えてください。',
      a: '無料で通話リクエストを送信でき、女の子が承認すると通話が開始されます。<br />着信待ち状態の女の子なら、すぐに通話を開始できる可能性が高いです。',
      keywords: [
        '通話リクエスト',
        '通話',
        'リクエスト',
        '通話リクエストの仕組み',
        '遊び方',
      ],
    },
    {
      id: 'beginners-5',
      q: 'ビデオチャットの入室方法は？',
      a: `ビデオチャット待機中または配信中の女の子のプロフィールから「入室する」ボタンで参加できます。<br />${videoCallPointText}で配信者とコメントでやり取りが可能です。`,
      keywords: [
        '入室',
        'ビデオチャット',
        '配信',
        '通話',
        'リクエスト',
        '遊び方',
      ],
    },
    {
      id: 'beginners-6',
      q: '掲示板機能の使い方を教えてください。',
      a: '女の子の投稿が時系列で表示され、投稿から直接メッセージ送信や通話リクエストが可能です。<br />女の子の日常や今の気分がわかるので、話題作りにも便利です。',
      keywords: [
        '掲示板',
        'リクエスト',
        '無料',
        'メッセージ返信',
        '通話',
        'メッセージ',
        '投稿',
        '遊び方',
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
    <section className={styles.faqCategory} aria-label="遊び方について">
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
            aria-controls="beginners-faq-content"
          >
            <h2 className={styles.categoryTitle}>
              遊び方について
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
        <div id="beginners-faq-content" className={styles.faqItems} role="list">
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

export { BeginnersFaq };

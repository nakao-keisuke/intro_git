import { Link } from '@tanstack/react-router';
import type React from 'react';

type Article = {
  id: string;
  link: string;
  description: string;
  thumbnail: string;
  date: string;
};

type Props = {
  currentArticleId: string;
  articles: Article[];
  category?: string;
  categoryIcon?: string;
};

export const ArticleNavigation: React.FC<Props> = ({
  currentArticleId,
  articles,
  category = 'ライブチャット',
  categoryIcon = '📁',
}) => {
  // 記事が存在しない場合は何も表示しない
  if (articles.length === 0) {
    return null;
  }

  // 現在の記事のインデックスを取得
  const currentIndex = articles.findIndex(
    (article) => article.id === currentArticleId,
  );

  // 前の記事と次の記事を取得
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle =
    currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

  // 前の記事がない場合は最後の記事、次の記事がない場合は最初の記事を表示
  const leftArticle = (prevArticle || articles[articles.length - 1])!;
  const rightArticle = (nextArticle || articles[0])!;

  return (
    <div style={{ margin: '0.5rem 0 1rem 0' }}>
      {/* 記事ナビゲーション */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          gap: '1rem',
        }}
      >
        {/* 前回の記事ボタン */}
        <Link
          href={prevArticle ? prevArticle.link : leftArticle.link}
          style={{ textDecoration: 'none' }}
        >
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.8rem 1.2rem',
              backgroundColor: '#fff',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '0.9rem',
              fontWeight: 'bold',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.borderColor = '#bbb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.borderColor = '#ddd';
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>◀︎</span>
            前回の記事
          </button>
        </Link>

        {/* 次の記事ボタン */}
        <Link
          href={nextArticle ? nextArticle.link : rightArticle.link}
          style={{ textDecoration: 'none' }}
        >
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.8rem 1.2rem',
              backgroundColor: '#fff',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '0.9rem',
              fontWeight: 'bold',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.borderColor = '#bbb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.borderColor = '#ddd';
            }}
          >
            次の記事
            <span style={{ fontSize: '1.1rem' }}>▶︎</span>
          </button>
        </Link>
      </div>
    </div>
  );
};

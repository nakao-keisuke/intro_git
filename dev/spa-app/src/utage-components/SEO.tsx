import Head from 'next/head';
import type React from 'react';

type SEOProps = {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  noindex?: boolean;
  canonical?: string;
  jsonLd?: object;
};

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage = 'https://utage-web.com/miseai_livehcat_utage_ogp.webp',
  ogUrl,
  twitterCard = 'summary_large_image',
  noindex = false,
  canonical,
  jsonLd,
}) => {
  const finalOgTitle = ogTitle || title;
  const finalOgDescription = ogDescription || description;

  return (
    <Head>
      {/* 基本的なメタタグ */}
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* robots meta tag */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* OGPタグ */}
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:type" content="website" />
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Utage" />
      <meta property="og:locale" content="ja_JP" />

      {/* Twitter Cardタグ */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={finalOgTitle} />
      <meta name="twitter:description" content={finalOgDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* 構造化データ */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </Head>
  );
};

import type { Metadata } from 'next';

export function buildFaqCategoryMetadata(
  label: string,
  slug: string,
): Metadata {
  const title = `よくある質問（${label}） | Utage`;
  const description = `${label}に関するよくある質問と回答です。`;
  const url = `https://utage-web.com/faq/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'Utage',
    },
  } satisfies Metadata;
}

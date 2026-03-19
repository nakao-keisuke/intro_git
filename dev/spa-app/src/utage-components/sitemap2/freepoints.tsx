import Image, { type StaticImageData } from 'next/image';
import Adress from 'public/lp/utage_point_address.webp';
import Daily from 'public/lp/utage_point_daily.webp';
import Home from 'public/lp/utage_point_home.webp';
import Line from 'public/lp/utage_point_line.webp';
import Tel from 'public/lp/utage_point_tel.webp';
import type React from 'react';
import styles from '@/styles/sitemap/freepoints.module.css';

interface PointItem {
  id: string;
  title: string;
  points: string;
  image: string | StaticImageData;
  description: React.ReactNode;
}

const pointItems: PointItem[] = [
  {
    id: 'phone-register',
    title: '電話番号登録',
    points: '300pt',
    image: Tel,
    description: <>登録時に電話番号から登録すると300ポイント獲得！</>,
  },
  {
    id: 'email-register',
    title: 'メールアドレス登録',
    points: '300pt',
    image: Adress,
    description: (
      <>
        メールアドレスを登録して300ポイント獲得！重要なお知らせやキャンペーン情報を見逃す心配がありません。
      </>
    ),
  },
  {
    id: 'home-screen',
    title: 'ホーム画面追加',
    points: '200pt',
    image: Home,
    description: (
      <>
        Utageをホーム画面に追加して200ポイント獲得！いつでも簡単にアクセスできるようになります。
      </>
    ),
  },
  // {
  //   id: 'board-post',
  //   title: '初回掲示板投稿',
  //   points: '100pt',
  //   image: Board,
  //   description: (
  //     <>
  //       掲示板に初めて投稿すると100ポイント獲得！自分の興味や趣味について投稿して、コミュニティを盛り上げましょう。
  //       <br />
  //       ※こちらは初回のみ適用のため、2回目以降の付与は対象外となりますのでご了承ください。
  //     </>
  //   ),
  // },

  // {
  //   id: 'credit-card',
  //   title: 'クレジットカード登録',
  //   points: '500pt',
  //   image: Credit,
  //   description: 'クレジットカードを登録して500ポイント獲得！スムーズな決済が可能になります。',
  // },
  {
    id: 'line-add',
    title: 'LINE追加',
    points: '300pt',
    image: Line,
    description:
      'Utage公式LINEを友だち追加して300ポイント獲得！お得な情報をいち早くお届けします。',
  },
  {
    id: 'daily-bonus',
    title: 'デイリーボーナス',
    points: '毎日10pt',
    image: Daily,
    description: (
      <>
        毎日ログインするだけで10ポイント獲得！継続的にポイントを貯めることができます。
      </>
    ),
  },
];

const FreePoints = () => {
  return (
    <section className={styles.pointsList}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>
          【無料で獲得可能なポイント一覧】
        </h2>

        <div className={styles.items}>
          {pointItems.map((item) => (
            <div key={item.id} className={styles.item}>
              <div className={styles.imageWrapper}>
                <Image
                  src={item.image}
                  alt={`${item.title}で${item.points}獲得`}
                  width={600}
                  height={300}
                  className={styles.itemImage}
                />
              </div>
              <div className={styles.itemContent}>
                <p className={styles.itemDescription}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FreePoints;

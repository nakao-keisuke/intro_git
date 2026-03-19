// Image component removed (use <img> directly);
import { Link } from '@tanstack/react-router';
import styles from '@/styles/sitemap/about.module.css';

const aboutImage = '/lp/lp_about.webp';

import { IconArrowRight } from '@tabler/icons-react';

type AboutProps = {
  currentPath: string;
};

const About = ({ currentPath }: AboutProps) => {
  return (
    <section className={styles.about}>
      <div className={styles.aboutContainer}>
        <h2 className={styles.title}>
          ★ライブチャット utage(ウタゲ)の利用方法★
        </h2>
        <p className={styles.text}>
          ライブチャットのutage(ウタゲ)は、現役女子大生や保育士、熟女・人妻などの様々なタイプの女性とライブチャットやビデオ通話を楽しめるサービスです♩
          毎日3,000人以上の女性がログインしているのできっとお気に入りの女の子がいるはずです♡
        </p>

        <div className={styles.content}>
          <div className={styles.description}>
            <h3 className={styles.subTitle}>
              <span className={styles.reward}>Point</span>
              utage(ウタゲ)は何ができるの？
            </h3>
            <div className={styles.imageWrapper}>
              <Image
                src={aboutImage}
                alt="無料ポイント獲得イメージ"
                width={0}
                height={0}
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
            <p className={styles.text}>
              お気に入りの女の子とのビデオ通話やチャットを楽しみましょう！
              <br />
              初めての方はこちらをご確認ください。
            </p>
          </div>
        </div>
        <Link href={`${currentPath}/sitemap`} className={styles.btn}>
          遊び方を見る
          <IconArrowRight size={20} />
        </Link>
      </div>
    </section>
  );
};

export default About;

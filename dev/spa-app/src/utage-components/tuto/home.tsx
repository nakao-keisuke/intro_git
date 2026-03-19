// Image component removed (use <img> directly);
import styles from '@/styles/tuto/home.module.css';

const subtitlePic = '/tuto/1200pointGet_Subtitle.webp';
const titlePic = '/tuto/1200pointGet_title.webp';

import { Link } from '@tanstack/react-router';

const logoPic = '/header/utage_logo.webp';

const Search = () => {
  return (
    <div className={styles.container}>
      <div className={styles.videoWrapper}>
        <div className={styles.logo}>
          <Image
            src={logoPic}
            alt="logo"
            className={styles.logoPic}
            width={100}
            height={40}
          />
          <Link href="/login">
            <button className={styles.loginButton}>ログインはこちらから</button>
          </Link>
        </div>
        <video
          autoPlay
          muted
          playsInline
          loop
          width="100%"
          height="100%"
          className={styles.videoContent}
        >
          <source src="/tuto/lp_main.mp4" type="video/mp4" />
          お使いのブラウザは、動画タグに対応していません。
        </video>
      </div>

      <div className={styles.title}>
        <Image
          src={subtitlePic}
          alt="subtitle"
          className={styles.subtitlePic}
        />
        <Image src={titlePic} alt="title" className={styles.titlePic} />
      </div>
      <div className={styles.search_button}>
        <button className={styles.search_button_text}>
          <Link href="/signup">
            <span className={styles.search_button_text_Span}>
              利用規約に同意して
            </span>
            新規登録する
          </Link>
        </button>
      </div>
    </div>
  );
};

export default Search;

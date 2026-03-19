import styles from '@/styles/PwaModal.module.css';

const AppPic = '/pwa.webp';

// Image component removed (use <img> directly);

const iOSHomeButtonPic = '/home_app/home_app_i.0.webp';
const androidPic = '/home_app/home_app_a.0.webp';
const mailPic = '/mailnotification.webp';
const smarthonePic = '/smarthone.webp';

type Props = {
  onClose: () => void;
};

export const PwaModalComponent: React.FC<Props> = ({ onClose }) => {
  const userAgent = window.navigator.userAgent;
  const isiOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isSafari = /safari/i.test(userAgent) && !/crios/i.test(userAgent);
  const handleClickInside = (e: any) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={
          !isiOS ? styles.chrome : isSafari ? styles.safari : styles.isiOSChrome
        }
        onClick={handleClickInside}
      >
        <Image
          src={AppPic}
          width="200"
          height="190"
          alt="アプリアイコン"
          className={styles.apppic}
        />
        <div className={styles.text}>
          <div className={styles.title}>
            Utageをインストールして、
            <br />
            ポイントをゲットしよう！
          </div>
          <div className={styles.about}>
            <li className={styles.li}>
              <Image
                src={mailPic}
                alt="メッセージ送信"
                priority={true}
                width="23"
                height="23"
                className={styles.imageContainer}
                style={{ marginRight: '6px' }}
              />
              新しいメッセージ
            </li>
            <li className={styles.li}>
              <Image
                src={smarthonePic}
                alt="メッセージ送信"
                priority={true}
                width="23"
                height="23"
                className={styles.imageContainer}
                style={{ marginRight: '6px' }}
              />
              快適な操作性
            </li>
          </div>
          {isiOS && (
            <div className={styles.ul}>
              <li>
                <span>
                  <b>1.</b>
                  <Image
                    src={iOSHomeButtonPic}
                    alt="メッセージ送信"
                    priority={true}
                    width="30"
                    height="30"
                    className={styles.imageContainer}
                    style={{ marginRight: '5px', marginLeft: '5px' }}
                  />
                </span>
                をタップしてください
              </li>
              <br />
              <li>
                <b>2.「ホーム画面に追加」</b>をタップしてください
              </li>
            </div>
          )}
          {!isiOS && (
            <div className={styles.ul}>
              <li>
                <span>
                  <b>1.</b>画面右上
                  <Image
                    src={androidPic}
                    alt="メッセージ送信"
                    priority={true}
                    width="30"
                    height="30"
                    className={styles.imageContainer}
                  />
                </span>
                をタップしてください
              </li>
              <br />
              <li>
                <b>2.</b>「アプリをインストール」をタップしてください
              </li>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

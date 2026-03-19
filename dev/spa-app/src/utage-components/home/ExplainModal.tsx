import { memo, type ReactNode } from 'react';
import styles from '@/styles/home/ExplainModal.module.css';

const _wakabaPic = '/situation.icon/beginner_y.webp';

// Image component removed (use <img> directly);

const videoCallPic = '/situation.icon/videoicon.svg';
const voiceCallPic = '/situation.icon/voiceicon.svg';
const chatPic = '/situation.icon/chaticon.webp';

import { IconClock } from '@tabler/icons-react';

type Props = {
  onClose: () => void;
  children?: ReactNode;
};

const ExplainModal: React.FC<Props> = memo(({ onClose }) => {
  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const clockClass = styles.crockIcon || '';

  return (
    <div className={styles.modalBackdrop} onClick={handleClickOutside}>
      <div className={styles.modalContent}>
        <div>
          <p className={styles.title}>アイコン説明</p>
          <ul>
            <li>
              <span className={styles.label}>ビデオ通話待機中</span>
              お互い見せ合えるビデオ通話！
              <br />
              一緒に楽しもう♪
            </li>
            <li>
              <span className={styles.taiki}>ビデオチャット待機中</span>
              配信形式で楽しめる！
              <br />
              見せられない状況でも問題ナシ♪
            </li>
            <li>
              <span className={styles.live_label}>ビデオチャット待機中</span>
              他の男性会員とのやり取りを覗くことができる！ こっそり覗いちゃおう♪
            </li>
            <li>
              <span className={styles.board_label}>着信待ち</span>
              あなたの通話発信を待っています♪
              <br />
              他の男性会員より早く発信してビデオ通話！
            </li>
            <li>
              <span className={styles.calling}>ビデオ通話中</span>
              他の男性会員とビデオ通話中！
              <br />
              チャットでビデオ通話を誘ってみよう♪
            </li>
            <div className={styles.space} />
            <li>
              <div className={styles.beginner}>
                <div className={styles.beginnerIcon}>
                  <div className={styles.ribbon17content}>
                    <span className={styles.ribbon17}>　新人</span>
                  </div>
                </div>
                …登録から２週間以内
              </div>
            </li>
            <li>
              <span>
                <span className={styles.green}>
                  <IconClock size={16} className={clockClass} />
                </span>
                …オンライン中
              </span>
            </li>
            <li>
              <span>
                <span className={styles.orange}>
                  <IconClock size={16} className={clockClass} />
                </span>
                …24時間以内にオンライン
              </span>
            </li>
            <li>
              <span>
                <span className={styles.gray}>
                  <IconClock size={16} className={clockClass} />
                </span>
                …24時間以上オンラインではない
              </span>
            </li>
            <li>
              <span>
                <Image
                  src={voiceCallPic}
                  alt="音声マーク"
                  width="15"
                  height="15"
                />
                …音声通話可能のユーザー
              </span>
            </li>
            <li>
              <span>
                <Image
                  src={videoCallPic}
                  alt="ビデオマーク"
                  width="15"
                  height="15"
                />
                …ビデオ通話可能のユーザー
              </span>
            </li>
            <li>
              <span>
                <Image
                  src={chatPic}
                  alt="ビデオマーク"
                  width="15"
                  height="15"
                />
                …チャット可能のユーザー
              </span>
            </li>
            <li>
              <span>
                <span className={styles.story}>　</span>
                …ストーリーを投稿しているユーザー
              </span>
            </li>
          </ul>
          <center>
            <button onClick={onClose} className={styles.closeButton}>
              閉じる
            </button>
          </center>
        </div>
      </div>
    </div>
  );
});

ExplainModal.displayName = 'ExplainModal';

export default ExplainModal;

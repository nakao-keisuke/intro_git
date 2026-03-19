// Image component removed (use <img> directly);
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import styles from '@/styles/livelist/PCLiveList.module.css';
import type { LiveChannel } from '@/types/LiveChannel';
import {
  getLiveChannelerProfilePath,
  type LiveCallType,
  type LiveCallView,
} from '@/utils/callView';
import { imageUrl } from '@/utils/image';

type Props = {
  list: (LiveChannel & { liveCallView: LiveCallView })[];
};
const defaultLabel = (type: LiveCallType) => {
  switch (type) {
    case 'live':
      return styles.live_label;
    case 'videoCallFromStandby':
      return styles.video_call_label;
    case 'sideWatch':
      return styles.live_label;
    default:
      return styles.live_label;
  }
};

export const PCLiveList = ({ list }: Props) => {
  const [displayTexts] = useState<string[]>(() => {
    if (list) {
      return list.map(({ liveCallView }) => liveCallView.statusText);
    }
    return [];
  });

  if (!list.length) {
    return <div className={styles.none}>現在配信中のユーザーはいません。</div>;
  }

  const items = list.map(({ broadcaster, liveCallView }, index) => {
    return (
      <li className={styles.cell} key={broadcaster.userId}>
        <Link
          href={{
            pathname:
              getLiveChannelerProfilePath(liveCallView.type) +
              '/pc' +
              '/' +
              broadcaster.userId,
          }}
        >
          {broadcaster.isNewUser && (
            <div className={styles.beginnerIcon}>
              <div className={styles.ribbon17content}>
                <span className={styles.ribbon17}>　新人</span>
              </div>
            </div>
          )}
          <div className={styles.bottom}>
            <div className={defaultLabel(liveCallView.type)}>
              <span className={styles.blink}>{displayTexts[index]}</span>
            </div>

            <div className={styles.username}>
              {broadcaster.age}歳{broadcaster.userName}
            </div>
          </div>
          <div className={styles.set}>
            <div className={styles.thumbnail}>
              <Image
                src={imageUrl(broadcaster.avatarId)}
                alt="ユーザー画像"
                placeholder="empty"
                quality={100}
                priority={true}
                width={200}
                height={200}
                style={{
                  objectFit: 'cover',
                  position: 'relative',
                  overflow: 'hidden',
                  marginLeft: '10px',
                }}
              />
            </div>
          </div>
        </Link>
      </li>
    );
  });
  return <ul className={styles.container}>{items}</ul>;
};

// Image component removed (use <img> directly);
import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import styles from '@/styles/livelist/LiveList.module.css';
import type { ChannelInfo } from '@/types/ChannelInfo';
import type { LiveChannel } from '@/types/LiveChannel';
import {
  getLiveChannelerProfilePath,
  type LiveCallType,
  type LiveCallView,
} from '@/utils/callView';
import { imageUrl } from '@/utils/image';

const newUserPic = '/beginner.icon.webp';

type Props = {
  broadcaster: LiveChannel['broadcaster'];
  liveCallView: LiveCallView;
  channelInfo: ChannelInfo;
  displayText: string;
  index: number;
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

export const LiveListItem: React.FC<Props> = ({
  broadcaster,
  liveCallView,
  channelInfo,
  displayText,
  index,
}) => {
  // サムネイル画像のソースを決定する関数
  const getImageSource = () => {
    // ビデオチャット配信中でスクリーンショットがある場合のみスクリーンショットを表示

    // それ以外はアバター画像を表示
    return imageUrl(broadcaster.avatarId);
  };

  const [imgSrc, setImgSrc] = useState(getImageSource());

  useEffect(() => {
    setImgSrc(getImageSource());
  }, [liveCallView.type, channelInfo.thumbnailImageId, broadcaster.avatarId]);

  return (
    <li className={styles.cell} key={broadcaster.userId}>
      <Link
        href={{
          pathname:
            getLiveChannelerProfilePath(liveCallView.type) +
            '/' +
            broadcaster.userId,
        }}
      >
        <div className={styles.set}>
          <div className={styles.thumbnail}>
            <Image
              src={imgSrc}
              alt="ユーザー画像"
              placeholder="empty"
              quality={75}
              priority={index < 6}
              width={200}
              height={266}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '10px',
              }}
              onError={() => {
                setImgSrc(imageUrl(broadcaster.avatarId));
              }}
            />
            {broadcaster.isNewUser && (
              <div className={styles.beginnerIcon}>
                <span className={styles.newLabel}>
                  <Image
                    src={newUserPic}
                    alt="新人マーク"
                    style={{
                      width: 35,
                      height: 35,
                    }}
                  />
                </span>
              </div>
            )}

            <div className={defaultLabel(liveCallView.type)}>
              <span className={styles.blink}>{displayText}</span>
            </div>
          </div>
        </div>

        <div className={styles.userStatus}>
          <Image
            src={imageUrl(broadcaster.avatarId)}
            alt="ユーザー画像"
            placeholder="empty"
            quality={75}
            priority={index < 6}
            width={40}
            height={40}
            className={styles.avatarIcon}
            style={{
              zIndex: 2,
            }}
          />
          <div className={styles.username}>
            <div className={styles.nameContainer}>
              <span className={styles.age}>{broadcaster.age}歳</span>
              {broadcaster.userName}
            </div>
            <div className={styles.about}>
              <span className={styles.aboutText}>
                {broadcaster.about?.length > 20
                  ? `${broadcaster.about.slice(0, 20)}...`
                  : broadcaster.about}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
};

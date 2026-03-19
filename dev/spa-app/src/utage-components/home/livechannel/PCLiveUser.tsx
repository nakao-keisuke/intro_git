// Image component removed (use <img> directly);
import { Link } from '@tanstack/react-router';
import styles from '@/styles/home/livechannel/PCLiveChannelMeetpeople.module.css';
import type { ChannelInfo } from '@/types/ChannelInfo';
import {
  getLiveChannelerProfilePath,
  type LiveCallView,
} from '@/utils/callView';
import { imageUrl } from '@/utils/image';
import { getRankImage } from '@/utils/ranking';

const LovensePic = '/lovense_pink.webp';
const humanPic = '/live/human.webp';

import { defaultLabel, determineOnlineStatusColor } from '@/utils/personality';

const newUserPic = '/beginner.icon.webp';

type LiveUserProps = {
  user: User;
  liveCallView: LiveCallView;
  channelInfo: ChannelInfo;
};

type User = {
  about: string;
  userCount: number;
  userId: string;
  avatarId: string;
  age: number;
  userName: string;
  lastLoginTime: string;
  rank?: number;
  hasLovense: boolean;
  isNewUser: boolean;
};

const LiveUser = ({ user, liveCallView, channelInfo }: LiveUserProps) => {
  const viewer = user.userCount - 1;
  const rankImage = getRankImage(user.rank);

  return (
    <li className={styles.liveCell} key={user.userId}>
      <Link
        href={{
          pathname: `${getLiveChannelerProfilePath(liveCallView.type)}/${user.userId}`,
        }}
      >
        <div className={styles.set}>
          <div className={defaultLabel(liveCallView.type)}>
            <span className={styles.blink}>{liveCallView.statusText}</span>
          </div>
          <div className={styles.thumbnail}>
            <Image
              src={imageUrl(user.avatarId)}
              alt="ユーザー画像"
              unoptimized={true} // Next.jsの画像最適化をバイパス
              placeholder="empty"
              quality={100}
              priority={true}
              style={{
                objectFit: 'cover',
                borderRadius: '5vw',
                display: 'block',
              }}
            />
          </div>
          {rankImage && (
            <Image
              src={rankImage.src}
              alt={rankImage.alt}
              placeholder="empty"
              width={40}
              height={40}
              style={{
                position: 'absolute',
                bottom: 8,
                left: 3,
                borderRadius: '5vw',
              }}
            />
          )}
          {liveCallView.type === 'live' && (
            <div className={styles.count}>
              <Image
                src={humanPic}
                alt="Utage"
                width={9}
                height={9}
                className={styles.humanlogo}
              />
              {viewer > 0 ? viewer : 1}
            </div>
          )}
          {user.hasLovense && (
            <Image
              src={LovensePic}
              alt="Lovense"
              placeholder="empty"
              className={styles.lovense}
              priority={true}
              width={20}
              height={20}
              style={{
                position: 'absolute',
                bottom: '0',
                right: 0,
              }}
            />
          )}
          {user.isNewUser && (
            <div className={styles.beginnerIcon}>
              <div className={styles.ribbon17content}>
                <span className={styles.ribbon17}>
                  <Image
                    src={newUserPic}
                    alt="新人マーク"
                    style={{
                      width: '35px',
                      height: '35px',
                    }}
                  />
                </span>
              </div>
            </div>
          )}
          {liveCallView.type === 'live' && (
            <div className={styles.liveIcon}>
              <span className={styles.tenmetu}>●</span>LIVE
            </div>
          )}
          <div className={styles.userStatus}>
            <div
              className={`${
                styles[determineOnlineStatusColor(user.lastLoginTime)]
              }`}
            />
            <div className={styles.username}>
              <span className={styles.age}> {user.age}</span>
              <span className={styles.sai}>歳</span>
              {user.userName}
            </div>

            <div className={styles.about}>
              {user.about.length > 0 && (
                <span className={styles.aboutText}>
                  {user.about.length > 12
                    ? `${user.about.slice(0, 12)}...`
                    : user.about}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default LiveUser;

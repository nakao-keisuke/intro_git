// Image component removed (use <img> directly);
import { Link } from '@tanstack/react-router';
import styles from '@/styles/home/livechannel/LiveChannelStandbyMeetPeople.module.css';
import {
  getLiveChannelerProfilePath,
  type LiveCallView,
} from '@/utils/callView';
import { imageUrl } from '@/utils/image';

const LovensePic = '/lovense_pink.webp';
const humanPic = '/live/human.webp';

import type { MeetPersonWithTalkTheme } from '@/hooks/useLivePeopleInfoList.hook';
import type { ChannelInfo } from '@/types/ChannelInfo';
import { defaultLabel, determineOnlineStatusColor } from '@/utils/personality';
import { getRankImage } from '@/utils/ranking';

const newUserPic = '/beginner.icon.webp';

type StandbyUserProps = {
  meetPerson: MeetPersonWithTalkTheme;
  liveCallView: LiveCallView;
  channelInfo: ChannelInfo;
  rank: number | undefined;
};

/**
 * ライブチャンネルのユーザー情報を表示する
 */
const StandbyUser = ({
  meetPerson,
  liveCallView,
  channelInfo,
  rank,
}: StandbyUserProps) => {
  const rankImage = getRankImage(rank);
  const viewer = meetPerson.userCount - 1;

  return (
    <li className={styles.cell} key={meetPerson.userId}>
      <Link
        href={{
          pathname:
            getLiveChannelerProfilePath(liveCallView.type) +
            '/' +
            meetPerson.userId,
        }}
      >
        <div className={styles.set}>
          {liveCallView.type === 'videoCallFromStandby' && (
            <div className={defaultLabel(liveCallView.type)}>
              <span className={styles.blink}>{liveCallView.statusText}</span>
            </div>
          )}
          <div className={styles.thumbnail}>
            {liveCallView.type === 'live' ? (
              <>
                {/* 背景（ぼかし効果付き） */}
                <Image
                  src={imageUrl(meetPerson.avatarId)}
                  alt=""
                  placeholder="empty"
                  quality={100}
                  priority={true}
                  fill
                  className={styles.thumbnailBackground}
                  unoptimized={true}
                />
                {/* メインのサムネイル（9:16） */}
                <div className={styles.thumbnailContent}>
                  <Image
                    src={imageUrl(meetPerson.avatarId)}
                    alt="ユーザー画像"
                    placeholder="empty"
                    quality={100}
                    priority={true}
                    width={67.5}
                    height={120}
                    unoptimized={true}
                    style={{
                      objectFit: 'cover',
                    }}
                  />
                </div>
              </>
            ) : (
              <Image
                src={imageUrl(meetPerson.avatarId)}
                alt="ユーザー画像"
                placeholder="empty"
                quality={100}
                priority={true}
                width={170}
                height={120}
                style={{
                  objectFit: 'cover',
                  borderRadius: '5vw',
                  display: 'block',
                }}
              />
            )}
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
          {meetPerson.hasLovense && (
            <Image
              src={LovensePic}
              alt="Lovense"
              placeholder="empty"
              className={styles.lovense}
              width={20}
              height={20}
              style={{
                position: 'absolute',
                bottom: '0',
                right: 0,
              }}
            />
          )}
          {meetPerson.isNewUser && (
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
          {liveCallView.type !== 'videoCallFromStandby' && (
            <div className={styles.liveIcon}>
              <span className={styles.tenmetu}>●</span>LIVE
            </div>
          )}

          {meetPerson.hLevel &&
            meetPerson.hLevel !== '未設定' &&
            viewer <= 0 && (
              <div className={styles.hLevel}>
                Hレベル
                <span className={styles.hLevelText}>{meetPerson.hLevel}</span>
              </div>
            )}
          <div className={styles.userStatus}>
            <div
              className={`${
                styles[determineOnlineStatusColor(meetPerson.lastLoginTime)]
              }`}
            />
            <div className={styles.username}>
              <span className={styles.age}> {meetPerson.age}</span>
              <span className={styles.sai}>歳</span>
              {meetPerson.userName}
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default StandbyUser;

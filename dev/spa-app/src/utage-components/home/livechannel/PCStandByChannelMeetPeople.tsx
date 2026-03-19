// Image component removed (use <img> directly);
import { Link } from '@tanstack/react-router';
import { memo, useEffect, useState } from 'react';
import { useLivePeopleInfoList } from '@/hooks/useLivePeopleInfoList.hook';
import styles from '@/styles/home/livechannel/PCLiveChannelMeetpeople.module.css';
import { type CallType, getLiveChannelerProfilePath } from '@/utils/callView';
import { imageUrl } from '@/utils/image';

const LovensePic = '/lovense_pink.webp';
const newUserPic = '/beginner.icon.webp';

const defaultLabel = (type: CallType) => {
  switch (type) {
    case 'live':
      return styles.live_label;
    case 'videoCallFromStandby':
      return styles.video_call_label;
    default:
      return styles.video_call_label;
  }
};

const determineOnlineStatusColor = (lastOnlineTimestamp: string): string => {
  const currentTime = Date.now();
  const lastOnlineTime = new Date(parseInt(lastOnlineTimestamp, 10));

  if (!lastOnlineTime) {
    return 'status-grey';
  }

  const diffTime = currentTime - lastOnlineTime.getTime();

  if (diffTime <= 80000) {
    return 'status-green';
  } else if (diffTime <= 86400000) {
    return 'status-orange';
  } else if (diffTime > 259200000) {
    return 'status-grey';
  }
  return 'status-grey';
};

const PCStandByChannelMeetPeople = memo(() => {
  const { livePeopleInfoList, isLoading } = useLivePeopleInfoList();
  const [displayTexts, setDisplayTexts] = useState<string[] | undefined>(
    livePeopleInfoList?.map(({ liveCallView }) => liveCallView.statusText),
  );

  useEffect(() => {
    if (!livePeopleInfoList) return;
    setDisplayTexts(
      livePeopleInfoList.map(({ liveCallView }) => liveCallView.statusText),
    );
  }, [livePeopleInfoList]);

  if (isLoading) {
    return (
      <div className={styles.containerFixedHeight}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  if (!livePeopleInfoList || !displayTexts) {
    return (
      <ul className={styles.container}>
        <li className={styles.none}></li>
      </ul>
    );
  }

  if (!livePeopleInfoList.length) {
    return (
      <ul className={styles.container}>
        <li className={styles.none}>現在待機中のユーザーはいません。</li>
      </ul>
    );
  }

  const items = livePeopleInfoList
    ?.filter(
      (item) =>
        item.liveCallView.type === 'live' ||
        item.liveCallView.type === 'videoCallFromStandby',
    )
    .map(({ meetPerson, liveCallView }, index) => {
      const liveMessage = () => {
        switch (meetPerson.talkTheme) {
          case 'どんなお話でもOK':
            return '際どいことも話せます。';
          case '徐々に盛り上げましょう':
            return 'みんなと盛り上がりたいです！';
          case '趣味のお話をしましょう':
            return 'みんなのこと気になるなぁ';
          case 'メールで教えて下さい':
            return 'いっぱい話したいです！';
          case '普通のお話をしましょう':
            return 'みんなと他愛もない話をしたいです。';
          case '未設定':
            return '色々話したいです。';
          default:
            return '色々話したいです。';
        }
      };

      return (
        <li className={styles.cell} key={meetPerson.userId}>
          <Link
            href={{
              pathname:
                getLiveChannelerProfilePath(liveCallView.type) +
                '/pc/' +
                meetPerson.userId,
            }}
          >
            <div className={styles.set}>
              <div className={styles.thumbnailText}>{liveMessage()}</div>
              <div className={styles.thumbnail}>
                <div className={defaultLabel(liveCallView.type)}>
                  <span className={styles.blink}>{displayTexts[index]}</span>
                </div>

                <Image
                  src={imageUrl(meetPerson.avatarId)}
                  alt="ユーザー画像"
                  placeholder="empty"
                  quality={100}
                  priority={true}
                  width={240}
                  height={170}
                  style={{
                    objectFit: 'cover',
                    position: 'relative',
                    overflow: 'hidden',
                    marginTop: '10px',
                    marginLeft: '10px',
                    borderRadius: '1vw',
                  }}
                />
              </div>
              {meetPerson.hasLovense && (
                <Image
                  src={LovensePic}
                  alt="Lovense"
                  placeholder="empty"
                  className={styles.lovense}
                  priority={index < 3}
                  width={25}
                  height={25}
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
              {liveCallView.type === 'live' && (
                <div className={styles.liveIcon}>
                  <span className={styles.tenmetu}>●</span>LIVE
                </div>
              )}
              <div className={styles.userStatus}>
                <div
                  className={`${
                    styles[determineOnlineStatusColor(meetPerson.lastLoginTime)]
                  }`}
                />
                <div className={styles.username}>
                  <span className={styles.age}> {meetPerson.age}歳</span>
                  {meetPerson.userName}
                </div>
              </div>
            </div>
          </Link>
        </li>
      );
    });
  return <ul className={styles.container}>{items}</ul>;
});

export default PCStandByChannelMeetPeople;
PCStandByChannelMeetPeople.displayName = 'PCStandByChannelMeetPeople';

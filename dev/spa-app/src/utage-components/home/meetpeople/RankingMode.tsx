// Image component removed (use <img> directly);
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import styles from '@/styles/home/meetpeople/RankingMode.module.css';
import type { MeetPerson } from '@/types/MeetPerson';
import { imageUrl } from '@/utils/image';

const logoPic = '/miseai_livechat_utage_icon.webp';
const firstRankPic = '/ranking/1.webp';
const secondRankPic = '/ranking/2.webp';
const thirdRankPic = '/ranking/3.webp';
const FourthRankPic = '/ranking/4.webp';
const FifthRankPic = '/ranking/5.webp';
const liveBackgroundPic = '/live/background.webp';

import type { MeetPeopleMode } from './MeetPeopleListCard';

const beginnerPic = '/situation.icon/beginner.webp';

type RankedMeetPerson = MeetPerson & { rank?: number };

type Props = {
  currentMode: MeetPeopleMode;
  videochatRankingMeetPeople: (MeetPerson & {
    isLive: boolean;
    isCallWaiting: boolean;
    rank?: number;
  })[];
  twoshotRankingMeetPeople: (MeetPerson & {
    isLive: boolean;
    isCallWaiting: boolean;
    rank?: number;
  })[];
  chatRankingMeetPeople: (MeetPerson & {
    isLive: boolean;
    isCallWaiting: boolean;
    rank?: number;
  })[];
};

type RankingType = 'videochat' | 'twoshot' | 'chat';

const getRankImage = (rank: number | undefined) => {
  switch (rank) {
    case 1:
      return { src: firstRankPic, alt: '1位' };
    case 2:
      return { src: secondRankPic, alt: '2位' };
    case 3:
      return { src: thirdRankPic, alt: '3位' };
    case 4:
      return { src: FourthRankPic, alt: '4位' };
    case 5:
      return { src: FifthRankPic, alt: '5位' };

    default:
      return undefined;
  }
};

const parseTimestamp = (timestamp: string): Date => {
  const year = Number(timestamp.slice(0, 4));
  const month = Number(timestamp.slice(4, 6)) - 1; // months are 0-based in JavaScript Date
  const day = Number(timestamp.slice(6, 8));
  const hour = Number(timestamp.slice(8, 10));
  const minute = Number(timestamp.slice(10, 12));
  const second = Number(timestamp.slice(12, 14));
  return new Date(Date.UTC(year, month, day, hour, minute, second));
};

const determineOnlineStatusColor = (meetPerson: RankedMeetPerson) => {
  const currentTime = Date.now();
  const lastOnlineTime = parseTimestamp(meetPerson.lastLoginTime);

  let loginStatus: string;
  let statusColor: string;

  if (!lastOnlineTime) {
    loginStatus = '未定義';
    statusColor = 'status-grey'; // default color in case of error or undefined
  } else {
    const diffTime = currentTime - lastOnlineTime.getTime();

    if (meetPerson.isCalling) {
      loginStatus = 'ビデオ通話中';
      statusColor = '#f6899f';
    } else if (diffTime <= 8 * 60 * 60 * 1000) {
      loginStatus = 'オンライン';
      statusColor = 'rgb(67, 220, 43)';
    } else if (diffTime <= 24 * 60 * 60 * 1000) {
      loginStatus = '24時間以内';
      statusColor = 'rgb(255, 175, 47)';
    } else {
      loginStatus = '24時間以上';
      statusColor = 'rgb(142, 142, 142)';
    }
  }

  return { loginStatus, statusColor };
};

const RankingModeDisplay = ({
  videochatRankingMeetPeople,
  twoshotRankingMeetPeople,
  chatRankingMeetPeople,
}: Props) => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<RankingType>('chat');
  const [rankingData, setRankingData] = useState<RankedMeetPerson[]>(
    chatRankingMeetPeople,
  );

  useEffect(() => {
    const data =
      selectedTab === 'videochat'
        ? videochatRankingMeetPeople
        : selectedTab === 'twoshot'
          ? twoshotRankingMeetPeople
          : chatRankingMeetPeople;

    setRankingData(data);
  }, [
    selectedTab,
    videochatRankingMeetPeople,
    twoshotRankingMeetPeople,
    chatRankingMeetPeople,
  ]);

  const handleClick = useCallback(
    (userId: string) => {
      router.push(
        {
          pathname: `/profile/unbroadcaster/${userId}`,
        },
        undefined,
        { scroll: true },
      );
    },
    [router],
  );

  const determineThumbnailClass = (
    hasStory: boolean,
    rank?: number,
  ): string => {
    switch (rank) {
      case 1:
        return `${styles.thumbnail} ${styles.gold} `;
      case 2:
        return `${styles.thumbnail} ${styles.silver}`;
      case 3:
        return `${styles.thumbnail} ${styles.bronze}`;
    }

    return hasStory
      ? `${styles.thumbnail} ${styles.hasStory}`
      : `${styles.thumbnail}`;
  };

  const handleChangeTab = (tab: RankingType) => {
    setSelectedTab(tab);
  };

  const tabs: { key: RankingType; label: string }[] = [
    { key: 'videochat', label: 'ビデオチャット' },
    { key: 'twoshot', label: 'ビデオ通話' },
    { key: 'chat', label: 'メッセージ' },
  ];

  const meetPeopleItems = rankingData?.map((person, index) => {
    const { loginStatus, statusColor } = determineOnlineStatusColor(person);
    const thumbnailClass = determineThumbnailClass(
      person.hasStory,
      person.rank,
    );
    const rankImage = getRankImage(person.rank);
    const cellClass =
      person.rank && person.rank <= 1 ? styles.topThree : styles.regularCell;

    return (
      <li className={`${styles.cell} ${cellClass}`} key={person.userId}>
        <div className={styles.set} onClick={() => handleClick(person.userId)}>
          <div className={styles.number}>
            {rankImage && (
              <Image
                src={rankImage.src}
                alt={rankImage.alt}
                placeholder="empty"
                priority={index < 3}
                width={60}
                height={60}
              />
            )}
          </div>
          <div className={thumbnailClass}>
            <Image
              src={imageUrl(person.avatarId, person.userId)}
              alt="ユーザー画像"
              placeholder="empty"
              quality={75}
              priority={index < 3}
              width={160}
              height={160}
              style={{
                objectFit: 'cover',
                borderTopRightRadius: '10px',
                borderTopLeftRadius: '10px',
                display: 'block',
              }}
            />
          </div>

          <Image
            src={logoPic}
            alt="サイトロゴ"
            placeholder="empty"
            priority={index < 3}
            width={42}
            height={30}
            style={{
              position: 'absolute',
              top: '60px',
              left: 10,
            }}
          />
          <div className={styles.username}>
            <div
              className={styles.online}
              style={{ backgroundColor: statusColor }}
            >
              {loginStatus}
            </div>
            <span className={styles.region}>{person.region}</span>
            <span className={styles.age}> {person.age}</span>
            <span className={styles.sai}>歳</span>
          </div>
        </div>
        <div className={styles.about}>
          <span className={styles.name}>
            {person.userName}
            {person.isNewUser && (
              <div className={styles.beginner}>
                <Image
                  src={beginnerPic}
                  alt="beginner"
                  width={22}
                  height={22}
                  className="cursor-pointer"
                />
              </div>
            )}
          </span>
        </div>
      </li>
    );
  });

  return (
    <div className={styles.container}>
      <Image
        src={liveBackgroundPic}
        alt="背景"
        priority={true}
        fill
        className={styles.layer}
      />
      <div className={styles.barback}>
        {tabs.map(({ key, label }) => (
          <span
            key={key}
            className={selectedTab === key ? styles.active : styles.barItem}
            onClick={() => handleChangeTab(key)}
          >
            <li className={styles.bar}> {label} </li>
          </span>
        ))}
      </div>
      <ul className={styles.content}>{meetPeopleItems}</ul>
    </div>
  );
};

export default RankingModeDisplay;

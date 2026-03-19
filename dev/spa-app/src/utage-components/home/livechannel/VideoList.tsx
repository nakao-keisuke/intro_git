const beginnerPic = '/beginner.icon.webp';

// Image component removed (use <img> directly);
import { memo, useEffect, useState } from 'react';
import { useVideoPeopleInfoList } from '@/hooks/useVideoPeopleInfoList.hook';
import styles from '@/styles/home/livechannel/VideoList.module.css';
import { imageUrl } from '@/utils/image';

const LovensePic = '/lovense_pink.webp';
const videoPic = '/chat/video.webp';
const videoCallPic = '/situation.icon/videoicon.svg';

import VideoTwoModal from '@/components/videocall/VideoTwoModal';
import { trackEvent } from '@/utils/eventTracker';
import type { ShowingFace } from '@/utils/showingFace';
import type { StepToCall } from '@/utils/stepToCall';
import type { TalkTheme } from '@/utils/talkTheme';

export type VideoMeetPerson = {
  userId: string;
  avatarId: string;
  about: string;
  userName: string;
  age: number;
  region: string;
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
  isNewUser: boolean;
  isCalling: boolean;
  isLive: boolean;
  lastLoginTime: string;
  hasStory: boolean;
  isCallWaiting: boolean;
  rank?: number;
  hasLovense: boolean;
  last_action_status_label: string;
  talk_theme: TalkTheme;
  showing_face_status: ShowingFace;
  step_to_call: StepToCall;
};

type ModalData = {
  partnerId: string;
  userName: string;
  age: number;
  region: string;
  avatarId: string;
  about: string;
  videoCallWaiting: boolean;
  voiceCallWaiting: boolean;
  isBonusCourseExist: boolean;
} | null;

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

const VideoList = memo(() => {
  useEffect(() => {
    trackEvent('OPEN_VIDEO_USERS_LIST');
  }, []);
  const { videoPeopleInfoList, isLoading } = useVideoPeopleInfoList();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeModalData, setActiveModalData] = useState<ModalData>(null);
  const handleTwoshotModalOpen = (
    event: React.MouseEvent<HTMLDivElement>,
    videoList: VideoMeetPerson,
  ) => {
    event.stopPropagation(); // イベントの伝搬を停止
    event.preventDefault(); // デフォルトのアンカータグの動作を防止
    setActiveModalData({
      partnerId: videoList.userId,
      userName: videoList.userName,
      age: videoList.age,
      region: videoList.region,
      avatarId: videoList.avatarId,
      about: '',
      videoCallWaiting: videoList.videoCallWaiting,
      voiceCallWaiting: videoList.voiceCallWaiting,
      isBonusCourseExist: false,
    });
    setActiveModal('twoshot');
  };

  const closeChoiceModal = () => {
    setActiveModal(null);
  };

  if (isLoading) {
    return (
      <div className={styles.containerFixedHeight}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  const filterVideoPeopleInfoList = videoPeopleInfoList?.filter(
    ({ meetPerson }) => meetPerson.videoCallWaiting,
  );

  if (!videoPeopleInfoList) {
    return (
      <ul className={styles.container}>
        <li className={styles.none}></li>
      </ul>
    );
  }

  if (!videoPeopleInfoList.length) {
    return (
      <ul className={styles.smallContainer}>
        <li className={styles.none}>現在着信待ちの女の子はいません。</li>
      </ul>
    );
  }

  const items = filterVideoPeopleInfoList?.map(
    ({ meetPerson: videoList }, index) => {
      const videoPerson = videoList as unknown as VideoMeetPerson;
      return (
        <div key={videoPerson.userId} className={styles.gridItem}>
          <a
            href={`/profile/unbroadcaster/${videoPerson.userId}`}
            className={styles.wrapper}
          >
            <div>
              <Image
                src={imageUrl(videoPerson.avatarId)}
                placeholder="empty"
                width={180}
                height={180}
                style={{ objectFit: 'cover', borderRadius: '10px 10px 0 0' }}
                alt="画像"
              />
            </div>
            <div className={styles.container}>
              <div className={styles['profile-container']}>
                {videoPerson.talk_theme !== '未設定' && (
                  <span className={styles['profile-tag']}>
                    {videoPerson.talk_theme}
                  </span>
                )}
                {!['未設定', '顔出ししない'].includes(
                  videoPerson.showing_face_status,
                ) && (
                  <span className={styles['profile-tag']}>
                    {videoPerson.showing_face_status}
                  </span>
                )}
                {![
                  '未設定',
                  '通話リクエストください',
                  'メッセージから始めましょう',
                ].includes(videoPerson.step_to_call) && (
                  <span className={styles['profile-tag']}>
                    {videoPerson.step_to_call ===
                    'いきなりかけてもらって大丈夫です'
                      ? 'いきなり通話OK'
                      : videoPerson.step_to_call}
                  </span>
                )}
              </div>
            </div>

            {videoPerson.hasLovense && (
              <Image
                src={LovensePic}
                alt="Lovense"
                placeholder="empty"
                className={styles.lovense}
                priority={index < 3}
                width={20}
                height={20}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                }}
              />
            )}
            {videoList.isNewUser && (
              <div className={styles.beginnerIcon}>
                <Image src={beginnerPic} width={45} height={45} alt="新人" />
              </div>
            )}
            <div className={styles.videoCallWaiting}>
              {videoPerson.videoCallWaiting && (
                <Image
                  src={videoCallPic}
                  alt="ビデオマーク"
                  width="30"
                  height="30"
                />
              )}
            </div>
          </a>
          <div className={styles.usernameContainer}>
            <div>
              <div className={styles.call}>
                {videoPerson.last_action_status_label}
              </div>
              <div className={styles.userStatus}>
                <div
                  className={`${
                    styles[
                      determineOnlineStatusColor(videoPerson.lastLoginTime)
                    ]
                  }`}
                />
                <div className={styles.username}>
                  <span className={styles.name}>{videoPerson.userName} </span>
                  <span className={styles.age}>{videoPerson.age} </span>
                  <span className={styles.sai}>歳</span>
                  <span className={styles.region}>{videoPerson.region}</span>
                </div>
              </div>
              <span className={styles.about}>
                {videoPerson.about.length > 30
                  ? `${videoPerson.about.slice(0, 30)}...`
                  : videoPerson.about}
              </span>
            </div>
          </div>
          {videoPerson.videoCallWaiting && (
            <div
              onClick={(event) => handleTwoshotModalOpen(event, videoPerson)}
              className={styles.twoshot}
            >
              <Image
                src={videoPic}
                alt="ビデオ通話"
                placeholder="empty"
                width={18}
                height={18}
              />
              <div style={{ padding: 0, margin: 0 }}>今すぐ発信</div>
            </div>
          )}
          {!videoPerson.videoCallWaiting && (
            <div className={styles.noTwoshot}>
              <Image
                src={videoPic}
                alt="ビデオ通話"
                placeholder="empty"
                width={18}
                height={18}
              />
              <div style={{ padding: 0, margin: 0 }}>オフ</div>
            </div>
          )}
        </div>
      );
    },
  );
  return (
    <>
      {activeModal === 'twoshot' && activeModalData && (
        <VideoTwoModal
          partnerId={activeModalData.partnerId}
          userName={activeModalData.userName}
          age={activeModalData.age}
          region={activeModalData.region}
          avatarId={activeModalData.avatarId}
          about={''}
          onClose={closeChoiceModal}
          isPurchased={true}
          isBonusCourseExist={false}
          videoCallWaiting={activeModalData.videoCallWaiting}
          voiceCallWaiting={activeModalData.voiceCallWaiting}
        />
      )}
      <div className={styles.gridContainer}>{items}</div>
    </>
  );
});

export default VideoList;
VideoList.displayName = 'VideoList';

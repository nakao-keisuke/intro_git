// Image component removed (use <img> directly);
import type { MeetPerson } from '@/types/MeetPerson';

const videoCallPic = '/situation.icon/videoicon.svg';
const voiceCallPic = '/situation.icon/voiceicon.svg';
const videoChatPic = '/situation.icon/videochaticon.webp';
const _newUserPic = '/beginner.icon.webp';

type Props = {
  meetPerson: MeetPerson;
};

const PCMeetPeopleCallIcon = ({ meetPerson }: Props) => {
  const { videoCallWaiting, voiceCallWaiting, isCalling } = meetPerson;
  let callIcon = null;

  if (videoCallWaiting && voiceCallWaiting) {
    callIcon = (
      <>
        <Image src={voiceCallPic} alt="ボイスマーク" width="14" height="14" />
        <Image src={videoCallPic} alt="ビデオマーク" width="15" height="15" />
        <Image src={videoChatPic} alt="ビデオマーク" width="14" height="14" />
      </>
    );
  } else if (videoCallWaiting) {
    callIcon = (
      <>
        <Image src={videoCallPic} alt="ビデオマーク" width="17" height="17" />
        <Image src={videoChatPic} alt="ビデオマーク" width="14" height="14" />
      </>
    );
  } else if (voiceCallWaiting) {
    callIcon = (
      <Image src={voiceCallPic} alt="ボイスマーク" width="17" height="17" />
    );
  }

  if (isCalling) {
    callIcon = null; // 通話中の場合、アイコンは不要かもしれません。
  }

  return callIcon;
};

export default PCMeetPeopleCallIcon;

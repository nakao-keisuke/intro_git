// Image component removed (use <img> directly);
import type { MeetPerson } from '@/types/MeetPerson';

const videoCallPic = '/situation.icon/videoicon.svg';
const voiceCallPic = '/situation.icon/voiceicon.svg';

type Props = {
  meetPerson: MeetPerson;
  width?: number;
  height?: number;
};

const MeetPeopleCallIcon = ({ meetPerson, width = 20, height = 20 }: Props) => {
  const { videoCallWaiting, voiceCallWaiting, isCalling } = meetPerson;
  let callIcon = null;

  if (videoCallWaiting) {
    callIcon = (
      <Image
        src={videoCallPic}
        alt="ビデオマーク"
        width={width}
        height={height}
      />
    );
  } else if (!videoCallWaiting && voiceCallWaiting) {
    callIcon = (
      <Image
        src={voiceCallPic}
        alt="ボイスマーク"
        width={width}
        height={height}
      />
    );
  }

  if (isCalling) {
    callIcon = null; // 通話中の場合、アイコンは不要かもしれません。
  }

  return callIcon;
};

export default MeetPeopleCallIcon;

import MeetPeopleCallIcon from '@/components/home/meetpeople/MeetPeopleCallIcon';
import type { MeetPerson } from '@/types/MeetPerson';

type Props = {
  meetPerson: MeetPerson;
};

const MeetPeoplemallCallIcon = ({ meetPerson }: Props) => {
  const { videoCallWaiting, voiceCallWaiting, isCalling } = meetPerson;
  let callIcon = null;

  callIcon = (
    <div style={{ position: 'absolute', top: 0, right: 0 }}>
      <MeetPeopleCallIcon meetPerson={meetPerson} width={18} height={18} />
    </div>
  );

  if (isCalling) {
    callIcon = null; // 通話中の場合、アイコンは不要かもしれません。
  }

  return callIcon;
};

export default MeetPeoplemallCallIcon;

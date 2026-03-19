import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MeetPeople from '@/components/home/meetpeople/MeetPeople';
import MeetPeopleListTitle from '@/components/home/meetpeople/MeetPeopleListTitle';
import type { MeetPerson } from '@/types/MeetPerson';

type Props = {
  loginMeetPeople: (MeetPerson & {
    isCallWaiting: boolean;
    rank?: number;
    hasLovense: boolean;
  })[];
};
export type MeetPeopleMode = 'ranking' | 'new' | 'login';

const defaultMode = (typeParam: 'ranking' | 'new' | '' | undefined | null) => {
  if (!typeParam) return 'login';
  return typeParam;
};

const MeetPeopleListCard = ({ loginMeetPeople }: Props) => {
  const router = useRouter();
  const [currentMode, setCurrentMode] = useState<MeetPeopleMode>(
    defaultMode(router.query.type as 'ranking' | 'new' | '' | undefined),
  );

  useEffect(() => {
    if (router.query.type === 'ranking' && currentMode !== 'ranking') {
      setCurrentMode('ranking');
    }
    if (router.query.type === 'new' && currentMode !== 'new') {
      setCurrentMode('new');
    }
    if (router.query.type === 'login' && currentMode !== 'login') {
      setCurrentMode('login');
    }
  }, [router.query]);

  return (
    <div>
      <MeetPeopleListTitle />
      <MeetPeople meetPeople={loginMeetPeople} />
    </div>
  );
};

export default MeetPeopleListCard;

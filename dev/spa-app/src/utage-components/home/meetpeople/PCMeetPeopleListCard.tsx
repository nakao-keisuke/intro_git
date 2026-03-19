import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PCMeetPeople from '@/components/home/meetpeople/PCMeetPeople';
import PCMeetPeopleListTitle from '@/components/home/meetpeople/PCMeetPeopleListTitle';
import type { MeetPerson } from '@/types/MeetPerson';

type MeetPersonExtended = MeetPerson & {
  isLive: boolean;
  isCallWaiting: boolean;
  rank?: number;
  hasLovense: boolean;
};

type Props = {
  rankingMeetPeople: MeetPersonExtended[];
  videochatRankingMeetPeople: MeetPersonExtended[];
  twoshotRankingMeetPeople: MeetPersonExtended[];
  chatRankingMeetPeople: MeetPersonExtended[];
  totalRankingMeetPeople: MeetPersonExtended[];
  newComerMeetPeople: MeetPersonExtended[];
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

const PCMeetPeopleListCard = ({
  rankingMeetPeople,
  videochatRankingMeetPeople,
  twoshotRankingMeetPeople,
  chatRankingMeetPeople,
  totalRankingMeetPeople,
  newComerMeetPeople,
  loginMeetPeople,
}: Props) => {
  const defaultMeetPeople = (
    type: 'ranking' | 'new' | '' | undefined | null,
  ) => {
    if (!type) return loginMeetPeople;
    switch (type) {
      case 'ranking':
        return rankingMeetPeople;
      case 'new':
        return newComerMeetPeople;
    }
  };
  const router = useRouter();
  const [currentMode, setCurrentMode] = useState<MeetPeopleMode>(
    defaultMode(router.query.type as 'ranking' | 'new' | '' | undefined),
  );
  const [_currentMeetPeople, setCurrentMeetPeople] = useState<
    (MeetPerson & { isCallWaiting: boolean })[]
  >(defaultMeetPeople(router.query.type as 'ranking' | 'new' | '' | undefined));
  useEffect(() => {
    if (router.query.type === 'ranking' && currentMode !== 'ranking') {
      setCurrentMode('ranking');
      setCurrentMeetPeople(rankingMeetPeople);
    }
    if (router.query.type === 'new' && currentMode !== 'new') {
      setCurrentMode('new');
      setCurrentMeetPeople(newComerMeetPeople);
    }
    if (router.query.type === 'login' && currentMode !== 'login') {
      setCurrentMode('login');
      setCurrentMeetPeople(loginMeetPeople);
    }
  }, [router.query]);
  const changeMode = (modeTo: MeetPeopleMode) => {
    if (modeTo === 'ranking' && currentMode !== 'ranking') {
      router.replace('/pc/?type=ranking', undefined, {
        shallow: true,
      });
      setCurrentMode('ranking');
      setCurrentMeetPeople(rankingMeetPeople);
    }
    if (modeTo === 'new' && currentMode !== 'new') {
      router.replace('/pc/?type=new', undefined, {
        shallow: true,
      });
      setCurrentMode('new');
      setCurrentMeetPeople(newComerMeetPeople);
    }
    if (modeTo === 'login' && currentMode !== 'login') {
      router.replace('/pc', undefined, {
        shallow: true,
      });
      setCurrentMode('login');
      setCurrentMeetPeople(loginMeetPeople);
    }
  };

  return (
    <div>
      <PCMeetPeopleListTitle
        currentMode={currentMode}
        changeMode={changeMode}
      />
      <PCMeetPeople
        currentMode={currentMode}
        rankingMeetPeople={rankingMeetPeople}
        videochatRankingMeetPeople={videochatRankingMeetPeople}
        twoshotRankingMeetPeople={twoshotRankingMeetPeople}
        chatRankingMeetPeople={chatRankingMeetPeople}
        totalRankingMeetPeople={totalRankingMeetPeople}
        newComerMeetPeople={newComerMeetPeople}
        loginMeetPeople={loginMeetPeople}
      />
    </div>
  );
};
export default PCMeetPeopleListCard;

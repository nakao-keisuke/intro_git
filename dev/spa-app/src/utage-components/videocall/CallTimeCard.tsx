import { memo } from 'react';

type Props = {
  callTime: number;
};

const CallTimeCard = memo(({ callTime }: Props) => {
  const hour = Math.floor(callTime / 3600);
  const minute = Math.floor((callTime % 3600) / 60);
  const second = callTime % 60;

  return (
    <div className="absolute top-5 right-[150px] p-1.5 z-[3] text-white font-bold text-xl bg-black/30 rounded-[30px]">
      {`${hour.toString().padStart(2, '0')}:${minute
        .toString()
        .padStart(2, '0')}:${second.toString().padStart(2, '0')}`}
    </div>
  );
});

export default CallTimeCard;

CallTimeCard.displayName = 'CallTimeCard';

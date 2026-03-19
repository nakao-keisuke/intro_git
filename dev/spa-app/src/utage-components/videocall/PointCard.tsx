// Image component removed (use <img> directly);
import { memo } from 'react';
import { usePointStore } from '@/stores/pointStore';

const pointPic = '/y_point.webp';
const plusPic = '/call/plus.webp';

const PointCard = memo(() => {
  const point = usePointStore((s) => s.currentPoint);
  const isPointShortageAlert = usePointStore((s) => s.isPointShortageAlert);

  return (
    <div
      className={`flex items-center justify-center ${isPointShortageAlert ? 'animate-point-shortage-blink' : ''}`}
    >
      <Image
        src={pointPic}
        alt="Point Icon"
        width={15}
        height={15}
        className="mr-0.5"
      />
      <span>{point}</span>
      <Image
        src={plusPic}
        alt="Point Icon"
        width={20}
        height={20}
        className="ml-0.5"
      />
    </div>
  );
});
export default PointCard;
PointCard.displayName = 'PointCard';

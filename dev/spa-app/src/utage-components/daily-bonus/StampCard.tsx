import confetti from 'canvas-confetti';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

type LoginBonusCardProps = {
  totalDaysLoggedIn: number;
  deadline: string | undefined;
};

type CelebrationModalProps = {
  message: string;
  isVisible: boolean;
  headline?: string;
};

// 日付の差分を計算する関数
function calculateDaysRemaining(deadline: string | number | Date): number {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  return Math.ceil(
    (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function CelebrationModal({
  message,
  isVisible,
  headline = '30日連続ログイン達成！',
}: CelebrationModalProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/65">
      <div className="flex w-[min(320px,90vw)] flex-col items-center gap-3 rounded-[24px] bg-[linear-gradient(135deg,#f472b6_0%,#a855f7_50%,#6366f1_100%)] p-6 text-center font-semibold text-white shadow-[0_20px_45px_rgba(0,0,0,0.2)]">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-4xl"
          aria-hidden
        >
          🎉
        </span>
        <p className="text-[18px] tracking-[0.05em]">{headline}</p>
        <p className="font-bold text-[24px] drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
          {message}
        </p>
      </div>
    </div>
  );
}

export function LoginBonusCard({
  totalDaysLoggedIn,
  deadline,
}: LoginBonusCardProps) {
  const maxDays = 30;
  const daysArray = Array.from({ length: maxDays }, (_, i) => i + 1);
  const currentStampCounts =
    totalDaysLoggedIn === 0 ? 0 : totalDaysLoggedIn % maxDays || 30;
  const [showCelebration, setShowCelebration] = useState(false);
  const [showDeadlineWarning, setShowDeadlineWarning] = useState(false);
  const router = useRouter();

  const handleCloseModal = () => {
    setShowDeadlineWarning(false);
  };
  const [daysRemaining, setDaysRemaining] = useState(0);

  // 日付を「年-月-日」形式に変換する関数
  function formatDeadline(deadline: string) {
    const match = deadline.match(
      /(\d{4})年(\d{2})月(\d{2})日(\d{2})時(\d{2})分(\d{2})秒/,
    );
    if (match) {
      const [, year, month, day, hour, minute, second] = match;
      return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    }
    return deadline; // フォーマットが一致しない場合は元の値を返す
  }

  useEffect(() => {
    if (deadline) {
      const formattedDeadline = formatDeadline(deadline);
      const days = calculateDaysRemaining(formattedDeadline);
      setDaysRemaining(days); // 残り日数を更新

      if (days <= 3 && !showDeadlineWarning) {
        setShowDeadlineWarning(true);
      }
    }
  }, []);

  const onClickPurchase = () => {
    router.push('/purchase?source=daily_bonus');
  };

  useEffect(() => {
    if (
      totalDaysLoggedIn === 30 ||
      totalDaysLoggedIn === 60 ||
      totalDaysLoggedIn === 90
    ) {
      setShowCelebration(true);
    }
  }, [totalDaysLoggedIn]);

  useEffect(() => {
    if (!showCelebration) return;

    const hideTimer = window.setTimeout(() => {
      setShowCelebration(false);
    }, 3000);

    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 35,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
    };

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        window.clearInterval(interval);
        return;
      }

      const particleCount = Math.floor(80 * (timeLeft / duration));
      confetti({
        ...defaults,
        particleCount,
        origin: {
          x: Math.random() * 0.6 + 0.2,
          y: Math.random() * 0.4 + 0.2,
        },
      });
    }, 250);

    confetti({
      ...defaults,
      particleCount: 120,
      origin: { x: 0.5, y: 0.6 },
    });

    return () => {
      window.clearTimeout(hideTimer);
      window.clearInterval(interval);
    };
  }, [showCelebration]);

  return (
    <div className="mt-2.5 w-4/5 rounded-[3px] border border-[rgba(195,195,195,0.568)] bg-[length:350px_400px] bg-[url('https://utage-web.com/daily_bonus/yellow.webp')] bg-no-repeat text-center font-bold text-[#969696] shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
      {showDeadlineWarning && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-[rgba(39,39,39,0.5)]"
          onClick={handleCloseModal}
        >
          <div
            className="relative z-20 w-[60%] animate-popup rounded-[2vh] bg-white p-4 font-normal text-[#3f3646] text-[15px] shadow-[0_8px_20px_rgba(0,0,0,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
            ダブルデイリーボーナスの対象期間があと
            <span className="text-center font-bold text-[#f14551] drop-shadow-[0_0_3px_#fff]">
              <span className="ml-[3px] bg-[linear-gradient(transparent_30%,rgb(255,221,86)_40%)] px-[6px]">
                {daysRemaining}日
              </span>
            </span>
            で消失します。
            <br /> <br />
            ポイントを購入して延長しよう！
            <br />
            <button
              onClick={onClickPurchase}
              className="mt-[14px] rounded-[30px] bg-[linear-gradient(to_top,rgb(43,177,222),#44c2eb_60%)] px-[13px] py-[7px] font-bold text-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
            >
              ポイント購入
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute -top-[10%] -right-[10%] flex h-[35px] w-[35px] -translate-x-1/2 items-center justify-center rounded-full border-none bg-[#4a4a4a] font-bold text-2xl text-white shadow-[0_3px_5px_rgba(0,0,0,0.28)] transition hover:opacity-60 hover:shadow-[0_3px_6px_rgba(0,0,0,0.136)]"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <CelebrationModal
        message="1000pt獲得しました！"
        isVisible={showCelebration}
      />

      <div className="mx-auto mt-[5px] w-[70%] rounded-[30px] bg-white p-[2px] text-[13px] text-white tracking-[0.09em] shadow-[0px_2px_2px_rgba(0,0,0,0.049)] drop-shadow-[0_0_3px_#ef4848]">
        あと
        <span className="text-[#ffe96c] text-[17px]">
          {30 - currentStampCounts}
        </span>
        個で、
        <span className="text-[#ffe96c] text-[17px]">1,000</span>ptGET!
      </div>
      <div className="mx-auto my-[10px] grid w-[90%] grid-cols-5 justify-items-center gap-[5px] rounded-[5px] bg-white py-[5px]">
        {daysArray.map((day) => (
          <Stamp
            key={day}
            day={day}
            isActive={day <= currentStampCounts}
            isToday={day === currentStampCounts}
          />
        ))}
      </div>
      <div className="p-[3px] text-right font-normal text-[#4c4c4c] text-[10px] drop-shadow-[0_0_3px_#fff]">
        期限:
        <span className="font-extrabold text-[11px] drop-shadow-[0_0_3px_#fff]">
          {deadline}
        </span>
        まで有効！
      </div>
    </div>
  );
}

interface StampProps {
  day: number;
  isActive: boolean;
  isToday: boolean;
}

function Stamp({ day, isActive, isToday }: StampProps) {
  const baseClass =
    'relative flex h-10 w-10 items-center justify-center rounded-full border border-[#e0e0e0] bg-white text-[13px] font-bold text-[#969696] transition-transform duration-300 animate-stamp-fade-in';
  const specialClass =
    day === 30
      ? 'border-2 border-dotted border-[#ef4848b8] bg-[rgba(255,0,0,0.082)] text-[10px] text-[#ef4848] drop-shadow-[0_0_3px_#fff]'
      : '';
  const completedClass = day === 30 && isActive ? 'border-0 text-[16px]' : '';

  return (
    <div className={`${baseClass} ${specialClass} ${completedClass}`}>
      {isActive ? (
        <div className="relative flex h-full w-full items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="122"
            height="122"
            viewBox="0 0 122 122"
            className="absolute inset-0 z-10 block h-full w-full"
          >
            <circle
              className={`${
                isToday
                  ? 'stroke-[rgba(255,0,0,0.375)]'
                  : 'stroke-[hsl(271,76%,74%)]'
              } fill-none`}
              cx="60"
              cy="60"
              r="57"
              fill="none"
              stroke="hsl(271, 76%, 74%)"
              stroke-width="6px"
            ></circle>
            <circle
              className={`fill-none stroke-[hsl(271,76%,53%)] ${
                isToday
                  ? 'origin-center -rotate-90 animate-[circle_4_2s_ease-in-out_forwards] stroke-red-500 [stroke-dasharray:380] [stroke-dashoffset:380]'
                  : ''
              }`}
              cx="60"
              cy="60"
              r="57"
              fill="none"
              stroke="hsl(271, 76%, 53%)"
              stroke-width="6px"
              stroke-linecap="round"
            ></circle>
            <polyline
              className={`fill-none stroke-[hsl(271,76%,53%)] ${
                isToday
                  ? 'animate-[check_4_0.2s_2s_ease-in-out_forwards] stroke-red-500 [stroke-dasharray:45] [stroke-dashoffset:45]'
                  : ''
              }`}
              points="73.56 48.63 57.88 72.69 49.38 62"
              fill="none"
              stroke="hsl(271, 76%, 53%)"
              stroke-width="6px"
              stroke-linecap="round"
            ></polyline>
          </svg>
          <span className="relative z-0 font-bold text-[#969696]">{day}</span>
        </div>
      ) : day === 30 ? (
        '1,000pt'
      ) : (
        day
      )}
    </div>
  );
}

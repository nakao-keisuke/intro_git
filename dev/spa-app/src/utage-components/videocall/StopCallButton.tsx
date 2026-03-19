import { memo } from 'react';
import { useUIStore } from '@/stores/uiStore';

const StopCallButton = memo(() => {
  const openStopCallModal = useUIStore((s) => s.openStopCallModal);
  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    openStopCallModal();
  };

  return (
    <div className="fixed top-5 right-5 z-[2303] flex justify-center items-center">
      <button
        type="button"
        id="leave"
        onClick={onClick}
        className="border-none outline-none bg-black/40 w-10 h-10 rounded-full cursor-pointer relative transition-colors duration-200"
      >
        <span className="text-white text-[30px] font-bold leading-none absolute top-1/2 left-1/2 -translate-x-[48%] -translate-y-[58%]">
          ×
        </span>
      </button>
    </div>
  );
});

export default StopCallButton;

StopCallButton.displayName = 'StopCallButton';

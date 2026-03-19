// Image component removed (use <img> directly);
import { memo } from 'react';

const close = '/call/end.webp';

import { useUIStore } from '@/stores/uiStore';

const StopLiveButton = memo(() => {
  const openStopCallModal = useUIStore((s) => s.openStopCallModal);
  const onClick = async () => {
    openStopCallModal();
  };

  return (
    <div
      onClick={onClick}
      className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center"
    >
      <Image src={close} alt="close" width={40} height={40} />
    </div>
  );
});

export default StopLiveButton;

StopLiveButton.displayName = 'StopLiveButton';

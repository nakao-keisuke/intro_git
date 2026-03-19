import { memo, useEffect, useState } from 'react';

export const simpleBackModalMessageKey = 'simpleModalMessage';

type SimpleBackModalProps = {
  onClose?: () => void;
};

const SimpleBackModal: React.FC<SimpleBackModalProps> = memo(({ onClose }) => {
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const storedMessage = sessionStorage.getItem(simpleBackModalMessageKey);
    if (storedMessage) {
      sessionStorage.removeItem(simpleBackModalMessageKey);
      setMessage(storedMessage);
    }
  }, []);

  const handleClose = () => {
    setMessage('');
    onClose?.();
  };

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!message) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50"
      onClick={handleClickOutside}
    >
      <div className="relative w-auto min-w-[280px] max-w-[600px] rounded-[10px] bg-white px-10 py-7">
        <div className="text-center">
          <p className="mt-0 mb-5 text-[#484848] text-base tracking-[0.03em]">
            {message}
          </p>
          <span
            onClick={handleClose}
            className="mt-0 cursor-pointer rounded-full border-none bg-gradient-to-l from-[#fc999f] to-[#44c2eb] px-6 py-2.5 font-bold text-sm text-white tracking-[0.07em] shadow-[0_3px_6px_0_rgba(0,0,0,0.136)] transition-opacity duration-300 hover:opacity-60"
          >
            閉じる
          </span>
        </div>
      </div>
    </div>
  );
});

SimpleBackModal.displayName = 'SimpleBackModal';

export default SimpleBackModal;

import type React from 'react';
import { ClipLoader } from 'react-spinners';

interface SuspenseLoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const SuspenseLoading: React.FC<SuspenseLoadingProps> = ({
  message = '読み込み中...',
  size = 'medium',
  className = '',
}) => {
  // サイズ設定
  const sizeConfig = {
    small: {
      container: 'p-4',
      spinnerSize: 30,
      text: 'text-xs sm:text-sm',
    },
    medium: {
      container: 'p-6',
      spinnerSize: 40,
      text: 'text-xs sm:text-sm',
    },
    large: {
      container: 'p-8',
      spinnerSize: 50,
      text: 'text-sm sm:text-base',
    },
  };

  const config = sizeConfig[size];

  return (
    <div
      className={`flex min-h-[50vh] w-full items-center justify-center ${config.container}`}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        {/* 円形回転スピナー */}
        <ClipLoader size={config.spinnerSize} color="#ff69b4" />

        {/* メッセージ */}
        <p
          className={`
                    ${config.text}text-gray-600 m-0 font-medium tracking-wide dark:text-gray-400`}
        >
          {message}
        </p>
      </div>
    </div>
  );
};

export default SuspenseLoading;

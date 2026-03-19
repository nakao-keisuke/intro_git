import { ClipLoader } from 'react-spinners';

interface LoadingCardProps {
  title?: string;
  message?: string;
  height?: string;
  className?: string;
  titleClassName?: string;
  refreshButton?: React.ReactNode;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  title,
  message = '更新中...',
  height = 'h-[96px] md:h-40',
  className = '',
  titleClassName = 'text-base md:text-xl font-bold md:text-gray-800',
  refreshButton,
}) => {
  return (
    <div className={`w-full p-2 ${className}`}>
      {(title || refreshButton) && (
        <div className="mb-2 flex items-center justify-between md:mb-0">
          {title && <h2 className={titleClassName}>{title}</h2>}
          {refreshButton}
        </div>
      )}
      <div
        className={`${height} mt-2 flex items-center justify-center rounded-lg bg-gray-50 md:mt-0`}
      >
        <div className="flex flex-col items-center">
          <ClipLoader size={32} color="#ff69b4" />
          <p className="mt-2 text-gray-600 text-xs">{message}</p>
        </div>
      </div>
    </div>
  );
};

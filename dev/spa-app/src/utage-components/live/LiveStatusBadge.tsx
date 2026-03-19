// Image component removed (use <img> directly);

type BadgeSize = 'sm' | 'md' | 'lg';
type BadgeVariant = 'live' | 'standby';

type Props = {
  variant: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  userCount?: number;
};

const sizeConfig = {
  sm: {
    container: 'text-[10px] px-1.5 py-0.5 gap-1',
    icon: { width: 12, height: 12 },
    dot: 'w-1.5 h-1.5',
  },
  md: {
    container: 'text-xs px-2 py-1 gap-1',
    icon: { width: 16, height: 16 },
    dot: 'w-2 h-2',
  },
  lg: {
    container: 'text-sm px-2.5 py-1.5 gap-1.5',
    icon: { width: 20, height: 20 },
    dot: 'w-2.5 h-2.5',
  },
};

export const LiveStatusBadge = ({
  variant,
  size = 'md',
  className = '',
  userCount,
}: Props) => {
  const config = sizeConfig[size];

  if (variant === 'live') {
    return (
      <div
        className={`absolute top-1 left-1 flex items-center rounded-md bg-gradient-to-r from-red-600 to-red-500 font-bold text-white shadow-lg ${config.container} ${className}`}
      >
        <div className="relative">
          <div className="absolute h-2 w-2 animate-ping rounded-full" />
          <Image
            src="/live.webp"
            alt="配信中"
            width={config.icon.width}
            height={config.icon.height}
            className="relative animate-pulse [filter:brightness(0)_invert(1)]"
          />
        </div>
        <span className="relative">LIVE</span>
        {userCount !== undefined && userCount > 0 && (
          <span className="ml-0.5 font-bold">({userCount})</span>
        )}
      </div>
    );
  }

  // standby variant
  return (
    <div
      className={`absolute top-1 left-1 flex items-center rounded bg-gray-800/80 font-bold text-white ${config.container} ${className}`}
    >
      <div className={`${config.dot} animate-pulse rounded-full bg-white`} />
      <span>待機中</span>
    </div>
  );
};

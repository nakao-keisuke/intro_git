interface LoadingDotsProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'gray' | 'white';
  className?: string;
}

export default function LoadingDots({
  text = '読み込み中...',
  size = 'md',
  color = 'blue',
  className = '',
}: LoadingDotsProps) {
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const colorClasses = {
    blue: ['bg-blue-600', 'bg-sky-600', 'bg-blue-600'],
    gray: ['bg-gray-600', 'bg-gray-500', 'bg-gray-600'],
    white: ['bg-white', 'bg-gray-100', 'bg-white'],
  };

  const textColorClasses = {
    blue: 'text-gray-500',
    gray: 'text-gray-600',
    white: 'text-white',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const dots = colorClasses[color];

  return (
    <div className={`py-8 text-center ${className}`}>
      <div className="inline-flex flex-col items-center gap-3">
        <div className="flex gap-1">
          {dots.map((bgColor, index) => (
            <div
              key={index}
              className={`${sizeClasses[size]} ${bgColor} animate-bounce rounded-full`}
              style={{ animationDelay: `${index * 150}ms` }}
            />
          ))}
        </div>
        {text && (
          <span
            className={`${textColorClasses[color]} ${textSizeClasses[size]} font-medium`}
          >
            {text}
          </span>
        )}
      </div>
    </div>
  );
}

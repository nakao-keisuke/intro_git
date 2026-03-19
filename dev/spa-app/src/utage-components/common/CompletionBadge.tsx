import { IconCheck } from '@tabler/icons-react';
import type React from 'react';

interface CompletionBadgeProps {
  text: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function CompletionBadge({
  text,
  icon,
  className = '',
}: CompletionBadgeProps) {
  return (
    <div className={`py-12 text-center ${className}`}>
      <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2">
        {icon || <IconCheck className="h-4 w-4 text-gray-400" stroke={2} />}
        <span className="font-medium text-gray-500 text-sm">{text}</span>
      </div>
    </div>
  );
}

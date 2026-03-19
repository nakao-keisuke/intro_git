import { IconMessage2 } from '@tabler/icons-react';
import type React from 'react';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
}

export default function EmptyState({
  icon: Icon = IconMessage2,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-24">
      <div className="relative mb-6">
        {/* グラデーション背景 */}
        <div className="absolute inset-0 scale-150 rounded-full bg-gradient-to-br from-blue-200 to-sky-200 opacity-30 blur-2xl" />

        {/* アイコン */}
        <div className="relative rounded-full bg-gradient-to-br from-blue-100 to-sky-100 p-8">
          <Icon className="h-16 w-16 text-blue-600" stroke={1.5} />
        </div>
      </div>

      <h3 className="mb-2 font-semibold text-gray-900 text-lg">{title}</h3>
      <p className="max-w-sm text-center text-gray-500 text-sm">
        {description}
      </p>
    </div>
  );
}

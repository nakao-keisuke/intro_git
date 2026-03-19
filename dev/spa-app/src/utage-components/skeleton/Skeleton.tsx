import type React from 'react';
import SkeletonBase, {
  type SkeletonProps as BaseSkeletonProps,
} from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

type SkeletonProps = BaseSkeletonProps & {
  className?: string;
};

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <SkeletonBase
      baseColor="#e5e7eb"
      highlightColor="#f3f4f6"
      {...(className && { className })}
      {...props}
    />
  );
};

export default Skeleton;

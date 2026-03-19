import type { ReactNode } from 'react';

type InfoContainerProps = {
  children: ReactNode;
  className?: string;
};

export default function InfoContainer({
  children,
  className,
}: InfoContainerProps) {
  const base = 'bg-[#e0e0e0] w-full min-h-screen pb-2.5';
  const classes = className ? `${base} ${className}` : base;

  return <div className={classes}>{children}</div>;
}

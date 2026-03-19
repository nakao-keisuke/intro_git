import dynamic from 'next/dynamic';

export const IncomingVideoCallComponent = dynamic(
  () =>
    import('@/components/incoming/IncomingVideoCall').then(
      (mod) => mod.default,
    ),
  { ssr: false },
);

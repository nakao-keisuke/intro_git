import dynamic from 'next/dynamic';

export const IncomingVoiceCallComponent = dynamic(
  () =>
    import('@/components/incoming/IncomingVoiceCall').then(
      (mod) => mod.default,
    ),
  { ssr: false },
);

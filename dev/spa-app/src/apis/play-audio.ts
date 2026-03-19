import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type PlayAudioRequest = JamboRequest & {
  readonly api: 'play_audio';
  readonly token: string;
  readonly audio_id: string;
};

export type PlayAudioResponseData = JamboResponseData & {};

export const playAudioRequest = (
  token: string,
  audioId: string,
): PlayAudioRequest => ({
  api: 'play_audio',
  token,
  audio_id: audioId,
});

import { PLAY_AUDIO } from '@/constants/endpoints';
import type { HttpClient } from '@/libs/http/HttpClient';
import { Context } from '@/libs/http/type';
import type { PlayAudioRequest, PlayAudioResponse } from './type';

// Service Interface
export interface AudioService {
  playAudio: (audioId: string) => Promise<PlayAudioResponse>;
  purchaseAudio: (audioId: string) => Promise<PlayAudioResponse>;
}

// Client実装（ブラウザ用）
export class ClientAudioService implements AudioService {
  constructor(private readonly client: HttpClient) {}

  async playAudio(audioId: string): Promise<PlayAudioResponse> {
    const request: PlayAudioRequest = {
      audioId,
    };

    return this.client.post<PlayAudioResponse>(PLAY_AUDIO, request);
  }

  async purchaseAudio(audioId: string): Promise<PlayAudioResponse> {
    try {
      return await this.client.post<PlayAudioResponse>(PLAY_AUDIO, {
        audioId,
      });
    } catch (error) {
      console.error('Failed to purchase audio:', error);
      return {
        type: 'error',
        message: '音声の購入に失敗しました',
      };
    }
  }
}

// Server実装（必要に応じて実装）
export class ServerAudioService implements AudioService {
  constructor(readonly _client: HttpClient) {}

  async playAudio(_audioId: string): Promise<PlayAudioResponse> {
    // サーバー側での実装が必要な場合はここに実装
    throw new Error('Server-side audio playback is not implemented');
  }

  async purchaseAudio(_audioId: string): Promise<PlayAudioResponse> {
    // サーバー側での実装が必要な場合はここに実装
    throw new Error('Server-side audio purchase is not implemented');
  }
}

// Factory関数
export function createAudioService(client: HttpClient): AudioService {
  if (client.getContext() === Context.SERVER) {
    return new ServerAudioService(client);
  } else {
    return new ClientAudioService(client);
  }
}

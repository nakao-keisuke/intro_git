import { addOpenedContentRequest } from '@/apis/add-opened-content';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
import type { AddOpenedContentResponse } from './type';

export interface OpenedContentService {
  addOpenedContent: (
    token: string,
    fileId: string,
    isImage?: boolean,
    openedContentType?: 'audio' | 'image' | 'video',
  ) => Promise<APIResponse<AddOpenedContentResponse> | null>;
}

//Client実装
export class ClientOpenedContentService implements OpenedContentService {
  constructor(readonly _client: HttpClient) {}

  async addOpenedContent(
    _token: string,
    _fileId: string,
    _isImage?: boolean,
    _openedContentType?: 'audio' | 'image' | 'video',
  ): Promise<APIResponse<AddOpenedContentResponse> | null> {
    throw new Error(
      'Client-side opened content tracking should go through API routes',
    );
  }
}

//Server実装
export class ServerOpenedContentService implements OpenedContentService {
  private readonly apiUrl: string = import.meta.env.API_URL!;

  constructor(private readonly client: HttpClient) {}

  async addOpenedContent(
    token: string,
    fileId: string,
    isImage?: boolean,
    openedContentType?: 'audio' | 'image' | 'video',
  ): Promise<APIResponse<AddOpenedContentResponse> | null> {
    try {
      const request = addOpenedContentRequest(
        token,
        fileId,
        isImage,
        openedContentType,
      );

      const response = await this.client.post<
        APIResponse<AddOpenedContentResponse>
      >(this.apiUrl, request);

      return response;
    } catch (error) {
      console.error('⚠️ AddOpenedContent service error:', {
        fileId,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }
}

export function createOpenedContentService(
  client: HttpClient,
): OpenedContentService {
  if (client.getContext() === Context.SERVER) {
    return new ServerOpenedContentService(client);
  } else {
    return new ClientOpenedContentService(client);
  }
}

import type {
  GetVideoChatMessagesApiResponse,
  GetVideoChatMessagesRequest,
  GetVideoChatMessagesResponse,
} from '@/apis/http/videoChatMessage';
import { HTTP_GET_VIDEO_CHAT_MESSAGES } from '@/constants/endpoints';
import type { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import type { ResponseData } from '@/types/NextApi';

export const createLiveChatService = (httpClient: ClientHttpClient) => {
  return {
    getVideoChatMessages: async (
      broadcasterId: string,
    ): Promise<GetVideoChatMessagesResponse> => {
      const request: GetVideoChatMessagesRequest = {
        female_id: broadcasterId,
      };

      const response = await httpClient.post<
        ResponseData<GetVideoChatMessagesApiResponse>
      >(HTTP_GET_VIDEO_CHAT_MESSAGES, request);

      if ('type' in response && response.type === 'error') {
        throw new Error(
          response.message || 'Failed to fetch video chat messages',
        );
      }

      return 'data' in response ? response.data : [];
    },
  };
};

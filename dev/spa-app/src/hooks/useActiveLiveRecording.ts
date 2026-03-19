import { useQuery } from '@tanstack/react-query';
import type {
  GetActiveLiveRecordingRouteData,
  GetActiveLiveRecordingRouteResponse,
} from '@/apis/http/liveRecording';
import { HTTP_GET_ACTIVE_LIVE_RECORDING } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';

type UseActiveLiveRecordingReturn = {
  data: GetActiveLiveRecordingRouteData | null;
  isLoading: boolean;
  error: string | null;
};

export const useActiveLiveRecording = (): UseActiveLiveRecordingReturn => {
  const {
    data: queryData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['activeLiveRecording'],
    queryFn: async () => {
      const client = new ClientHttpClient();
      const response = await client.get<GetActiveLiveRecordingRouteResponse>(
        HTTP_GET_ACTIVE_LIVE_RECORDING,
      );

      if (response.type === 'error') {
        throw new Error(response.message);
      }

      return response.data ?? null;
    },
    staleTime: 30 * 1000, // 30秒間はキャッシュされたデータを使用
    gcTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    retry: false,
  });

  if (isError) {
    return {
      data: null,
      isLoading: false,
      error: error instanceof Error ? error.message : 'エラーが発生しました',
    };
  }

  return {
    data: queryData ?? null,
    isLoading,
    error: null,
  };
};

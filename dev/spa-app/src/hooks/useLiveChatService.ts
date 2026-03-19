import { useMemo } from 'react';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import { createLiveChatService } from '@/services/liveChat/liveChatService';

export const useLiveChatService = () => {
  const clientHttpClient = useMemo(() => new ClientHttpClient(), []);
  const liveChatService = useMemo(
    () => createLiveChatService(clientHttpClient),
    [clientHttpClient],
  );
  return liveChatService;
};

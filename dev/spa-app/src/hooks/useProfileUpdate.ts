import { useState } from 'react';
import { UPDATE_USER_INFO } from '@/constants/endpoints';
import { event } from '@/constants/ga4Event';
import type { UpdateUserInfo } from '@/types/UpdateUserInfo';
import { trackEvent } from '@/utils/eventTracker';
import { postToNext } from '@/utils/next';

export const useProfileUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProfile = async (data: Partial<UpdateUserInfo>) => {
    setIsUpdating(true);
    try {
      const response = await postToNext<{}>(UPDATE_USER_INFO, data);
      setIsUpdating(false);
      if (response?.type === 'success') {
        // プロフィール編集成功時にGA4/Repro/Adjustへ送信
        trackEvent(event.edit_profile);
      }
      return response;
    } catch (error) {
      setIsUpdating(false);
      throw error;
    }
  };

  return {
    updateProfile,
    isUpdating,
  };
};

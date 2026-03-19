import { useRouter } from 'next/router';
import { useGetMyInfo } from '@/hooks/useGetMyInfo.hook';
import { useUIStore } from '@/stores/uiStore';

/**
 * Authentication guard utility that checks if user is authenticated
 * and shows register modal if not authenticated
 */
export const useAuthGuard = () => {
  const { isLoginUser, isLoading } = useGetMyInfo();
  const openRegisterModal = useUIStore((s) => s.openRegisterModal);
  const router = useRouter();

  /**
   * Checks if user is authenticated and handles navigation
   * @param callback - Function to execute if user is authenticated
   * @returns boolean - true if user is authenticated, false otherwise
   */
  const requireAuth = (callback: () => void): boolean => {
    if (isLoading) {
      return false;
    }

    if (!isLoginUser) {
      openRegisterModal();
      return false;
    }

    callback();
    return true;
  };

  /**
   * Checks if user is authenticated for navigation
   * @param path - Path to navigate to
   * @returns boolean - true if user is authenticated, false otherwise
   */
  const requireAuthForNavigation = (path: string): boolean => {
    if (isLoading) {
      return false;
    }

    if (!isLoginUser) {
      openRegisterModal();
      return false;
    }

    router.push(path);
    return true;
  };

  return {
    requireAuth,
    requireAuthForNavigation,
    isLoginUser,
    isLoading,
  };
};

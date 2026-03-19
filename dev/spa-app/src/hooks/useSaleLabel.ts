import { useMemo } from 'react';
import { useMyPageStore } from '@/stores/myPageStore';

export const useSaleLabel = (): boolean => {
  const myPageData = useMyPageStore((s) => s.initialData);

  return useMemo(() => {
    if (!myPageData) return false;
    return (
      myPageData.isFirstBonusCourseExist ||
      myPageData.isSecondBonusCourseExist ||
      myPageData.isThirdBonusCourseExist ||
      myPageData.isFourthBonusCourseExist
    );
  }, [myPageData]);
};

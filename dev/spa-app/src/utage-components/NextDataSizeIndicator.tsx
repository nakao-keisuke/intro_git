import { useEffect, useState } from 'react';
import styles from './NextDataSizeIndicator.module.css';

const NextDataSizeIndicator: React.FC = () => {
  const [dataSize, setDataSize] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 開発環境でのみ表示
    if (import.meta.env.NODE_ENV !== 'development') {
      return;
    }

    const calculateDataSize = () => {
      const nextDataElement = document.getElementById('__NEXT_DATA__');
      if (nextDataElement?.textContent) {
        const sizeInBytes = new Blob([nextDataElement.textContent]).size;
        const sizeInKB = sizeInBytes / 1024;
        setDataSize(sizeInKB);
        setIsVisible(true);
      }
    };

    // 初回計算
    calculateDataSize();

    // ページ遷移時に再計算
    const handleRouteChange = () => {
      setTimeout(calculateDataSize, 100);
    };

    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  // サイズに応じて色を決定
  const getColorClass = () => {
    if (dataSize < 50) return styles.good;
    if (dataSize < 100) return styles.warning;
    return styles.bad;
  };

  return (
    <div className={`${styles.container} ${getColorClass()}`}>
      <div className={styles.label}>__NEXT_DATA__</div>
      <div className={styles.size}>{dataSize.toFixed(2)} KB</div>
      <div className={styles.status}>
        {dataSize < 50 && '✅ 理想的'}
        {dataSize >= 50 && dataSize < 100 && '⚠️ 許容範囲'}
        {dataSize >= 100 && '❌ 要改善'}
      </div>
    </div>
  );
};

export default NextDataSizeIndicator;

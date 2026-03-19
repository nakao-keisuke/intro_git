import { useState } from 'react';
import ExplainModal from '@/components/home/ExplainModal';
import PointHowtoModal from '@/components/home/PointHowtoModal';
import { useCallStore } from '@/stores/callStore';
import styles from '@/styles/home/ExplainBar.module.css';
import { inCall } from '@/utils/callState';

const ExplainBar: React.FC = ({}) => {
  const callState = useCallStore((s) => s.callState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPointOpen, setIsPointOpen] = useState(false);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const PointOpen = () => {
    setIsPointOpen(true);
  };

  const PointClose = () => {
    setIsPointOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  if (callState === inCall) return <div></div>;

  return (
    <div className={styles.header}>
      <div className={styles.verticalContainer}>
        <span onClick={PointOpen} className={styles.news}>
          ポイント説明 <div className={styles.next}>&gt; </div>
        </span>
        <span onClick={handleModalOpen} className={styles.hatena}>
          アイコン説明<div className={styles.next}>&gt; </div>
        </span>
      </div>
      {isModalOpen && <ExplainModal onClose={handleModalClose} />}
      {isPointOpen && <PointHowtoModal onClose={PointClose} />}
    </div>
  );
};
export default ExplainBar;

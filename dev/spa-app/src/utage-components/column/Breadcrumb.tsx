import { Link } from '@tanstack/react-router';
import type React from 'react';
import styles from '@/styles/column/Breadcrumb.module.css';

type Props = {
  title: string;
};

const Breadcrumb: React.FC<Props> = ({ title }) => {
  return (
    <nav className={styles.breadcrumb} aria-label="パンくずリスト">
      <ol className={styles.list}>
        <li className={styles.item}>
          <Link href="/column">コラム一覧</Link>
        </li>
        <li className={styles.item}>
          <span className={styles.separator}>＞</span>
          <span className={styles.current} title={title}>
            {title}
          </span>
        </li>
      </ol>
    </nav>
  );
};

export default Breadcrumb;

// Image component removed (use <img> directly);
import styles from '@/styles/PwaInstallButton.module.css';

const UtagePic = '/app.webp';

import { InstallButton } from './InstallButton';
import { PWAModal } from './PWAModal';

export const PwaInstallButton = () => {
  return (
    <div>
      <PWAModal />
      <div className={styles.banner}>
        <Image
          src={UtagePic}
          alt="アイコン"
          width="55"
          height="55"
          className={styles.icon}
        />
        <div className={styles.text}>
          <div className={styles.title}>今だけ！100pt ゲット！</div>
          Utageのアプリをインストールで
          <br />
          ポイントプレゼント中！
        </div>
        <InstallButton
          props={{
            className: styles.addButton,
          }}
        >
          ゲット
        </InstallButton>
      </div>
    </div>
  );
};

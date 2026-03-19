// Image component removed (use <img> directly);
import signPic from 'public/tuto/signup.webp';
import type React from 'react';
import styles from '@/styles/components/common/FloatingSignupButton.module.css';

interface Props {
  onClick?: () => void;
}

export const FloatingSignupButton: React.FC<Props> = ({ onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className={styles.buttonWrapper}>
      <a
        href="https://utage-web.com/signup"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.button}
        onClick={handleClick}
      >
        <Image
          src={signPic}
          alt="今すぐ無料で始める"
          width={340}
          height={160}
          priority={true}
          loading="eager"
        />
      </a>
    </div>
  );
};

// Image component removed (use <img> directly);
import styles from '@/styles/tuto/Startbtn.module.css';

const signupPic = '/tuto/tuto_login_btn.webp';
const hukidashiPic = '/tuto/tuto_login_btn_hukidashi.webp';

import { Link } from '@tanstack/react-router';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { trackEvent } from '@/utils/eventTracker';

const Startbtn: React.FC = () => {
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== 'undefined') {
      const registeredStatus = localStorage.getItem('isRegistered') === 'true';
      setIsRegistered(registeredStatus);
    }
  }, []);

  const handleStartNow = () => {
    if (isRegistered) {
      router.push('/login');
    } else {
      router.push('/signup');
    }
  };

  const markerRef = useRef(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
            setShowButton(true);
          } else {
            setShowButton(false);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      },
    );

    observer.observe(marker);

    return () => {
      if (marker) observer.unobserve(marker);
    };
  }, []);

  const [showBubbles, setShowBubbles] = useState({
    B: false,
    C: false,
    D: false,
  });

  const bubbleARef = useRef(null);

  useEffect(() => {
    const bubbleA = bubbleARef.current;
    if (!bubbleA) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShowBubbles({
              B: true,
              C: true,
              D: true,
            });
            observer.unobserve(bubbleA);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      },
    );

    observer.observe(bubbleA);

    return () => {
      if (bubbleA) observer.unobserve(bubbleA);
    };
  }, []);

  useEffect(() => {
    if (showBubbles.B) {
      const timerC = setTimeout(() => {
        setShowBubbles((prev) => ({ ...prev, C: true }));
      }, 500);

      const timerD = setTimeout(() => {
        setShowBubbles((prev) => ({ ...prev, D: true }));
      }, 1000);

      return () => {
        clearTimeout(timerC);
        clearTimeout(timerD);
      };
    }
    return () => {};
  }, [showBubbles.B]);

  useEffect(() => {
    trackEvent('OPEN_HOME_PAGE');
  }, []);

  return (
    <div className={styles.container}>
      <div ref={markerRef} />
      <div className={styles.search_button}>
        <div className={styles.search_button_title}>
          <div className={styles.button_title}>
            <Image
              src={hukidashiPic}
              alt="login"
              width={280}
              className={styles.hukidashiPic}
            />
          </div>
          <div className={styles.button_title} onClick={handleStartNow}>
            <Image
              src={signupPic}
              alt="signup"
              width={290}
              className={styles.signupPic}
            />
          </div>
        </div>
      </div>
      {showButton && (
        <div className={styles.floatingButton}>
          <Link href="/home">
            <div className={styles.floatingButtonContent}>今すぐ始める</div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Startbtn;

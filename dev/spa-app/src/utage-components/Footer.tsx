// Image component removed (use <img> directly);
import { Link } from '@tanstack/react-router';
import { getSession } from 'next-auth/react';
// TODO: i18n - import { useTranslations } from '#/i18n';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isNativeApplication } from '@/constants/applicationId';
import styles from '@/styles/Footer.module.css';

type FooterProps = {
  style?: React.CSSProperties; // styleプロパティを追加
};

const Footer: React.FC<FooterProps> = ({ style }) => {
  const t = useTranslations('footer');
  const [osType, setOsType] = useState('Unknown');
  const [browserType, setBrowserType] = useState('Unknown');
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>(t('unregistered'));
  const ipCacheRef = useRef<string | null>(null);

  const getOSType = () => {
    if (typeof window === 'undefined') return 'Unknown';

    let OSName = 'Unknown';
    if (window.navigator.userAgent.indexOf('Windows NT 10.0') !== -1)
      OSName = 'Windows 10';
    if (window.navigator.userAgent.indexOf('Windows NT 6.2') !== -1)
      OSName = 'Windows 8';
    if (window.navigator.userAgent.indexOf('Windows NT 6.1') !== -1)
      OSName = 'Windows 7';
    if (window.navigator.userAgent.indexOf('Windows NT 6.0') !== -1)
      OSName = 'Windows Vista';
    if (window.navigator.userAgent.indexOf('Windows NT 5.1') !== -1)
      OSName = 'Windows XP';
    if (window.navigator.userAgent.indexOf('Windows NT 5.0') !== -1)
      OSName = 'Windows 2000';
    if (window.navigator.userAgent.indexOf('Mac') !== -1) OSName = 'MacOS';
    if (window.navigator.userAgent.indexOf('X11') !== -1) OSName = 'UNIX';
    if (window.navigator.userAgent.indexOf('Linux') !== -1) OSName = 'Linux';
    if (window.navigator.userAgent.match(/iPhone|iPad|iPod/i)) OSName = 'iOS';
    if (window.navigator.userAgent.match(/Android/i)) OSName = 'Android';
    if (window.navigator.userAgent.match(/Windows Phone/i))
      OSName = 'Windows Phone';

    return OSName;
  };

  const getBrowserType = () => {
    if (typeof window === 'undefined') return 'Unknown';

    let browserName = 'Unknown';

    // Check if user is using Internet Explorer
    if (
      !!window.navigator.userAgent.match(/MSIE/i) ||
      !!window.navigator.userAgent.match(/Trident.*rv:11\./)
    ) {
      browserName = 'Internet Explorer';
    }
    // Check if user is using Firefox
    else if (window.navigator.userAgent.match(/Firefox/i)) {
      browserName = 'Firefox';
    }
    // Check if user is using Edge
    else if (window.navigator.userAgent.match(/Edge/i)) {
      browserName = 'Edge';
    }
    // Check if user is using Google Chrome
    // Note: Chrome userAgent string includes 'Safari' so we need to check for Chrome before Safari
    else if (window.navigator.userAgent.match(/Chrome/i)) {
      browserName = 'Chrome';
    }
    // Check if user is using Safari
    else if (window.navigator.userAgent.match(/Safari/i)) {
      browserName = 'Safari';
    }
    // Check if user is using Opera
    else if (
      !!window.navigator.userAgent.match(/Opera/i) ||
      !!window.navigator.userAgent.match(/OPR/i)
    ) {
      browserName = 'Opera';
    }

    return browserName;
  };

  const getIPAddress = useCallback(async () => {
    if (ipCacheRef.current) return ipCacheRef.current;
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      ipCacheRef.current = data.ip;
      return data.ip as string;
    } catch {
      return t('unknown');
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOsType(getOSType());
      setBrowserType(getBrowserType());

      getSession().then((session) => {
        if (session?.user) {
          setUserId(session.user.id || 'null');
          setUserName(session.user.name || t('unregistered'));
        }
      });
    }
  }, []);

  // お問い合わせリンククリック時にIPを取得してmailtoを開く
  const handleContactClick = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const ip = await getIPAddress();
      const mailLink = `mailto:support@utage-web-support.awsapps.com?subject=Utage-Webについて&body=※以下の情報は消さずにお送りください。%0D%0A%0D%0Aid:${userId}%0D%0Aip:${ip}%0d%0aname:${userName}%0d%0AOS Type:${osType}%0D%0ABrowser:${browserType}%0D%0A`;
      window.location.href = mailLink;
    },
    [getIPAddress, userId, userName, osType, browserType],
  );

  // Renka（ネイティブアプリ）の場合はフッターを非表示（余白のみ確保）
  if (isNativeApplication()) {
    return <div className="mb-[80px]" />;
  }

  return (
    <footer className={styles.footer} style={style}>
      <div className={styles.inner}>
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li className={styles.navListItem}>
              <Link href="/login" passHref>
                <span>{t('login')}</span>
              </Link>
            </li>
            <li className={styles.navListItem}>
              <Link href="/signup" passHref>
                <span>{t('register')}</span>
              </Link>
            </li>
            <li className={styles.navListItem}>
              <Link href="/girls/all" passHref>
                <span>{t('home')}</span>
              </Link>
            </li>
            <li className={styles.navListItem}>
              <Link href="/column" passHref>
                <span>{t('column')}</span>
              </Link>
            </li>
            <li className={styles.navListItem}>
              <Link href="/faq" passHref>
                <span>{t('faq')}</span>
              </Link>
            </li>
            <li className={styles.navListItem}>
              <a href="#contact" onClick={handleContactClick}>
                <span>{t('contact')}</span>
              </a>
            </li>
            <li className={styles.navListItem}>
              <Link href={'/sitemap'} passHref>
                <span>{t('sitemap')}</span>
              </Link>
            </li>
            <li className={styles.navListItem}>
              <Link href="/tos" passHref>
                <span>{t('terms')}</span>
              </Link>
            </li>
            <li className={styles.navListItem}>
              <Link href="/privacy" passHref>
                <span>{t('privacy')}</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* SNSリンク */}
        <div className={styles.socialLinks}>
          <Link
            href="https://x.com/Utage_official_"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.snsLink}
          >
            <Image
              src="/X_icon.webp"
              alt={t('xTwitterAlt')}
              width={50}
              height={50}
            />
          </Link>
          <Link
            href="https://note.com/utage_official"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.snsLink}
          >
            <Image src="/note_icon.webp" alt="note" width={70} height={70} />
          </Link>
          <Link
            href="https://www.facebook.com/share/1CTN5vXnWe/?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.snsLink}
          >
            <Image
              src="/facebook_icon.webp"
              alt="Facebook"
              width={50}
              height={50}
            />
          </Link>
        </div>
      </div>
      <p className={styles.copyRight}>{t('copyright')}</p>
    </footer>
  );
};

export default Footer;

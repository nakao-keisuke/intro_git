// TODO: i18n - import { useTranslations } from '#/i18n';
import { memo, type ReactNode, useEffect, useState } from 'react';
import { isNativeApplication } from '@/constants/applicationId';
import styles from '@/styles/mypage/ContactModal.module.css';

type Props = {
  onClose: () => void;
  children?: ReactNode;
  userId: string | null;
  userName: string;
  courseAmount: any;
};

const ContactModal: React.FC<Props> = memo(
  ({ onClose, userId, userName, courseAmount }) => {
    const t = useTranslations('auth');

    const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    const getOSType = () => {
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

    const osType = getOSType();
    const browserType = getBrowserType();

    const getIPAddress = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
      } catch (error) {
        console.error('IPアドレスの取得に失敗しました:', error);
        return '不明';
      }
    };
    const [ipAddress, setIpAddress] = useState('取得中...');
    useEffect(() => {
      getIPAddress()
        .then((ip) => {
          setIpAddress(ip);
        })
        .catch((error) => {
          console.error('IPアドレスの取得に失敗しました:', error);
          setIpAddress('取得不可');
        });
    }, []);

    // userId が null または 'null' 文字列の場合にのみ IP アドレスをリンクに含める（未登録ユーザーの問い合わせ用）
    const includeIpAddress = userId === null || userId === 'null';

    const courseMessage = courseAmount
      ? `${courseAmount}円コースの購入を希望します。銀行口座を教えてください%0D%0A`
      : '';

    const handleMailClick = () => {
      const mailSubject = isNativeApplication()
        ? t('contactSubjectRenka')
        : t('contactSubjectUtage');
      window.location.href = `mailto:support@utage-web-support.awsapps.com?subject=${mailSubject}&body=※以下の情報は消さずにお送りください。%0D%0A%0D%0Aid:${
        includeIpAddress ? `null%0D%0Aip:${ipAddress}` : userId
      }%0d%0aname:${userName}%0d%0AOS Type:${osType}%0D%0ABrowser:${browserType}%0D%0A${courseMessage}`;
    };

    return (
      <div className={styles.modalBackdrop} onClick={handleClickOutside}>
        <div className={styles.modalContent}>
          <center>
            <p className={styles.title}>{t('contactTitle')}</p>
          </center>
          <div className={styles.p}>{t('contactDescription')}</div>

          <button
            type="button"
            onClick={handleMailClick}
            className={styles.list}
          >
            {t('contactEmail')}
          </button>

          <center>
            <button onClick={onClose} className={styles.closeButton}>
              {t('contactClose')}
            </button>
          </center>
        </div>
      </div>
    );
  },
);

ContactModal.displayName = 'ContactModal';

export default ContactModal;

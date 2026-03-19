// Image component removed (use <img> directly);
import { useEffect, useState } from 'react';
import styles from '@/styles/CheckModal.module.css';

const CheckPIC = '/check.webp';
const attentionPic = '/header/attention.webp';

import router from 'next/router';

type Props = {
  onClose: (event: React.MouseEvent<any>) => void;
};
const CheckModal: React.FC<Props> = ({ onClose }) => {
  const [_videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [_isBrowserCompatible, _setIsBrowserCompatible] = useState(false);
  const [isCameraAccessible, setIsCameraAccessible] = useState(false);
  const [isMicAccessible, setIsMicAccessible] = useState(false);
  const [_browserErrorMsg, _setBrowserErrorMsg] = useState('');
  const [cameraErrorMsg, setCameraErrorMsg] = useState('');
  const [micErrorMsg, setMicErrorMsg] = useState('');
  const [isCameraChecking, setIsCameraChecking] = useState(false);
  const [isMicChecking, setIsMicChecking] = useState(false);
  const [_isAllChecked, setIsAllChecked] = useState(false);
  // const checkBrowserCompatibility = () => {
  //   const agent = window.navigator.userAgent;
  //   const isChrome =
  //     /Chrome/.test(agent) && !/Edge/.test(agent) && !/OPR/.test(agent);
  //   const isSafari = /Safari/.test(agent) && !/Chrome/.test(agent);
  //   const isFirefox = /Firefox/.test(agent);
  //   if ((isChrome || isSafari) && !isFirefox) {
  //     setIsBrowserCompatible(true);
  //     setBrowserErrorMsg('');
  //   } else {
  //     setIsBrowserCompatible(false);
  //     setBrowserErrorMsg(
  //       '推奨ブラウザではありません。推奨ブラウザはこちらをご確認ください'
  //     );
  //   }
  // };
  const checkCameraAccess = async () => {
    setIsCameraChecking(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setIsCameraAccessible(true);
      setVideoStream(stream);
      setCameraErrorMsg('');
      stream.getTracks().forEach((track) => track.stop()); // カメラアクセス後にストリームを停止
    } catch (_error) {
      setIsCameraAccessible(false);
      setCameraErrorMsg(
        'カメラやカメラ設定に問題がある可能性があります。こちらをご確認ください',
      );
    }
    setIsCameraChecking(false);
  };
  const checkMicAccess = async () => {
    setIsMicChecking(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsMicAccessible(true);
      stream.getTracks().forEach((track) => track.stop());
      setMicErrorMsg('');
      stream.getTracks().forEach((track) => track.stop()); // マイクアクセス後にストリームを停止
    } catch (_error) {
      setIsMicAccessible(false);
      setMicErrorMsg(
        'マイクやマイク設定に問題がある可能性があります。こちらをご確認ください',
      );
    }
    setIsMicChecking(false);
  };

  const onClickapproach = () => {
    const userAgent = window.navigator.userAgent;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
    if (isMobile) {
      // モバイルデバイスの場合
      router.push('/approach');
    } else {
      // PCの場合
      router.push('/approach/pc');
    }
  };
  // 閉じるボタンのonClickハンドラー
  const handleClose = (e: React.MouseEvent<any>) => {
    onClose(e);
  };

  useEffect(() => {
    // すべてのチェック項目が完了しているかどうかを確認する
    if (isCameraAccessible && isMicAccessible) {
      setIsAllChecked(true);
      localStorage.setItem('checkmodal', 'done');
    } else {
      setIsAllChecked(false);
    }
  }, [isCameraAccessible, isMicAccessible]);

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.title}>　通話チェック</div>

        <div className={styles.box}>
          <p>カメラが使える</p>
          {!isCameraAccessible && (
            <button className={styles.button} onClick={checkCameraAccess}>
              {isCameraChecking ? 'チェック中...' : 'チェックする'}
            </button>
          )}
          {isCameraAccessible ? (
            <span>
              <Image
                src={CheckPIC}
                width="33"
                height="33"
                alt="編集アイコン"
                style={{ marginLeft: '3px' }}
              />
            </span>
          ) : (
            cameraErrorMsg && (
              <div className={styles.errorMsg} onClick={onClickapproach}>
                <Image
                  src={attentionPic}
                  alt="アイコン"
                  width="18"
                  height="18"
                />
                {cameraErrorMsg}
              </div>
            )
          )}
        </div>
        <div className={styles.box}>
          <p>マイクが使える</p>
          {!isMicAccessible && (
            <button className={styles.button} onClick={checkMicAccess}>
              {isMicChecking ? 'チェック中...' : 'チェックする'}
            </button>
          )}
          {isMicAccessible ? (
            <span>
              <Image
                src={CheckPIC}
                width="33"
                height="33"
                alt="編集アイコン"
                style={{ marginLeft: '3px' }}
              />
            </span>
          ) : (
            micErrorMsg && (
              <div className={styles.errorMsg} onClick={onClickapproach}>
                <Image
                  src={attentionPic}
                  alt="アイコン"
                  width="18"
                  height="18"
                />
                {micErrorMsg}
              </div>
            )
          )}
        </div>
        <div>
          すべてに
          <span>
            <Image
              src={CheckPIC}
              width="23"
              height="23"
              alt="編集アイコン"
              style={{ marginLeft: '3px' }}
            />
          </span>
          がついたら、準備は完了です。
        </div>
        <p>
          スマートフォンの低電力モードをオフにした上で、ビデオ通話をお楽しみください。
        </p>
        <button
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleClose(e)}
          className={styles.cansel}
        >
          閉じる
        </button>
      </div>
    </div>
  );
};
export default CheckModal;

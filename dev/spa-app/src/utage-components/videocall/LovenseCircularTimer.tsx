// Image component removed (use <img> directly);
import { memo, useEffect, useRef, useState } from 'react';
import styles from '@/styles/videocall/VideoComponent.module.css';

const LovensePic = '/lovense_pink.webp';

type Props = {
  duration: number; // 総時間（秒）
  startTime: number; // 開始時刻（Unixタイムスタンプ秒）
  endTime: number; // 終了時刻（Unixタイムスタンプ秒）
  type: string; // Lovenseのタイプ（「強」「パルス」など）
  userName?: string; // ユーザー名（オプション）
  showUserInfo?: boolean; // ユーザー情報とメニュー情報を表示するかどうか（ビデオ通話時: false、ライブ配信時: true、デフォルト: true）
  noMarginLeft?: boolean; // 左マージンを削除するかどうか（ビデオ通話時: true、それ以外: false、デフォルト: false）
};

// タイムスタンプの単位判定用の閾値（10,000,000,000ミリ秒 = 10桁の秒タイムスタンプ）
const MILLISECOND_THRESHOLD = 10 * 1000 * 1000 * 1000;

export const LovenseCircularTimer = memo<Props>(
  ({
    duration,
    startTime,
    endTime,
    type,
    userName,
    showUserInfo = true, // ビデオ通話時は false、ライブ配信時は true
    noMarginLeft = false, // ビデオ通話時は true、それ以外は false
  }: Props) => {
    // タイムスタンプの単位を判定（ミリ秒 or 秒）
    // タイムスタンプが10桁より大きい場合はミリ秒と判定
    const isMilliseconds = startTime > MILLISECOND_THRESHOLD;

    const [displayTime, setDisplayTime] = useState(() => {
      const now = Date.now();
      const startMs = isMilliseconds ? startTime : startTime * 1000;
      const elapsed = (now - startMs) / 1000; // 秒単位
      const remaining = Math.max(0, Math.ceil(duration - elapsed));
      return remaining;
    });

    const [progress, setProgress] = useState(() => {
      const now = Date.now();
      const startMs = isMilliseconds ? startTime : startTime * 1000;
      const elapsed = Math.max(0, (now - startMs) / 1000);
      // ゲージを減らす方向に（100%→0%）
      return duration > 0 ? Math.max(0, 1 - elapsed / duration) : 1;
    });

    const intervalRef = useRef<number | null>(null);

    // startTimeやdurationが変わった時（新しいメニューに切り替わった時）に即座にリセット
    useEffect(() => {
      const now = Date.now();
      const startMs = isMilliseconds ? startTime : startTime * 1000;
      const elapsed = (now - startMs) / 1000;
      const remaining = Math.max(0, Math.ceil(duration - elapsed));

      // 即座にリセット
      setDisplayTime(remaining);
      setProgress(duration > 0 ? Math.max(0, 1 - elapsed / duration) : 1);
    }, [startTime, duration, isMilliseconds]);

    useEffect(() => {
      // 100msごとに残り時間と進捗率を更新
      intervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const startMs = isMilliseconds ? startTime : startTime * 1000;
        const elapsed = (now - startMs) / 1000; // 秒単位
        const remaining = Math.max(0, Math.ceil(duration - elapsed));

        setDisplayTime(remaining);

        // 進捗率を更新（ゲージを減らす方向に）
        const newProgress =
          duration > 0 ? Math.max(0, 1 - elapsed / duration) : 1;
        setProgress(newProgress);

        // 時間切れの場合、intervalをクリア
        if (remaining <= 0 && intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, 100);

      return () => {
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
        }
      };
    }, [duration, startTime, isMilliseconds]);

    // SVG円の設定
    const size = 60; // 円のサイズ
    const strokeWidth = 3; // 線の太さ
    const radius = (size - strokeWidth) / 2; // 半径
    const circumference = 2 * Math.PI * radius; // 円周
    // 時計回りにゲージを減らす（progressが減るとゲージも減る）
    const offset = -circumference * (1 - progress);

    return (
      <div className={styles.lovenseTimerContainer}>
        <div
          className={
            noMarginLeft ? styles.timerWrapperNoMargin : styles.timerWrapper
          }
        >
          <svg className={styles.progressRing} width={size} height={size}>
            {/* 背景の円 */}
            <circle
              className={styles.progressRingBackground}
              stroke="#ffffff40"
              strokeWidth={strokeWidth}
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
            {/* 進捗を表す円 */}
            <circle
              className={styles.progressRingCircle}
              stroke="#f246b9"
              strokeWidth={strokeWidth}
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className={styles.timeDisplay}>
            <div className={styles.seconds}>
              {displayTime}
              <span className={styles.secondsUnit}>秒</span>
            </div>
          </div>
        </div>
        <div
          className={
            noMarginLeft ? styles.statusTextNoMargin : styles.statusText
          }
        >
          <Image
            src={LovensePic}
            alt="Lovense"
            width={12}
            height={12}
            className={styles.lovenseIcon}
          />
          起動中
        </div>
        {showUserInfo && (
          <div className={styles.userInfo}>
            <div className={styles.userName}>{userName}</div>
            <div className={styles.menuInfo}>
              {duration}秒 | {type}
            </div>
          </div>
        )}
      </div>
    );
  },
);

LovenseCircularTimer.displayName = 'LovenseCircularTimer';

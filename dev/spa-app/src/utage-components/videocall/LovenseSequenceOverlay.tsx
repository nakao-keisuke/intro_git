/**
 * Lovense自動発動シーケンスのオーバーレイUI
 * - 最初のカウントダウン: 「無料Lovense発動まで」
 * - 2回目以降のカウントダウン: 「次の発動まで」
 * - 発動中: オーバーレイ非表示（既存UIを使用）
 */

import { memo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { SequencePhase } from '@/features/lovense/store/lovenseStore';

type Props = {
  /** 現在のフェーズ */
  phase: SequencePhase;
  /** カウントダウン残り秒数 */
  countdown: number;
  /** 現在のアクション番号（1始まり） */
  currentActionNumber: number;
};

export const LovenseSequenceOverlay = memo<Props>(
  ({ phase, countdown, currentActionNumber }) => {
    // クライアントサイドでのみPortalを使用するためのstate
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
      return () => setMounted(false);
    }, []);

    // 表示しないフェーズ: idle, completed, activation（発動中は既存UIを使用）
    if (phase === 'idle' || phase === 'completed' || phase === 'activation') {
      return null;
    }

    // SSR時はnullを返す
    if (!mounted) {
      return null;
    }

    // 表示内容を決定
    let label: string;
    let time: number;
    const color = '#f246b9'; // pink

    if (phase === 'countdown') {
      if (currentActionNumber === 1) {
        // 最初のカウントダウン: 「無料Lovense発動まで」を表示
        label = '無料Lovense発動まで';
      } else {
        // 2回目以降のカウントダウン: 「次の発動まで」を表示
        label = '次の発動まで';
      }
      time = countdown;
    } else {
      // その他のフェーズは非表示
      return null;
    }

    // SVG円の設定（大きめのサイズ）
    const size = 120;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // createPortalでdocument.bodyに直接レンダリング（親のtransformの影響を回避）
    return createPortal(
      <div className="pointer-events-none fixed inset-0 z-[100000] flex items-center justify-center">
        {/* グローバルスタイル：1秒で円を時計回りに1周するアニメーション */}
        <style>{`
        @keyframes countdown-circle {
          from {
            stroke-dashoffset: ${circumference};
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
        <div className="flex flex-col items-center gap-3">
          {/* 円形プログレス（中央に大きく表示、白背景なし） */}
          <div className="relative">
            {/* countdownの値をkeyにしてアニメーションをリセット */}
            <svg key={time} width={size} height={size}>
              {/* 背景の円（薄いグレー） */}
              <circle
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth={strokeWidth}
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
              />
              {/* 進捗を表す円（1秒で時計回りに1周するアニメーション） */}
              <circle
                stroke={color}
                strokeWidth={strokeWidth}
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={circumference}
                strokeLinecap="round"
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: '50% 50%',
                  animation: 'countdown-circle 1s linear forwards',
                }}
              />
            </svg>
            {/* 中央のカウント（大きな数字、ドロップシャドウで視認性UP） */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="font-bold text-5xl text-white"
                style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)' }}
              >
                {time}
              </span>
            </div>
          </div>

          {/* テキストラベル（下に配置、視認性向上） */}
          <div
            className="rounded-full px-4 py-2"
            style={{
              background:
                'linear-gradient(135deg, rgba(242, 70, 185, 0.9), rgba(255, 100, 200, 0.9))',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            <span className="whitespace-nowrap font-bold text-base text-white">
              {label}
            </span>
          </div>
        </div>
      </div>,
      document.body,
    );
  },
);

LovenseSequenceOverlay.displayName = 'LovenseSequenceOverlay';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MILLISECOND_THRESHOLD } from '@/constants/lovenseSequences';
import type { LovenseRtmUpdateMessage } from '@/features/lovense/store/lovenseStore';
import { useSendLovenseControlCommand } from '@/hooks/requests/useLovense';

type Props = {
  partnerId: string;
  sessionDurationSec: number;
  sessionStartTime?: number;
  sessionEndTime?: number;
  onClose: () => void;
  onSendRtmUpdate?: (payload: LovenseRtmUpdateMessage) => Promise<void>;
};

export const LovenseFullControlModal = ({
  partnerId,
  sessionDurationSec,
  sessionStartTime,
  sessionEndTime,
  onClose,
  onSendRtmUpdate,
}: Props) => {
  const [mounted, setMounted] = useState(false);
  const [intensity, setIntensity] = useState(10);
  const [remainingSec, setRemainingSec] = useState(sessionDurationSec);
  const remainingRef = useRef(sessionDurationSec);
  const intensityRef = useRef(10);
  const onCloseRef = useRef(onClose);
  const hasSentInitialCommand = useRef(false);
  const debounceTimerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { sendLovenseControlCommand } = useSendLovenseControlCommand();

  // クライアントサイドでのみPortalを使用するためのstate
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const computeRemainingSec = useCallback(() => {
    if (sessionStartTime !== undefined && sessionEndTime !== undefined) {
      const isMilliseconds = sessionStartTime > MILLISECOND_THRESHOLD;
      const now = isMilliseconds ? Date.now() : Date.now() / 1000;
      const remaining = isMilliseconds
        ? Math.ceil((sessionEndTime - now) / 1000)
        : Math.ceil(sessionEndTime - now);
      return Math.max(0, remaining);
    }
    return Math.max(0, sessionDurationSec);
  }, [sessionStartTime, sessionEndTime, sessionDurationSec]);

  useEffect(() => {
    const remaining = computeRemainingSec();
    remainingRef.current = remaining;
    setRemainingSec(remaining);
    hasSentInitialCommand.current = false;
  }, [computeRemainingSec]);

  // 完全コントロール購入直後に強さ10・残り秒数で初回コマンドを送信
  useEffect(() => {
    if (hasSentInitialCommand.current) return;
    const remaining = computeRemainingSec();
    if (remaining <= 0) return;
    hasSentInitialCommand.current = true;
    sendLovenseControlCommand({
      partnerId,
      lovenseIntensity: 10,
      lovenseTimeSec: remaining,
    });
  }, [partnerId, sendLovenseControlCommand, computeRemainingSec]);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = computeRemainingSec();
      remainingRef.current = remaining;
      if (remaining <= 0) {
        clearInterval(timer);
        onCloseRef.current();
      } else {
        setRemainingSec(remaining);
        if (onSendRtmUpdate) {
          const payload = {
            type: 'lovense.update' as const,
            intensity: intensityRef.current,
            duration: remaining,
          };
          onSendRtmUpdate(payload).catch((error) => {
            console.error('[LovenseFullControlModal] RTM send error:', error);
          });
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [computeRemainingSec, onSendRtmUpdate]);

  const handleIntensityChange = (value: number) => {
    setIntensity(value);
    intensityRef.current = value;
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = window.setTimeout(() => {
      sendLovenseControlCommand({
        partnerId,
        lovenseIntensity: value,
        ...(remainingRef.current > 0 && {
          lovenseTimeSec: remainingRef.current,
        }),
      });
    }, 300);
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.setProperty(
        '--value-percent',
        String((intensity / 20) * 100),
      );
    }
  }, [intensity]);

  // SSR時はnullを返す
  if (!mounted) return null;

  // createPortalでdocument.bodyに直接レンダリング（親のtransformの影響を回避）
  return createPortal(
    <div className="fixed right-0 bottom-8 left-0 z-[100000] mx-auto w-[90%] rounded-lg bg-black/80 px-4 py-3 text-white">
      <div className="mb-5 flex items-center justify-between">
        <span className="font-bold text-base">コントロール中</span>
        <span className="font-bold text-pink-400 text-sm">
          残り {remainingSec}秒
        </span>
      </div>
      <div className="mb-2 text-center text-sm">強さ: {intensity} / 20</div>
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="range"
          min={0}
          max={20}
          value={intensity}
          onChange={(e) => handleIntensityChange(Number(e.target.value))}
          className="lovense-fullcontrol-range h-8 w-full cursor-pointer"
          style={{
            ['--value-percent' as string]: (intensity / 20) * 100,
          }}
        />
        <div className="flex justify-between text-gray-400 text-xs">
          <span>0</span>
          <span>20</span>
        </div>
      </div>
    </div>,
    document.body,
  );
};

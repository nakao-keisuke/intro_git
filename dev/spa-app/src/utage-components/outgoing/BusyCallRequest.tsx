import { useNavigate } from '@tanstack/react-router';
import { useSession } from '#/hooks/useSession';
import { useState } from 'react';
import { usePartnerInfo } from '@/app/[locale]/message/components/hooks/usePartnerInfo';
import { useRequest } from '@/hooks/useRequest';
import type { CallType } from '@/services/call/type';
import { region as regionNameFromNumber } from '@/utils/region';
import RoundedThumbnail from '../RoundedThumbnail';

type Props = {
  partnerId: string;
  callType: CallType; // 'video-call' | 'voice-call'
};

export default function BusyCallRequest({ partnerId, callType }: Props) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [showOk, setShowOk] = useState(false);
  const isVideo = callType === 'video-call';
  // 相手情報の取得（既存モーダルと同じ表示用）
  const { data: session } = useSession();
  const myId = session?.user?.id;
  const token = session?.user?.token;
  const partnerInfoParams: {
    partnerId: string;
    enabled?: boolean;
    myId?: string;
    token?: string;
  } = {
    partnerId,
    enabled: Boolean(partnerId && myId),
  };
  if (myId) partnerInfoParams.myId = myId;
  if (token) partnerInfoParams.token = token;
  const { partner } = usePartnerInfo(partnerInfoParams);

  const { requestCall } = useRequest();

  const handleSendRequest = async () => {
    if (sending) return;
    setSending(true);
    const mapped = isVideo ? 'videoCallFromOutgoing' : 'voiceCallFromOutgoing';
    const result = await requestCall(partnerId, mapped);
    if (!result.success) {
      alert(result.error);
      setSending(false);
      return;
    }
    setShowOk(true);
  };

  const handleOk = () => {
    setShowOk(false);
    router.back();
  };

  return (
    <div>
      {/* 背景オーバーレイとモーダル本体（既存モーダルと同一スタイル） */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(39,39,39,0.5)]">
        <div
          className="w-[70%] max-w-md rounded-[5%] bg-white p-2 text-center shadow-lg"
          style={{
            animation: 'popup 0.2s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          }}
        >
          {/* 相手の基本情報（アイコン・名前・地域/年齢） */}
          <div className="relative mx-auto mt-[-40px] block h-[60px] w-[60px] rounded-full border-4 border-white">
            <RoundedThumbnail
              deviceCategory="mobile"
              {...(partner?.avatarId ? { avatarId: partner.avatarId } : {})}
            />
          </div>
          <div className="font-bold text-[#3b3b3b] text-[15px]">
            {partner?.userName ?? 'ユーザー'}
          </div>
          <div className="inline-flex items-center gap-2 font-bold text-[#3b3b3b] text-[13px]">
            <span>
              {typeof partner?.region === 'number'
                ? regionNameFromNumber(partner?.region ?? 0)
                : partner?.region}
            </span>
            {partner?.age ? <span>{partner?.age}歳</span> : null}
          </div>
          <div className="mt-2" />
          <div className="whitespace-nowrap bg-[linear-gradient(transparent_30%,#fbfb8b_40%)] px-1 font-bold text-[17px]">
            お相手は通話中です！
          </div>
          <div className="mt-3" />
          <div
            className={
              isVideo
                ? 'mt-4 flex flex-col items-center justify-center gap-2 rounded-[3vh] bg-[linear-gradient(to_top,#df4343,#f95757_40%)] px-[18px] pt-[5px] pb-0 text-center font-bold text-white shadow-[0_5px_0_#bd3c3c] drop-shadow-[1px_1px_2px_rgba(81,81,81,0.28)] transition-all duration-300 ease-out hover:translate-y-[5px] hover:text-[#c0c0c0]'
                : 'mt-4 flex flex-col items-center justify-center gap-2 rounded-[3vh] bg-[#4794ff] px-[18px] pt-[5px] pb-0 text-center font-bold text-white shadow-[0_5px_0_#1c64c8] drop-shadow-[1px_1px_2px_rgba(81,81,81,0.28)] transition-all duration-300 ease-out hover:translate-y-[5px]'
            }
            onClick={handleSendRequest}
            aria-disabled={sending}
            role="button"
            style={{ textShadow: 'rgba(22, 22, 22, 0.122) 0 0 2px' }}
          >
            <div>
              <div
                className={
                  isVideo
                    ? 'whitespace-nowrap text-[15px] leading-[1.3]'
                    : 'whitespace-nowrap text-[15px]'
                }
              >
                {isVideo ? 'ビデオ通話リクエスト' : '音声通話リクエスト'}
                <br />
                <span className="whitespace-nowrap text-[12px]">(無料)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.back()}
            className="mt-6 rounded-[20px] border border-[#5e5e5e62] bg-white px-4 py-1 text-[#3f3646] text-[11px] shadow-[0_1px_2px_rgba(0,0,0,0.34)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-60"
            type="button"
          >
            キャンセル
          </button>
        </div>
      </div>

      {/* 送信完了モーダル（既存OKモーダルスタイル） */}
      {showOk && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-[rgba(39,39,39,0.5)]"
          onClick={handleOk}
        >
          <div
            className="w-[60%] rounded-[2vh] bg-white p-4 text-[#3f3646] text-[13px]"
            style={{
              animation: 'popup 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards',
            }}
          >
            通話リクエストを送信しました
            <br />
            返事が来たら、こちらから発信しましょう♪
            <br />
            <div className="mt-3 flex justify-center">
              <button
                onClick={() => router.back()}
                className="mt-4 rounded-full bg-[linear-gradient(to_top,#2bb1de,#44c2eb_60%)] px-4 py-2 font-bold text-[15px] text-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

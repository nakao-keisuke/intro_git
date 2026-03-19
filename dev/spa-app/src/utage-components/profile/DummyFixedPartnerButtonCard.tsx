// Image component removed (use <img> directly);

type Props = {
  onSignupPrompt?: () => void;
};

const DummyFixedPartnerButtonCard = ({ onSignupPrompt }: Props) => {
  const handleClick = () => {
    onSignupPrompt?.();
  };

  return (
    <div className="fixed bottom-1 left-0 z-[1000] h-10 w-full pb-15 text-center">
      <div className="flex items-center justify-center gap-2">
        {/* メッセージボタン */}
        <div>
          <button
            className="relative flex h-full w-[114px] cursor-pointer flex-col items-center justify-center whitespace-nowrap rounded-full bg-gradient-to-t from-[#e9ab00] to-[#fcc107] px-3 py-[9px] text-center align-middle font-bold text-white text-xs no-underline shadow-[0_5px_0_#cb9200] transition-all duration-300 ease-[0s] hover:translate-y-[5px] hover:bg-[#fcc107] hover:shadow-none"
            onClick={handleClick}
          >
            <div className="flex items-center gap-1.5">
              <Image
                src="/situation.icon/chat.webp"
                width={20}
                height={20}
                alt="メッセージアイコン"
                className="-ml-1.5"
              />
              メッセージ
            </div>
          </button>
        </div>

        {/* 音声通話ボタン（常に有効状態） */}
        <div>
          <button
            className="relative flex h-full w-[114px] cursor-pointer flex-col items-center justify-center rounded-full bg-gradient-to-t from-[#4794ff] to-[#4794ff] px-3 py-[9px] text-center align-middle font-bold text-white text-xs no-underline shadow-[0_5px_0_#1c64c8] transition-all duration-300 ease-[0s] hover:translate-y-[5px] hover:bg-[#4794ff] hover:shadow-none"
            onClick={handleClick}
          >
            <div className="flex items-center gap-1.5">
              <Image
                src="/chat/call.webp"
                width={19}
                height={19}
                alt="音声通話アイコン"
                className="relative -ml-5"
              />
              <div className="-mt-[5%] whitespace-nowrap leading-[0.9em]">
                音声通話
                <div className="absolute mb-[7%] whitespace-nowrap font-normal text-[9px]">
                  リクエスト無料
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* ビデオ通話ボタン（常に有効状態） */}
        <div>
          <button
            className="relative flex h-full w-[114px] cursor-pointer flex-col items-center justify-center rounded-full bg-gradient-to-t from-[#df4343] to-[#f95757] px-3 py-[9px] text-center align-middle font-bold text-white text-xs no-underline shadow-[0_5px_0_#bd3c3c] transition-all duration-300 ease-[0s] hover:translate-y-[5px] hover:bg-[#f95757] hover:shadow-none"
            onClick={handleClick}
          >
            <div className="flex items-center gap-1.5">
              <Image
                src="/chat/video.webp"
                width={19}
                height={19}
                alt="ビデオ通話アイコン"
                className="relative -ml-5"
              />
              <div className="-mt-[5%] whitespace-nowrap leading-[0.9em]">
                ビデオ通話
                <div className="absolute mb-[7%] whitespace-nowrap font-normal text-[9px]">
                  リクエスト無料
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DummyFixedPartnerButtonCard;

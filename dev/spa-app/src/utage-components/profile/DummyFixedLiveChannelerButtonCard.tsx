import { useUIStore } from '@/stores/uiStore';

const DummyFixedLiveChannelerButtonCard = () => {
  const openLoginModal = useUIStore((s) => s.openLoginModal);
  const openRegisterModal = useUIStore((s) => s.openRegisterModal);

  const onClickRegisterButton = () => {
    openRegisterModal();
  };

  const onClickLoginButton = () => {
    openLoginModal();
  };

  return (
    <div className="fixed bottom-0 left-0 z-[1000] flex h-[90px] w-full items-center justify-around text-center">
      <div
        className="relative m-auto flex h-[28%] w-[35%] cursor-pointer flex-col items-center justify-center rounded-[100vh] bg-gradient-to-l from-[#fc999f] to-[#44c2eb] px-5 py-2 text-center align-middle font-bold text-[13px] text-white no-underline shadow-[0_1px_5px_rgba(0,0,0,0.342)] after:absolute after:right-[3px] after:h-[22px] after:w-[22px] after:bg-[url(https://utage-web.com/purchase/go.svg)] after:bg-cover after:brightness-[500%] after:grayscale after:content-[''] hover:opacity-60"
        onClick={onClickRegisterButton}
      >
        <div>無料新規登録</div>
      </div>

      <div
        className="relative m-auto flex h-[28%] w-[35%] cursor-pointer flex-col items-center justify-center rounded-[100vh] bg-[rgb(251,251,251)] px-5 py-2 text-center align-middle font-bold text-[13px] text-transparent no-underline shadow-[0_1px_5px_rgba(0,0,0,0.342)] before:absolute before:bg-gradient-to-r before:from-[#44c2eb] before:via-[#fc999f] before:to-[#fc999f] before:bg-clip-text before:text-transparent before:content-['ログイン'] after:absolute after:right-[3px] after:h-[22px] after:w-[22px] after:bg-[url(https://utage-web.com/purchase/go.svg)] after:bg-cover after:brightness-[160%] after:grayscale-[10%] after:hue-rotate-[170deg] after:content-[''] hover:opacity-60"
        onClick={onClickLoginButton}
      >
        <div>ログイン</div>
      </div>
    </div>
  );
};

export default DummyFixedLiveChannelerButtonCard;

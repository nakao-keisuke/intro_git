import { signOut, useSession } from 'next-auth/react';
import { memo, useEffect, useState } from 'react';
import FullScreenLoading from '@/components/common/FullScreenLoading';
import { HTTP_DEACTIVATE_ACCOUNT } from '@/constants/endpoints';
import { useClearBrowserStorage } from '@/hooks/useClearBrowserStorage';
import { native } from '@/libs/nativeBridge';
import { useUIStore } from '@/stores/uiStore';
import { postToNext } from '@/utils/next';
import { sendMessageToWebView } from '@/utils/webview';

type Props = {
  onClose: () => void;
  isPurchased: boolean;
  consumedPoint: number;
};

// 退会理由の選択肢
const QUIT_REASONS = [
  '値段が高い',
  '不具合が多い',
  '気になる女性がいない',
  '機能が使いづらい',
  'その他',
];

const QuitModal: React.FC<Props> = memo(
  ({ onClose, isPurchased, consumedPoint }) => {
    const [isQuiting, setIsQuiting] = useState(false);
    const { data: session } = useSession();
    const { clearAll } = useClearBrowserStorage();
    const isPC = useUIStore((s) => s.isPC);

    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [customReason, setCustomReason] = useState('');

    // エラーメッセージの状態
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [otherReasonError, setOtherReasonError] = useState(false);

    // フォームが有効かどうかを確認
    const [_isFormValid, setIsFormValid] = useState(false);

    // フォームの有効性チェック
    useEffect(() => {
      // エラーメッセージをリセット
      setErrorMessage(null);
      setOtherReasonError(false);

      // 選択肢が選ばれていない場合は無効
      if (!selectedReason) {
        setIsFormValid(false);
        return;
      }

      // 「その他」が選択されている場合、自由記述が必要
      if (selectedReason === 'その他' && !customReason.trim()) {
        setIsFormValid(false);
        setOtherReasonError(true); // 「その他」選択時の入力エラーフラグ
        return;
      }

      setIsFormValid(true);
    }, [selectedReason, customReason]);

    // Native版の場合は /signup?app=native に、Webの場合は / にリダイレクト
    // native.isInWebView()はlocalStorageに依存しないのでclearAll()後も正しく判定できる
    const getCallbackUrl = () =>
      native.isInWebView() ? '/signup?app=native' : '/';

    const getBrowserInfo = () => {
      const userAgent = navigator.userAgent;
      let browserName = '不明なブラウザ';

      if (userAgent.match(/chrome|chromium|crios/i)) {
        browserName = 'Chrome';
      } else if (userAgent.match(/firefox|fxios/i)) {
        browserName = 'Firefox';
      } else if (
        userAgent.match(/safari/i) &&
        !userAgent.match(/chrome|chromium|crios/i)
      ) {
        browserName = 'Safari';
      } else if (userAgent.match(/opr\//i) || userAgent.match(/opera/i)) {
        browserName = 'Opera';
      } else if (userAgent.match(/edg/i)) {
        browserName = 'Edge';
      } else if (userAgent.match(/msie|trident/i)) {
        browserName = 'Internet Explorer';
      } else if (userAgent.match(/brave/i)) {
        browserName = 'Brave';
      } else if (userAgent.match(/vivaldi/i)) {
        browserName = 'Vivaldi';
      } else if (userAgent.match(/ucbrowser/i)) {
        browserName = 'UC Browser';
      } else if (userAgent.match(/samsungbrowser/i)) {
        browserName = 'Samsung Internet';
      } else if (userAgent.match(/yabrowser/i)) {
        browserName = 'Yandex Browser';
      } else if (userAgent.match(/duckduckgo/i)) {
        browserName = 'DuckDuckGo Browser';
      } else if (userAgent.match(/android/i)) {
        browserName = 'Androidブラウザ';
      } else if (userAgent.match(/alohabrowser/i)) {
        browserName = 'Aloha Browser';
      }

      return browserName;
    };

    const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    const handleReasonChange = (reason: string) => {
      setSelectedReason(reason);
      // 「その他」以外を選んだら、自由記述をクリア
      if (reason !== 'その他') {
        setCustomReason('');
      }
      // エラーメッセージをクリア
      setErrorMessage(null);
    };

    const handleCustomReasonChange = (
      e: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
      setCustomReason(e.target.value);
      // 「その他」が選択されている場合のエラー状態をリセット
      if (selectedReason === 'その他' && e.target.value.trim()) {
        setOtherReasonError(false);
      }
    };

    const validateForm = () => {
      if (!selectedReason) {
        setErrorMessage('退会理由を選択してください');
        return false;
      }

      if (selectedReason === 'その他' && !customReason.trim()) {
        setOtherReasonError(true);
        setErrorMessage('「その他」を選択した場合は退会理由を入力してください');
        return false;
      }

      return true;
    };

    const onClickLogout = async () => {
      if (isQuiting) return;

      // フォームのバリデーション
      if (!validateForm()) {
        return;
      }

      setIsQuiting(true);

      const email = session?.user.email?.includes('@')
        ? session?.user.email
        : '未登録';

      const isPurchasedText = isPurchased ? 'あり' : 'なし';
      const deviceText = isPC ? 'PC' : 'スマホ';
      const browserText = getBrowserInfo();

      // 送信する退会理由を構築
      let finalReason = selectedReason || '';
      if (selectedReason === 'その他') {
        finalReason += `：${customReason}`;
      } else if (customReason.trim()) {
        // その他選択でなくても自由記述があれば追加
        finalReason += `\n追加コメント：${customReason}`;
      }

      const response = await postToNext(HTTP_DEACTIVATE_ACCOUNT, {
        comment:
          finalReason +
          '\n' +
          `Email: ${email} \n` +
          `購入履歴: ${isPurchasedText} \n` +
          `消費ポイント: ${consumedPoint}pt \n` +
          `デバイス: ${deviceText} \n` +
          `ブラウザ：${browserText}\n` +
          'アプリ: Utage',
      });

      if (response.type === 'error') {
        alert(response.message);
        setIsQuiting(false);
        return;
      }

      // Native側に通知（SecureStorageクリア用）
      void sendMessageToWebView({
        type: 'LOGOUT',
      });

      // ブラウザストレージをクリア
      clearAll();

      // セッション削除完了を待ってからリダイレクト
      await signOut({ redirect: false });
      // NOTE: Nativeアプリ（WebView）ではrouter.pushだとステートがリセットされない問題があるため、
      // window.location.hrefでフルリロードする
      window.location.href = getCallbackUrl();
    };

    return (
      <div
        className="fixed inset-0 z-[2001] flex items-center justify-center bg-black/50"
        onClick={handleClickOutside}
      >
        <div className="relative w-[80%] max-w-[600px] animate-quit-modal rounded-[17px] bg-white p-5">
          <div className="my-2 text-center text-[#878787] text-xs leading-normal">
            退会されるとのことで非常に残念です。
            <br /> <br />
            サービス品質向上の為、退会される理由・改善点などを教えていただけたら幸いで御座います。
          </div>
          {/* 退会理由の選択肢 */}
          <div className="my-5 flex flex-col gap-[10px]">
            {QUIT_REASONS.map((reason) => (
              <div key={reason} className="flex items-center gap-[10px]">
                <input
                  type="radio"
                  id={`reason-${reason}`}
                  name="quitReason"
                  checked={selectedReason === reason}
                  onChange={() => handleReasonChange(reason)}
                  className="h-[18px] w-[18px] accent-[#44c2eb]"
                />
                <label
                  htmlFor={`reason-${reason}`}
                  className="text-[#3f3646] text-sm"
                >
                  {reason}
                </label>
              </div>
            ))}
          </div>

          {/* エラーメッセージが存在する場合に表示 */}
          {errorMessage && (
            <div className="mx-auto mb-2.5 w-3/4 rounded border border-[rgba(224,5,5,0.693)] bg-[#ffeaea] text-center text-[rgb(224,5,5)] text-xs tracking-[0.1em]">
              {errorMessage}
            </div>
          )}

          {/* 自由記述欄（「その他」選択時は必須、それ以外はオプション） */}
          <textarea
            className={`mx-auto mt-2.5 -mb-2.5 h-[calc(100%-40px)] w-[90%] rounded border border-[#ccc] bg-white/30 px-[15px] py-[10px] text-[#3f3646]/50 text-[13px] caret-[#44c2eb] outline-[#fc999f] placeholder:text-[#3f3646]/40 ${
              otherReasonError
                ? 'border-[#ff1010] bg-[rgba(255,245,245,0.7)]'
                : ''
            }`}
            maxLength={300}
            placeholder={
              selectedReason === 'その他'
                ? '退会理由を入力してください（必須）'
                : '退会理由の詳細を入力してください（任意）'
            }
            value={customReason}
            onChange={handleCustomReasonChange}
          />

          {/* 注意書き（自由記述欄の下に配置） */}
          <div className="my-2 text-center text-[12px] text-pink-300 leading-normal">
            ※退会するボタンをタップすると退会が完了します。
            <br />
            退会後は、登録済みのクレジットカード情報を含むお客様のご登録情報は削除されます。あらかじめご了承ください。
          </div>

          {isQuiting && <FullScreenLoading />}
          <p className="mt-5 flex flex-col items-center gap-[15px]">
            <a
              onClick={onClickLogout}
              className={`mx-auto flex h-[55px] w-4/5 items-center justify-center rounded-[30px] bg-[#44c2eb] text-base text-white tracking-[0.03em] no-underline transition-all duration-300 hover:opacity-60 ${
                isQuiting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}
            >
              退会する
            </a>

            <a
              onClick={onClose}
              className="mx-auto -mb-4 flex h-[55px] w-4/5 items-center justify-center rounded-[30px] border border-[#707070] bg-white text-[#333] text-base tracking-[0.03em] no-underline transition-all duration-300 hover:opacity-60"
            >
              閉じる
            </a>
          </p>
        </div>
      </div>
    );
  },
);

QuitModal.displayName = 'QuitModal';

export default QuitModal;

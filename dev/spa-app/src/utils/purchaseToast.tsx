// Image component removed (use <img> directly);
import { toast } from 'react-toastify';

/**
 * 購入成功時のtoastを表示する共通関数
 * @param addedPoints 購入したポイント数
 */
export const showPurchaseSuccessToast = (addedPoints: number) => {
  toast(
    <div className="inline-flex items-center">
      <Image
        src="/images/purchase_check_icon.webp"
        alt="購入完了"
        width={32}
        height={32}
        className="mr-2 align-middle"
      />
      <span className="align-middle leading-8">
        {addedPoints}ポイントを購入しました。
      </span>
    </div>,
    {
      theme: 'light',
      className: 'bg-white',
      hideProgressBar: false,
      autoClose: 3000,
    },
  );
};

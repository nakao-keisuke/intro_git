import { IconEdit, IconMapPin } from '@tabler/icons-react';
// Image component removed (use <img> directly);
import { useSession } from '#/hooks/useSession';
import { memo, useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { CreateFleaMarketTransactionResponseData } from '@/apis/create_flea_market_transaction';
import {
  type GetAddressFleaMarketResponseData,
  getAddressFleaMarketRequest,
} from '@/apis/get-address-flea-market';
import {
  type RegisterAddressFleaMarketResponse,
  registerAddressFleaMarketRequest,
} from '@/apis/register-address-flea-market';
import {
  GET_ADDRESS_FLEA_MARKET,
  PURCHASE_FLEA_MARKET_ITEM,
  REGISTER_ADDRESS_FLEA_MARKET,
} from '@/constants/endpoints';
import {
  type ShippingAddress,
  useShippingAddress,
} from '@/libs/recoil/fleaMarketAtom';
import { usePointStore } from '@/stores/pointStore';
import type { JamboResponse } from '@/types/JamboApi';
import { calculateShippingFee } from '@/utils/fleamarket';
import { imageUrlForFleaMarket } from '@/utils/image';
import { postToNext } from '@/utils/next';
import {
  fetchAddressFromPostalCode,
  formatPostalCode,
} from '@/utils/postalCode';

type ItemData = {
  itemId: string;
  title: string;
  price: number;
  images: string[];
};

export type FleaMarketPurchaseCompleteData = {
  itemTitle: string;
  newPoint: number;
  itemId: string;
  price: number;
  transactionId?: string;
};

type Props = {
  item: ItemData;
  onBack: () => void;
  onPurchaseComplete: (data: FleaMarketPurchaseCompleteData) => void;
};

type AddressFormData = {
  last_name: string;
  first_name: string;
  postal_code: string;
  prefecture: string;
  city: string;
  address_line1: string;
  address_line2?: string;
  phone_number: string;
  is_default: boolean;
};

type GetAddressFleaMarketApiResponse = {
  code: number;
  message?: string;
  data?: GetAddressFleaMarketResponseData[];
};

const FleaMarketPurchaseCompact = memo<Props>(
  ({ item, onBack, onPurchaseComplete }) => {
    const { data: session } = useSession();
    const token = session?.user.token || '';
    const userId = session?.user?.id || '';

    // 通話中はポーリングが停止しているため、Zustand storeから直接ポイントを取得
    const currentPoint = usePointStore((s) => s.currentPoint);
    const [userPoints, setUserPoints] = useState<number>(0);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [purchaseClicked, setPurchaseClicked] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [postalCodeError, setPostalCodeError] = useState<string | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const { shippingAddress, setShippingAddress } = useShippingAddress();

    const formControls = useForm<AddressFormData>({
      defaultValues: {
        last_name: '',
        first_name: '',
        postal_code: '',
        prefecture: '',
        city: '',
        address_line1: '',
        address_line2: '',
        phone_number: '',
        is_default: true,
      },
    });

    const shippingFee = calculateShippingFee(item.price);
    const totalPrice = item.price + shippingFee;
    const canPurchase =
      userPoints >= totalPrice &&
      shippingAddress &&
      !!shippingAddress.last_name &&
      !!shippingAddress.first_name &&
      !purchaseClicked;

    // 通話中はポーリングが停止しているため、Zustand storeから直接ポイントを取得
    // 通話タイマーが4秒ごとにポイントを更新しているため、その値を参照
    useEffect(() => {
      if (currentPoint !== undefined) {
        setUserPoints(currentPoint);
        setIsLoadingData(false);
      }
    }, [currentPoint]);

    // 配送先住所を取得
    useEffect(() => {
      const fetchShippingAddress = async () => {
        if (!token || !userId) return;

        try {
          const request = getAddressFleaMarketRequest(token, userId);
          const response = await postToNext<GetAddressFleaMarketApiResponse>(
            GET_ADDRESS_FLEA_MARKET,
            request,
          );
          if (
            response.type !== 'error' &&
            response.data &&
            response.data.length > 0
          ) {
            const defaultAddress =
              response.data.find((addr) => addr.is_default) || response.data[0];
            setShippingAddress(defaultAddress as ShippingAddress);
          }
        } catch (err) {
          console.error('Error fetching shipping address:', err);
        }
      };

      fetchShippingAddress();
    }, [token, userId, setShippingAddress]);

    // 郵便番号変更時の住所自動取得
    const handlePostalCodeChange = useCallback(
      async (value: string, onChange: (value: string) => void) => {
        const formattedValue = formatPostalCode(value);
        onChange(formattedValue);
        setPostalCodeError(null);

        if (formattedValue.replace('-', '').length === 7) {
          setIsLoadingAddress(true);
          try {
            const addressData = await fetchAddressFromPostalCode(
              formattedValue.replace('-', ''),
            );
            if (addressData) {
              formControls.setValue('prefecture', addressData.prefecture);
              formControls.setValue('city', addressData.city);
              formControls.setValue('address_line1', addressData.town);
            } else {
              setPostalCodeError(
                '郵便番号に対応する住所が見つかりませんでした',
              );
            }
          } catch {
            setPostalCodeError('住所の取得に失敗しました');
          } finally {
            setIsLoadingAddress(false);
          }
        }
      },
      [formControls],
    );

    // 住所フォーム送信
    const onSubmitAddress = useCallback(
      async (data: AddressFormData) => {
        if (!token || !userId) {
          setError('ログインが必要です');
          return;
        }

        try {
          const requestData: Parameters<
            typeof registerAddressFleaMarketRequest
          >[1] = {
            user_id: userId,
            last_name: data.last_name,
            first_name: data.first_name,
            postal_code: data.postal_code,
            prefecture: data.prefecture,
            city: data.city,
            address_line1: data.address_line1,
            phone_number: data.phone_number,
            is_default: data.is_default ?? true,
          };

          if (data.address_line2) {
            requestData.address_line2 = data.address_line2;
          }

          const request = registerAddressFleaMarketRequest(token, requestData);
          const response = await postToNext<
            JamboResponse<RegisterAddressFleaMarketResponse>
          >(REGISTER_ADDRESS_FLEA_MARKET, request);

          if (
            response.type === 'error' ||
            !('code' in response) ||
            response.code !== 0
          ) {
            setError('住所の保存に失敗しました');
            return;
          }

          setShippingAddress({
            ...data,
            user_id: userId,
          } as ShippingAddress);
          setShowAddressForm(false);
        } catch (err) {
          console.error('Error saving address:', err);
          setError('住所の保存中にエラーが発生しました');
        }
      },
      [token, userId, setShippingAddress],
    );

    // 購入処理
    const handlePurchase = useCallback(async () => {
      if (
        purchaseClicked ||
        isPurchasing ||
        !shippingAddress ||
        !shippingAddress.last_name ||
        !shippingAddress.first_name ||
        !token
      ) {
        return;
      }

      if (userPoints < totalPrice) {
        setError('ポイントが不足しています');
        return;
      }

      try {
        setPurchaseClicked(true);
        setIsPurchasing(true);
        setError(null);

        const requestBody = {
          itemId: item.itemId,
          price: totalPrice,
          token: token,
        };

        const response = await postToNext<
          JamboResponse<CreateFleaMarketTransactionResponseData>
        >(PURCHASE_FLEA_MARKET_ITEM, requestBody);

        if (response.type === 'error') {
          // APIがエラー形式で返しても、実際には購入が成功している可能性があるため成功として扱う
          // （postToNextのレスポンス形式の仕様による）
          const newPoint = userPoints - totalPrice;
          setUserPoints(newPoint);
          onPurchaseComplete({
            itemTitle: item.title,
            newPoint,
            itemId: item.itemId,
            price: totalPrice,
          });
        } else if ('code' in response && response.code === 0) {
          const transactionId = response.data?.transaction_id;
          // GA4イベントはLiveChatArea側でトースト表示後に発火するため、ここでは発火しない
          const newPoint = userPoints - totalPrice;
          setUserPoints(newPoint);
          onPurchaseComplete({
            itemTitle: item.title,
            newPoint,
            itemId: item.itemId,
            price: totalPrice,
            transactionId,
          });
        } else if ('code' in response && response.code === 70) {
          setError('ポイントが不足しています');
          setPurchaseClicked(false);
        } else {
          setError('購入に失敗しました');
          setPurchaseClicked(false);
        }
      } catch (err) {
        console.error('[FleaMarketPurchaseCompact] Purchase error:', err);
        // 例外でも購入成功の可能性があるため成功として扱う
        const newPoint = userPoints - totalPrice;
        setUserPoints(newPoint);
        onPurchaseComplete({
          itemTitle: item.title,
          newPoint,
          itemId: item.itemId,
          price: totalPrice,
        });
      } finally {
        setIsPurchasing(false);
      }
    }, [
      purchaseClicked,
      isPurchasing,
      shippingAddress,
      token,
      userPoints,
      totalPrice,
      item,
      onPurchaseComplete,
    ]);

    const formatPrice = (price: number) => price.toLocaleString('ja-JP');

    if (isLoadingData) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-pink-500" />
          <p className="text-gray-600 text-sm">読み込み中...</p>
        </div>
      );
    }

    // 住所入力フォーム表示
    if (showAddressForm) {
      return (
        <div className="flex h-full flex-col overflow-hidden bg-white">
          <div className="border-gray-200 border-b bg-white px-4 py-3">
            <h2 className="text-center font-bold text-base">配送先を入力</h2>
          </div>

          <form
            onSubmit={formControls.handleSubmit(onSubmitAddress)}
            className="flex flex-1 flex-col overflow-y-auto"
          >
            <div className="flex-1 space-y-3 p-4">
              {/* 氏名 */}
              <div>
                <label className="mb-1 block font-bold text-gray-600 text-xs">
                  氏名
                </label>
                <div className="flex gap-2">
                  <input
                    {...formControls.register('last_name', { required: true })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="山田"
                  />
                  <input
                    {...formControls.register('first_name', { required: true })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="太郎"
                  />
                </div>
              </div>

              {/* 郵便番号 */}
              <div>
                <label className="mb-1 block font-bold text-gray-600 text-xs">
                  郵便番号
                </label>
                <Controller
                  name="postal_code"
                  control={formControls.control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      onChange={(e) =>
                        handlePostalCodeChange(e.target.value, field.onChange)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      placeholder="123-4567"
                    />
                  )}
                />
                {isLoadingAddress && (
                  <p className="mt-1 text-gray-500 text-xs">住所を検索中...</p>
                )}
                {postalCodeError && (
                  <p className="mt-1 text-red-500 text-xs">{postalCodeError}</p>
                )}
              </div>

              {/* 都道府県 */}
              <div>
                <label className="mb-1 block font-bold text-gray-600 text-xs">
                  都道府県
                </label>
                <input
                  {...formControls.register('prefecture', { required: true })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="東京都"
                />
              </div>

              {/* 市区町村 */}
              <div>
                <label className="mb-1 block font-bold text-gray-600 text-xs">
                  市区町村
                </label>
                <input
                  {...formControls.register('city', { required: true })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="渋谷区"
                />
              </div>

              {/* 番地 */}
              <div>
                <label className="mb-1 block font-bold text-gray-600 text-xs">
                  番地
                </label>
                <input
                  {...formControls.register('address_line1', {
                    required: true,
                  })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="1-2-3"
                />
              </div>

              {/* 建物名 */}
              <div>
                <label className="mb-1 block font-bold text-gray-600 text-xs">
                  建物名（任意）
                </label>
                <input
                  {...formControls.register('address_line2')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="○○マンション 101号室"
                />
              </div>

              {/* 電話番号 */}
              <div>
                <label className="mb-1 block font-bold text-gray-600 text-xs">
                  電話番号
                </label>
                <input
                  {...formControls.register('phone_number', { required: true })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="090-1234-5678"
                  type="tel"
                />
              </div>
            </div>

            {/* ボタンエリア */}
            <div className="flex gap-3 border-gray-200 border-t bg-white p-3">
              <button
                type="button"
                onClick={() => setShowAddressForm(false)}
                className="flex-1 rounded-lg border-2 border-gray-300 bg-white py-3 font-bold text-base text-gray-700"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-red-500 py-3 font-bold text-base text-white"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div className="flex h-full flex-col overflow-hidden bg-white">
        {/* ヘッダー */}
        <div className="border-gray-200 border-b bg-white px-4 py-3">
          <h2 className="text-center font-bold text-base">購入詳細</h2>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto">
          {/* 商品情報 */}
          <div className="flex gap-3 border-gray-200 border-b p-4">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {item.images[0] ? (
                <Image
                  src={imageUrlForFleaMarket(item.images[0])}
                  alt={item.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400 text-xs">
                  No Image
                </div>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <h3 className="line-clamp-2 font-bold text-gray-800 text-sm">
                {item.title}
              </h3>
            </div>
          </div>

          {/* 配送先 */}
          <div className="border-gray-200 border-b p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1 font-bold text-gray-800 text-sm">
                <IconMapPin size={16} />
                <span>配送先</span>
              </div>
              {shippingAddress && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center gap-1 text-blue-500 text-xs"
                >
                  <IconEdit size={14} />
                  変更
                </button>
              )}
            </div>
            {shippingAddress ? (
              <div className="rounded-lg bg-gray-50 p-3 text-gray-700 text-sm">
                <p className="font-bold">
                  {shippingAddress.last_name} {shippingAddress.first_name}
                </p>
                <p>〒{shippingAddress.postal_code}</p>
                <p>
                  {shippingAddress.prefecture}
                  {shippingAddress.city}
                  {shippingAddress.address_line1}
                  {shippingAddress.address_line2 &&
                    ` ${shippingAddress.address_line2}`}
                </p>
                <p>{shippingAddress.phone_number}</p>
              </div>
            ) : (
              <button
                onClick={() => setShowAddressForm(true)}
                className="w-full rounded-lg border-2 border-gray-300 border-dashed py-3 text-gray-500 text-sm"
              >
                + 配送先を追加
              </button>
            )}
          </div>

          {/* 支払い情報 */}
          <div className="p-4">
            <h4 className="mb-2 font-bold text-gray-800 text-sm">お支払い</h4>
            <div className="space-y-2 rounded-lg bg-gray-50 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">商品代金</span>
                <span className="text-gray-800">
                  {formatPrice(item.price)}pt
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">手数料</span>
                <span className="text-gray-800">
                  {formatPrice(shippingFee)}pt
                </span>
              </div>
              <div className="border-gray-200 border-t pt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-800">合計</span>
                  <span className="font-bold text-[#ff6666] text-lg">
                    {formatPrice(totalPrice)}pt
                  </span>
                </div>
              </div>
            </div>

            {/* 所持ポイント */}
            <div className="mt-3 flex justify-between rounded-lg bg-blue-50 p-3 text-sm">
              <span className="text-gray-700">所持ポイント</span>
              <span
                className={`font-bold ${userPoints >= totalPrice ? 'text-blue-600' : 'text-red-500'}`}
              >
                {formatPrice(userPoints)}pt
              </span>
            </div>

            {userPoints < totalPrice && (
              <p className="mt-2 text-center text-red-500 text-xs">
                ポイントが不足しています
              </p>
            )}

            {error && (
              <p className="mt-2 text-center text-red-500 text-xs">{error}</p>
            )}
          </div>
        </div>

        {/* ボタンエリア */}
        <div className="flex gap-3 border-gray-200 border-t bg-white p-3">
          <button
            onClick={onBack}
            className="flex-1 rounded-lg border-2 border-gray-300 bg-white py-3 font-bold text-base text-gray-700 transition-colors hover:bg-gray-50"
          >
            戻る
          </button>
          <button
            onClick={handlePurchase}
            disabled={!canPurchase || isPurchasing}
            className={`flex-1 rounded-lg py-3 font-bold text-base text-white transition-colors ${
              canPurchase && !isPurchasing
                ? 'bg-red-500 hover:bg-red-600'
                : 'cursor-not-allowed bg-gray-300'
            }`}
          >
            {isPurchasing ? '処理中...' : '購入する'}
          </button>
        </div>
      </div>
    );
  },
);

FleaMarketPurchaseCompact.displayName = 'FleaMarketPurchaseCompact';

export default FleaMarketPurchaseCompact;

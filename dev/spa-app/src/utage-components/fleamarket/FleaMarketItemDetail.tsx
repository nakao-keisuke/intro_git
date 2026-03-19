// Image component removed (use <img> directly);
import { useNavigate } from '@tanstack/react-router';
import { useSession } from '#/hooks/useSession';
import React, { useEffect, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import {
  IconChevronLeft,
  IconChevronRight,
  IconHeart,
  IconHeartFilled,
} from '@tabler/icons-react';
import { addFleaMarketFavoriteRequest } from '@/apis/add-flea-market-favorite';
import { getFleaMarketFavoriteListRequest } from '@/apis/get-flea-market-favorite-list';
import {
  type FleaMarketItemDetail,
  type FleaMarketItemDetailWithFavorites,
  type GetFleaMarketItemDetailResponseData,
  getFleaMarketItemDetailRequest,
} from '@/apis/get-flea-market-item-detail';
import {
  type FleaMarketItem,
  type GetFleaMarketItemListResponseData,
  getFleaMarketItemListRequest,
} from '@/apis/get-flea-market-item-list';
import { getFleaMarketTransactionListRequest } from '@/apis/get-flea-market-transaction-list';
import { removeFleaMarketFavoriteRequest } from '@/apis/remove-flea-market-favorite';
import RoundedThumbnail from '@/components/RoundedThumbnail';
import {
  ADD_FLEA_MARKET_FAVORITE,
  GET_FLEA_MARKET_FAVORITE_LIST,
  GET_FLEA_MARKET_ITEM_DETAIL,
  GET_FLEA_MARKET_ITEM_LIST,
  GET_FLEA_MARKET_TRANSACTION_LIST,
  GET_USER_INF_FOR_WEB_WITH_USER_ID,
  REMOVE_FLEA_MARKET_FAVORITE,
} from '@/constants/endpoints';
import { getCategoryLabel } from '@/constants/fleaMarketCategory';
import { useFavoriteSync } from '@/hooks/useFavoriteSync';
import {
  type FleaMarketApiResponse,
  isErrorResponse,
  isSuccessResponse,
} from '@/types/FleaMarketError';
import type {
  ActualTransactionListResponseData,
  TransactionWithItem,
} from '@/types/FleaMarketTransaction';
import type {
  FavoriteActionResponse,
  FavoriteItemInList,
  FavoriteListApiResponse,
} from '@/types/fleamarket/favorite';
import { trackEvent } from '@/utils/eventTracker';
import { imageUrlForFleaMarket } from '@/utils/image';
import { postToNext } from '@/utils/next';
import { region } from '@/utils/region';

// Type definition for seller information
interface SellerInfo {
  userId: string;
  userName: string;
  avatarId: string;
  age: number;
  region: string | number;
}

// Type guard function to check if data is a valid FleaMarketItemDetail
function isFleaMarketItemDetail(data: unknown): data is FleaMarketItemDetail {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;
  return (
    typeof obj.item_id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.price === 'number' &&
    Array.isArray(obj.images) &&
    typeof obj.seller_id === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.sales_status === 'string'
  );
}

interface FleaMarketItemDetailProps {
  itemId: string;
  isEmbedded?: boolean;
}

const FleaMarketItemDetailComponent: React.FC<FleaMarketItemDetailProps> = ({
  itemId,
  isEmbedded = false,
}) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.user.token || '';
  const [item, setItem] = useState<FleaMarketItemDetail | null>(null);
  const [favCount, setFavCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [userTransactionId, setUserTransactionId] = useState<string | null>(
    null,
  );
  const [isPurchasedByUser, setIsPurchasedByUser] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);
  const [sellerLoading, setSellerLoading] = useState(false);
  const [sellerOtherItems, setSellerOtherItems] = useState<FleaMarketItem[]>(
    [],
  );
  const [sellerItemsLoading, setSellerItemsLoading] = useState(false);
  const swiperRef = React.useRef<SwiperType | null>(null);
  const { notifyFavoriteChange } = useFavoriteSync();

  // お気に入り状態の同期管理
  useFavoriteSync(({ itemId, isFavorited, favCount: syncedFavCount }) => {
    if (item && item.item_id === itemId) {
      setIsFavorited(isFavorited);
      setFavCount(syncedFavCount);
    }
  });

  useEffect(() => {
    const fetchItemDetail = async () => {
      if (status === 'loading') {
        return;
      }

      // itemIdが無効な場合は処理しない
      if (!itemId || itemId === 'undefined') {
        setError('商品IDが指定されていません');
        setIsLoading(false);
        return;
      }

      try {
        const request = getFleaMarketItemDetailRequest(itemId);
        const response = await postToNext<
          FleaMarketApiResponse<GetFleaMarketItemDetailResponseData>
        >(GET_FLEA_MARKET_ITEM_DETAIL, request);

        if (response.type === 'error' || isErrorResponse(response)) {
          throw new Error(response.message ?? 'エラーが発生しました');
        }

        if (response.data) {
          // Check if data has nested structure or is direct
          if (response.data.item && response.data.fav_count !== undefined) {
            // Nested structure: {item: {...}, fav_count: number}
            const itemData = response.data as FleaMarketItemDetailWithFavorites;
            setItem(itemData.item);
            setFavCount(itemData.fav_count);
          } else {
            // Direct structure: item properties directly in data
            if (isFleaMarketItemDetail(response.data)) {
              setItem(response.data);
              setFavCount(0); // Default value when fav_count is not provided
            } else {
              throw new Error('商品データの形式が不正です');
            }
          }

          // Get item ID for subsequent API calls
          const currentItemId =
            response.data.item?.item_id ||
            (isFleaMarketItemDetail(response.data)
              ? response.data.item_id
              : undefined);
          if (currentItemId && token) {
            // ユーザーが購入した商品かチェックするために取引リストを取得
            await checkUserPurchase(currentItemId);
            // お気に入り状態をチェック
            await fetchFavoriteStatus(currentItemId);
          }
        } else {
          throw new Error('商品が見つかりませんでした');
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : '商品情報の取得に失敗しました',
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchItemDetail();
  }, [status, token, itemId]);

  useEffect(() => {
    const fetchSellerInfo = async () => {
      if (status === 'loading' || !item?.seller_id) return;

      try {
        setSellerLoading(true);
        const response = await postToNext<any>(
          GET_USER_INF_FOR_WEB_WITH_USER_ID,
          {
            myId: session?.user?.id || '',
            partnerId: item.seller_id,
          },
        );

        if (response.type !== 'error' && response.userId) {
          setSellerInfo({
            userId: response.userId,
            userName: response.userName,
            avatarId: response.avatarId,
            age: response.age,
            region: response.region || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch seller info:', error);
      } finally {
        setSellerLoading(false);
      }
    };

    fetchSellerInfo();
  }, [status, item?.seller_id, token]);

  // 出品者の他の商品を取得
  useEffect(() => {
    const fetchSellerOtherItems = async () => {
      if (!item?.seller_id) return;

      try {
        setSellerItemsLoading(true);
        const request = getFleaMarketItemListRequest(
          'all',
          10,
          1,
          undefined, // salesStatus: すべてのステータスを取得
          item.seller_id,
        );

        const response = await postToNext<
          FleaMarketApiResponse<GetFleaMarketItemListResponseData>
        >(GET_FLEA_MARKET_ITEM_LIST, request);

        // レスポンス構造の確認
        if (response && response.type !== 'error') {
          let itemsData: GetFleaMarketItemListResponseData | null = null;

          // レスポンス構造に応じて処理を分岐
          if (Array.isArray(response)) {
            // 直接配列が返ってきた場合
            itemsData = response;
          } else if (response.data && Array.isArray(response.data)) {
            // {data: [...]} の形式の場合
            itemsData = response.data;
          } else if (isSuccessResponse(response) && response.data) {
            // FleaMarketApiResponse<...> の形式の場合
            itemsData = response.data;
          }

          if (itemsData && Array.isArray(itemsData)) {
            // 現在表示中の商品を除外して最大5件取得
            const otherItems = itemsData
              .map((itemWithFav) => itemWithFav.item)
              .filter((i) => i.item_id !== item.item_id)
              .slice(0, 5);

            setSellerOtherItems(otherItems);
          }
        }
      } catch (error) {
        console.error('Failed to fetch seller other items:', error);
      } finally {
        setSellerItemsLoading(false);
      }
    };

    fetchSellerOtherItems();
  }, [item?.seller_id, item?.item_id, token]);

  // ユーザーがこの商品を購入したかチェックする関数
  const checkUserPurchase = async (itemId: string) => {
    try {
      const userId = session?.user?.id || '';

      const request = getFleaMarketTransactionListRequest(token, userId, 1, 50); // 最新50件取得
      const response = await postToNext<
        FleaMarketApiResponse<ActualTransactionListResponseData>
      >(GET_FLEA_MARKET_TRANSACTION_LIST, request);

      // エラーレスポンスの場合はスキップ
      if (response.type === 'error') {
        console.error('Error fetching transactions:', response.message);
        return;
      }

      // 成功レスポンスかつデータが存在する場合のみ処理
      if (isSuccessResponse(response) && response.data) {
        const transactions = response.data.transactions ?? [];

        // この商品を購入した取引を探す
        // レスポンス構造: {item: {...}, transaction: {item_id, transaction_id, ...}}
        const userTransaction = transactions.find(
          (transactionData: TransactionWithItem) =>
            transactionData.transaction?.item_id === itemId,
        );

        if (userTransaction) {
          setIsPurchasedByUser(true);
          setUserTransactionId(userTransaction.transaction.transaction_id);
        }
      }
    } catch (error) {
      // エラーが発生しても商品表示は継続
      console.error('Error checking user purchase:', error);
    }
  };

  // お気に入り状態をチェックする関数
  const fetchFavoriteStatus = async (itemId: string) => {
    try {
      setFavoriteLoading(true);
      const userId = session?.user?.id || '';

      // サーバーからお気に入り状態を取得
      const favoritesRequest = getFleaMarketFavoriteListRequest(
        token,
        userId,
        1,
        50,
      );
      const response = await postToNext<FavoriteListApiResponse>(
        GET_FLEA_MARKET_FAVORITE_LIST,
        favoritesRequest,
      );

      if (response.type === 'success' && response.code === 0 && response.data) {
        // レスポンスが配列の場合とオブジェクトの場合の両方に対応
        const items = Array.isArray(response.data) ? response.data : [];
        const isItemFavorited = items.some(
          (fav: FavoriteItemInList) => fav.item_id === itemId,
        );
        setIsFavorited(isItemFavorited);
      } else {
        console.error('お気に入り状態の取得エラー:', response);
        setIsFavorited(false);
      }
    } catch (error) {
      console.error('お気に入り状態の取得に失敗しました:', error);
      setIsFavorited(false);
    } finally {
      setFavoriteLoading(false);
    }
  };

  // お気に入りのトグル処理
  const handleFavoriteToggle = async () => {
    if (!item || !token) return;

    const userId = session?.user?.id || '';
    const newFavoriteStatus = !isFavorited;
    const previousFavoriteStatus = isFavorited;
    const previousFavCount = favCount;

    // 楽観的UI更新：操作前に即座にUIを更新
    setIsFavorited(newFavoriteStatus);
    setFavCount((prevCount) =>
      newFavoriteStatus ? prevCount + 1 : prevCount - 1,
    );

    try {
      setFavoriteLoading(true);
      setError(null);

      let response: FavoriteActionResponse;

      if (newFavoriteStatus) {
        // お気に入りに追加
        const addRequest = addFleaMarketFavoriteRequest(
          token,
          userId,
          item.item_id,
        );
        response = await postToNext<FavoriteActionResponse>(
          ADD_FLEA_MARKET_FAVORITE,
          addRequest,
        );
      } else {
        // お気に入りから削除
        const removeRequest = removeFleaMarketFavoriteRequest(
          token,
          userId,
          item.item_id,
        );
        response = await postToNext<FavoriteActionResponse>(
          REMOVE_FLEA_MARKET_FAVORITE,
          removeRequest,
        );
      }

      if (response.type === 'success') {
        // 他のコンポーネントにお気に入り状態変更を通知
        notifyFavoriteChange({
          itemId: item.item_id,
          isFavorited: newFavoriteStatus,
          favCount: newFavoriteStatus
            ? previousFavCount + 1
            : previousFavCount - 1,
        });
      } else {
        console.error('お気に入り操作エラー:', response);
        setError(response.message ?? 'お気に入りの操作に失敗しました');

        // 失敗時：状態をロールバック
        setIsFavorited(previousFavoriteStatus);
        setFavCount(previousFavCount);
      }
    } catch (error) {
      console.error('お気に入り操作エラー:', error);
      setError('お気に入り操作に失敗しました');

      // エラー時：状態をロールバック
      setIsFavorited(previousFavoriteStatus);
      setFavCount(previousFavCount);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handlePurchase = () => {
    if (!item) return;

    // 自分が購入した商品の場合は取引詳細ページに遷移
    if (isPurchasedByUser && userTransactionId) {
      const url = isEmbedded
        ? `/fleamarket/transaction/${userTransactionId}?embedded=true`
        : `/fleamarket/transaction/${userTransactionId}`;
      router.push(url);
      return;
    }

    // 売り切れの場合は何もしない
    if (item.sales_status === 'sold') return;

    trackEvent('TAP_PURCHASE_FLEA_MARKET_ITEM');

    // 購入確認画面に遷移（埋め込み時はパラメータを引き継ぐ）
    const url = isEmbedded
      ? `/fleamarket/purchase-confirmation/${item.item_id}?embedded=true`
      : `/fleamarket/purchase-confirmation/${item.item_id}`;
    router.push(url);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ja-JP');
  };

  const formatDate = (dateInput: string | number) => {
    const date =
      typeof dateInput === 'number' ? new Date(dateInput) : new Date(dateInput);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
        <div className="flex min-h-96 flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-pink-500"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
        <div className="flex min-h-96 flex-col items-center justify-center gap-4">
          <p className="text-gray-600">
            {error ?? '商品が見つかりませんでした'}
          </p>
          <button
            onClick={() => router.back()}
            className="rounded-lg bg-pink-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-pink-600"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${isEmbedded ? 'pb-20' : 'pb-40'} bg-gray-50 font-sans md:pb-0`}
    >
      {/* 埋め込み時はヘッダーを非表示 */}
      {!isEmbedded && (
        <div className="flex items-center border-gray-200 border-b bg-white md:hidden">
          <button
            onClick={() => router.back()}
            className="cursor-pointer border-none bg-transparent p-2 text-gray-800"
          >
            <IconChevronLeft size={24} />
          </button>
          <h1 className="z-[98] m-0 w-full flex-1 border-gray-200 border-b bg-white px-4 py-3 text-center font-bold text-lg">
            商品詳細
          </h1>
        </div>
      )}

      <div className="mx-auto max-w-3xl p-4 md:grid md:max-w-[1200px] md:grid-cols-2 md:gap-8 md:pt-6">
        {/* 画像スライダーセクション */}
        <div className="mb-4 overflow-hidden rounded-lg bg-white p-0 md:sticky md:top-[110px] md:mb-0 md:max-h-[calc(100vh-130px)] md:self-start">
          <div className="relative flex aspect-square w-full touch-pan-y select-none items-center justify-center bg-[#f9f9f9]">
            {item.images && item.images.length > 0 ? (
              <>
                <Swiper
                  modules={[Navigation]}
                  slidesPerView={1}
                  speed={500}
                  loop={false}
                  onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                  }}
                  onSlideChange={(swiper) => {
                    setCurrentSlideIndex(swiper.activeIndex);
                  }}
                  className="w-full"
                >
                  {item.images.map((image, index) => (
                    <SwiperSlide key={index}>
                      <div className="flex w-full items-center justify-center bg-[#f9f9f9]">
                        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                          <Image
                            src={imageUrlForFleaMarket(image)}
                            alt={`${item.title} - 画像${index + 1}`}
                            width={400}
                            height={400}
                            className="h-full w-full object-contain object-center"
                          />
                          {item.sales_status === 'sold' && (
                            <div className="absolute top-0 left-0 z-10 h-0 w-0 border-t-[120px] border-t-red-500 border-r-[120px] border-r-transparent border-b-0 border-l-0 border-solid">
                              <span className="absolute -top-[90px] left-2.5 -rotate-45 whitespace-nowrap font-bold text-2xl text-white tracking-wide">
                                SOLD
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* カスタムナビゲーションボタン */}
                {item.images.length > 1 && (
                  <>
                    <button
                      className={`absolute top-1/2 left-3 z-20 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-none bg-gray-800/50 text-white shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-gray-800/70 hover:shadow-lg md:left-3 md:h-10 md:w-10 ${currentSlideIndex === 0 ? 'opacity-50 hover:translate-y-[-50%] hover:bg-gray-300/20 hover:shadow-md' : ''}`}
                      onClick={() => {
                        if (swiperRef.current && currentSlideIndex > 0) {
                          swiperRef.current.slidePrev();
                        }
                      }}
                      disabled={currentSlideIndex === 0}
                      aria-label={
                        currentSlideIndex === 0 ? '最初の画像です' : '前の画像'
                      }
                    >
                      <IconChevronLeft size={20} className="text-white" />
                    </button>
                    <button
                      className={`absolute top-1/2 right-3 z-20 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-none bg-gray-800/50 text-white shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-gray-800/70 hover:shadow-lg md:right-3 md:h-10 md:w-10 ${currentSlideIndex === item.images.length - 1 ? 'opacity-50 hover:translate-y-[-50%] hover:bg-gray-300/20 hover:shadow-md' : ''}`}
                      onClick={() => {
                        if (
                          swiperRef.current &&
                          currentSlideIndex < item.images.length - 1
                        ) {
                          swiperRef.current.slideNext();
                        }
                      }}
                      disabled={currentSlideIndex === item.images.length - 1}
                      aria-label={
                        currentSlideIndex === item.images.length - 1
                          ? '最後の画像です'
                          : '次の画像'
                      }
                    >
                      <IconChevronRight size={20} className="text-white" />
                    </button>
                  </>
                )}

                {/* 画像インジケーター */}
                {item.images.length > 1 && (
                  <div className="absolute right-4 bottom-4 z-10 flex flex-col items-end gap-2">
                    <div className="z-[15] min-w-[40px] rounded bg-black/70 px-3 py-1.5 text-center font-semibold text-sm text-white shadow-md backdrop-blur-sm">
                      <span>
                        {currentSlideIndex + 1} / {item.images.length}
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400 text-lg">
                <span>No Image</span>
              </div>
            )}
          </div>
        </div>

        {/* 商品情報セクション */}
        <div className="mt-4 rounded-lg bg-white p-4 md:mt-0 md:p-6">
          <h2 className="m-0 mb-1.5 font-bold text-xl leading-snug md:text-2xl">
            {item?.title ?? 'タイトル未設定'}
          </h2>

          <div className="flex items-center justify-between border-gray-200 border-b py-2.5">
            <span className="font-bold text-2xl text-red-500 md:text-[32px]">
              {formatPrice(item?.price ?? 0)}pt
            </span>
            <div className="flex items-center">
              <button
                onClick={handleFavoriteToggle}
                className="flex cursor-pointer items-center justify-center border-none bg-transparent p-1 text-gray-800 transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={favoriteLoading}
              >
                <div className="flex items-center gap-0.5">
                  {isFavorited ? (
                    <IconHeartFilled size={24} color="#ff4444" />
                  ) : (
                    <IconHeart size={24} color="#333" />
                  )}
                  <div className="min-w-[20px] text-center text-base text-gray-800 leading-none">
                    {favCount ?? 0}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="border-gray-200 border-b py-4">
            <h3 className="m-0 mb-3 font-bold text-base">商品説明</h3>
            <p className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed">
              {item?.description ?? '説明がありません'}
            </p>
          </div>

          <div className="border-gray-200 border-b py-4">
            <div className="flex justify-between py-2">
              <span className="text-gray-600 text-sm">出品日</span>
              <span className="text-gray-800 text-sm">
                {item?.created_at ? formatDate(item.created_at) : '不明'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600 text-sm">カテゴリ</span>
              <span className="text-gray-800 text-sm">
                {item?.category ? getCategoryLabel(item.category) : '不明'}
              </span>
            </div>
          </div>

          {/* PC表示用：購入ボタン */}
          <div className="hidden border-gray-200 border-b py-5 md:block">
            <button
              className={`w-full cursor-pointer rounded-lg border-none bg-red-500 py-4 font-bold text-lg text-white transition-colors hover:bg-pink-600 ${item?.sales_status === 'sold' && !isPurchasedByUser ? 'cursor-not-allowed bg-gray-300 hover:bg-gray-300' : ''}`}
              onClick={handlePurchase}
              disabled={item?.sales_status === 'sold' && !isPurchasedByUser}
            >
              {isPurchasedByUser
                ? '取引詳細を見る'
                : item?.sales_status === 'sold'
                  ? '売り切れ'
                  : '購入手続きへ'}
            </button>
          </div>

          {/* 出品者情報 */}
          <div className="border-gray-200 border-b py-4">
            <h3 className="m-0 mb-3 font-bold text-base">出品者情報</h3>
            {sellerLoading ? (
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                  <span className="text-gray-500 text-xs">読込中...</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-gray-400 text-lg">
                    読み込み中...
                  </span>
                </div>
              </div>
            ) : sellerInfo ? (
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 cursor-pointer overflow-hidden rounded-full">
                  <RoundedThumbnail
                    avatarId={sellerInfo.avatarId}
                    customSize={{ width: 48, height: 48 }}
                    deviceCategory="mobile"
                    onClick={() =>
                      router.push(`/profile/unbroadcaster/${sellerInfo.userId}`)
                    }
                  />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-gray-800 text-lg">
                    {sellerInfo.userName}
                  </span>
                  <div className="flex items-center gap-1 text-gray-600 text-sm">
                    <span className="pr-1">{sellerInfo.age}歳</span>
                    {sellerInfo.region && (
                      <span>
                        {typeof sellerInfo.region === 'string'
                          ? sellerInfo.region
                          : region(sellerInfo.region)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={() =>
                      router.push(`/profile/unbroadcaster/${sellerInfo.userId}`)
                    }
                    className="cursor-pointer whitespace-nowrap rounded-lg border-[1.5px] border-pink-500 bg-white px-4 py-2 font-semibold text-pink-500 text-sm transition-all duration-200 hover:-translate-y-px hover:border-transparent hover:bg-pink-400 hover:text-white hover:shadow-[0_2px_8px_rgba(255,89,164,0.3)] active:translate-y-0 active:shadow-[0_1px_4px_rgba(255,89,164,0.3)]"
                  >
                    プロフィールを見る
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                  <span className="text-gray-500">?</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-gray-600 text-lg">
                    出品者情報を取得できませんでした
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* PC表示用：出品者のその他の商品 */}
          {sellerOtherItems.length > 0 && (
            <div className="mt-4 hidden border-gray-200 border-t py-5 md:block">
              <h3 className="mb-3 font-bold text-base text-gray-800 md:mb-4 md:text-lg">
                この出品者のその他の商品
              </h3>
              {sellerItemsLoading ? (
                <div className="flex justify-center py-10">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-pink-400"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] md:gap-4">
                  {sellerOtherItems.map((otherItem) => (
                    <div
                      key={otherItem.item_id}
                      className="cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                      onClick={() =>
                        router.push(`/fleamarket/item/${otherItem.item_id}`)
                      }
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                        {otherItem.images &&
                        otherItem.images.length > 0 &&
                        otherItem.images[0] ? (
                          <Image
                            src={imageUrlForFleaMarket(otherItem.images[0])}
                            alt={otherItem.title}
                            width={150}
                            height={150}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-400 text-sm">
                            No Image
                          </div>
                        )}
                        {otherItem.sales_status === 'sold' && (
                          <div className="absolute top-0 left-0 z-10 h-0 w-0 border-t-[70px] border-t-red-500 border-r-[70px] border-r-transparent border-b-0 border-l-0 border-solid">
                            <span className="absolute -top-[55px] left-1 -rotate-45 whitespace-nowrap font-bold text-base text-white tracking-wide">
                              SOLD
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="m-0 mb-2 line-clamp-2 overflow-hidden text-ellipsis font-medium text-gray-800 text-sm leading-snug">
                          {otherItem.title}
                        </p>
                        <p className="m-0 font-bold text-base text-red-500">
                          {formatPrice(otherItem.price)}pt
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 固定購入ボタン */}
      <div
        className="fixed right-0 left-0 z-[1000] border-gray-200 border-t bg-white px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] md:hidden"
        style={{
          bottom: isEmbedded
            ? '0px'
            : 'calc(60px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <button
          className={`mb-4 w-full cursor-pointer rounded-lg border-none bg-red-500 py-4 font-bold text-lg text-white transition-colors hover:bg-pink-600 ${item?.sales_status === 'sold' && !isPurchasedByUser ? 'cursor-not-allowed bg-gray-300 hover:bg-gray-300' : ''}`}
          onClick={handlePurchase}
          disabled={item?.sales_status === 'sold' && !isPurchasedByUser}
        >
          {isPurchasedByUser
            ? '取引詳細を見る'
            : item?.sales_status === 'sold'
              ? '売り切れ'
              : '購入手続きへ'}
        </button>
      </div>
    </div>
  );
};

export default FleaMarketItemDetailComponent;

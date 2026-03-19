import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  type AddFleaMarketFavoriteResponseData,
  addFleaMarketFavoriteRequest,
} from '@/apis/add-flea-market-favorite';
import {
  type GetFleaMarketFavoriteListResponseData,
  getFleaMarketFavoriteListRequest,
} from '@/apis/get-flea-market-favorite-list';
import {
  type FleaMarketItemDetail,
  type GetFleaMarketItemDetailResponseData,
  getFleaMarketItemDetailRequest,
} from '@/apis/get-flea-market-item-detail';
import {
  type GetUserInfoResponseData,
  getUserInfoRequest,
} from '@/apis/get-user-inf';
import {
  type GetUserInfoForWebResponseData,
  getUserInfoForWebWithUserIdRequest,
} from '@/apis/get-user-inf-for-web';
import {
  type RemoveFleaMarketFavoriteResponseData,
  removeFleaMarketFavoriteRequest,
} from '@/apis/remove-flea-market-favorite';
import {
  ADD_FLEA_MARKET_FAVORITE,
  GET_FLEA_MARKET_FAVORITE_LIST,
  GET_USER_INF_FOR_WEB_WITH_USER_ID,
  REMOVE_FLEA_MARKET_FAVORITE,
} from '@/constants/endpoints';
import { postToJambo } from '@/utils/jambo';
import { postToNext } from '@/utils/next';

export interface MaleItemDetailPageProps {
  data:
    | {
        type: 'success';
        item: FleaMarketItemDetail;
        token: string;
        currentUserId: string;
        transactionId: string | null;
        isFavorited: boolean;
      }
    | {
        type: 'error';
        message: string;
      };
}

export const getServerSideProps: GetServerSideProps<
  MaleItemDetailPageProps
> = async (context) => {
  const { query } = context;
  const itemId = query.itemId as string;
  let sid = query.sid as string;

  if (!sid) {
    const cookies = context.req.headers.cookie;
    if (cookies) {
      const sidMatch = cookies.match(/sid=([^;]+)/);
      if (sidMatch?.[1]) {
        sid = sidMatch[1];
      }
    }
  }

  if (!sid || !itemId) {
    return {
      props: {
        data: {
          type: 'error',
          message: '必要なパラメータが不足しています',
        },
      },
    };
  }

  try {
    // ユーザー情報取得
    const userRequest = getUserInfoRequest(sid);
    const { code: userCode, data: userData } =
      await postToJambo<GetUserInfoResponseData>(userRequest, context.req);

    if (userCode || !userData) {
      return {
        props: {
          data: {
            type: 'error',
            message: '認証に失敗しました',
          },
        },
      };
    }

    // 商品詳細取得
    const itemDetailRequest = getFleaMarketItemDetailRequest(itemId);
    const { code: itemCode, data: itemData } =
      await postToJambo<GetFleaMarketItemDetailResponseData>(
        itemDetailRequest,
        context.req,
      );

    if (itemCode !== 0 || !itemData) {
      // エラーメッセージを詳細化
      let errorMessage = '商品情報の取得に失敗しました';
      if (String(itemCode) === 'ITEM_NOT_FOUND') {
        errorMessage = '指定された商品が見つかりません';
      } else if (String(itemCode) === 'UNAUTHORIZED') {
        errorMessage = '商品を閲覧する権限がありません';
      }

      return {
        props: {
          data: {
            type: 'error',
            message: errorMessage,
          },
        },
      };
    }

    // 購入済み商品の場合、取引データを取得
    const transactionId: string | null = null;
    // if (itemData.sales_status === 'sold' || itemData.sales_status === 'sold_out') {
    //   try {
    //     const transactionRequest = getFleaMarketTransactionListRequest(
    //       sid,
    //       userData.user_id,
    //       1,
    //       50
    //     );
    //     const transactionResponse = await postToJambo<any>(
    //       transactionRequest,
    //       context.req
    //     );
    //     if (
    //       transactionResponse.code === 0 &&
    //       transactionResponse.data?.transactions
    //     ) {
    //       const transaction = transactionResponse.data.transactions.find((t: any) => t.item_id === itemId && t.buyer_id === userData.user_id);
    //       transactionId = transaction?.transaction_id || null;
    //     }
    //   } catch (error) {
    //     console.log('取引データの取得に失敗しました:', error);
    //   }
    // }

    // お気に入り状態はクライアントサイドで取得
    const isFavorited = false;

    return {
      props: {
        data: {
          type: 'success',
          // The API response for getFleaMarketItemDetailRequest returns an object with an 'item' property containing the actual item details.
          // We extract 'item' from 'itemData' here to flatten the data structure passed to the page component.
          // This makes the component interface simpler and decouples it from the full API response shape.
          // (If the API response structure changes in the future, only this extraction needs to be updated.)
          item: itemData.item,
          token: sid,
          currentUserId: userData.user_id,
          transactionId: transactionId,
          isFavorited: isFavorited,
        },
      },
    };
  } catch (_error) {
    return {
      props: {
        data: {
          type: 'error',
          message: 'サーバーエラーが発生しました',
        },
      },
    };
  }
};

export const useMaleItemDetailData = (
  props: MaleItemDetailPageProps['data'],
) => {
  const router = useRouter();
  const [loading, _setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sellerInfo, setSellerInfo] = useState<any | null>(null);
  const [sellerLoading, setSellerLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(
    props.type === 'success' ? props.isFavorited : false,
  );
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Fetch seller info when component mounts and we have item data
  useEffect(() => {
    const fetchSellerInfo = async () => {
      if (props.type !== 'success' || !props.item.seller_id) return;

      try {
        setSellerLoading(true);

        const request = getUserInfoForWebWithUserIdRequest(
          props.currentUserId,
          props.item.seller_id,
        );
        const response = await postToNext<GetUserInfoForWebResponseData>(
          GET_USER_INF_FOR_WEB_WITH_USER_ID,
          request,
        );

        if (response.type === 'success') {
          setSellerInfo({
            userId: response.user_id,
            userName: response.user_name,
            avatarId: response.ava_id,
            age: response.age,
            point: response.point,
            type: 'success',
          });
        } else {
          console.error('Failed to fetch seller info:', response);
        }
      } catch (err) {
        console.error('Error fetching seller info:', err);
      } finally {
        setSellerLoading(false);
      }
    };

    fetchSellerInfo();
  }, [
    props.type,
    props.type === 'success' ? props.item.seller_id : null,
    props.type === 'success' ? props.token : null,
  ]);

  // お気に入り状態を取得
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (props.type !== 'success') return;

      try {
        setFavoriteLoading(true);

        // まずローカルストレージから状態を確認
        const favoriteKey = `favorite_${props.currentUserId}_${props.item.item_id}`;
        const localFavoriteStatus = localStorage.getItem(favoriteKey);

        if (localFavoriteStatus === 'true') {
          setIsFavorited(true);
          setFavoriteLoading(false);
          return;
        }

        // ローカルストレージに無い場合、サーバーから取得
        const favoritesRequest = getFleaMarketFavoriteListRequest(
          props.token,
          props.currentUserId,
          1,
          50,
        );
        const response =
          await postToNext<GetFleaMarketFavoriteListResponseData>(
            GET_FLEA_MARKET_FAVORITE_LIST,
            favoritesRequest,
          );

        if (response.type === 'success' && Array.isArray(response)) {
          const isItemFavorited = response.some(
            (fav: any) => fav.item_id === props.item.item_id,
          );
          setIsFavorited(isItemFavorited);

          // サーバーの状態をローカルストレージに同期
          if (isItemFavorited) {
            localStorage.setItem(favoriteKey, 'true');
          } else {
            localStorage.removeItem(favoriteKey);
          }
        }
      } catch (error) {
        console.error('お気に入り状態の取得に失敗しました:', error);
      } finally {
        setFavoriteLoading(false);
      }
    };

    fetchFavoriteStatus();
  }, [
    props.type,
    props.type === 'success' ? props.currentUserId : null,
    props.type === 'success' ? props.item.item_id : null,
  ]);

  const handleBackClick = () => {
    router.back();
  };

  const handleViewSellerProfile = () => {
    if (props.type === 'success' && props.item.seller_id) {
      router.push(
        `/flea-market/male/seller/${props.item.seller_id}?sid=${props.token}`,
      );
    }
  };

  const handleStartTransaction = () => {
    if (props.type !== 'success') return;

    // Check if user is trying to buy their own item
    if (props.item.seller_id === props.currentUserId) {
      setError('自分の商品は購入できません');
      return;
    }

    // Navigate to purchase confirmation page
    router.push(`/fleamarket/purchase-confirmation/${props.item.item_id}`);
  };

  const navigateToTransaction = () => {
    if (props.type === 'success' && props.transactionId) {
      router.push(
        `/flea-market/male/transaction/${props.transactionId}?sid=${props.token}`,
      );
    }
  };

  const isOwnItem =
    props.type === 'success' && props.item.seller_id === props.currentUserId;
  const canPurchase =
    props.type === 'success' &&
    !isOwnItem &&
    props.item.sales_status === 'on_sale';
  const isPurchasedItem =
    props.type === 'success' &&
    (props.item.sales_status === 'sold' ||
      props.item.sales_status === 'sold_out') &&
    props.transactionId &&
    !isOwnItem;

  const getStatusDisplayName = (status: string) => {
    const statusMap: { [key: string]: string } = {
      on_sale: '販売中',
      sold: '売り切れ',
      sold_out: '売り切れ',
      draft: '下書き',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      on_sale: '#4caf50',
      sold: '#9e9e9e',
      sold_out: '#9e9e9e',
      draft: '#ff9800',
    };
    return colorMap[status] || '#666';
  };

  const handleFavoriteToggle = async () => {
    if (props.type !== 'success') return;

    try {
      setFavoriteLoading(true);
      setError(null);
      const newFavoriteStatus = !isFavorited;

      if (newFavoriteStatus) {
        // お気に入りに追加
        const addRequest = addFleaMarketFavoriteRequest(
          props.token,
          props.currentUserId,
          props.item.item_id,
        );

        const response = await postToNext<AddFleaMarketFavoriteResponseData>(
          ADD_FLEA_MARKET_FAVORITE,
          addRequest,
        );

        if (response.type === 'success') {
          setIsFavorited(true);
          // ローカルストレージに保存
          const favoriteKey = `favorite_${props.currentUserId}_${props.item.item_id}`;
          localStorage.setItem(favoriteKey, 'true');

          // 少し待ってからお気に入り状態を確認（データベース同期のため）
          setTimeout(async () => {
            try {
              const checkRequest = getFleaMarketFavoriteListRequest(
                props.token,
                props.currentUserId,
                1,
                10,
              );
              const _checkResponse =
                await postToNext<GetFleaMarketFavoriteListResponseData>(
                  GET_FLEA_MARKET_FAVORITE_LIST,
                  checkRequest,
                );
            } catch (error) {
              console.error('お気に入り追加後の確認エラー:', error);
            }
          }, 2000);
        } else {
          console.error('お気に入り追加エラー:', response);
          const errorMessage =
            response.type === 'error'
              ? response.message
              : 'お気に入りの追加に失敗しました';
          setError(errorMessage);
        }
      } else {
        // お気に入りから削除
        const removeRequest = removeFleaMarketFavoriteRequest(
          props.token,
          props.currentUserId,
          props.item.item_id,
        );

        const response = await postToNext<RemoveFleaMarketFavoriteResponseData>(
          REMOVE_FLEA_MARKET_FAVORITE,
          removeRequest,
        );

        if (response.type === 'success') {
          setIsFavorited(false);
          // ローカルストレージから削除
          const favoriteKey = `favorite_${props.currentUserId}_${props.item.item_id}`;
          localStorage.removeItem(favoriteKey);
        } else {
          console.error('お気に入り削除エラー:', response);
          const errorMessage =
            response.type === 'error'
              ? response.message
              : 'お気に入りの削除に失敗しました';
          setError(errorMessage);
        }
      }
    } catch (error) {
      console.error('お気に入り操作エラー:', error);
      setError('お気に入り操作に失敗しました');
    } finally {
      setFavoriteLoading(false);
    }
  };

  return {
    loading,
    error,
    handleBackClick,
    handleStartTransaction,
    handleViewSellerProfile,
    navigateToTransaction,
    isOwnItem,
    canPurchase,
    isPurchasedItem,
    getStatusDisplayName,
    getStatusColor,
    sellerInfo,
    sellerLoading,
    isFavorited,
    favoriteLoading,
    handleFavoriteToggle,
  };
};

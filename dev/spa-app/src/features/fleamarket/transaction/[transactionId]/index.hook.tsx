import { useRouter } from 'next/router';
import { useSession } from '#/hooks/useSession';
import { useEffect, useState } from 'react';
import {
  type GetFleaMarketShipmentsDetailResponse,
  getFleaMarketShipmentsDetailRequest,
} from '@/apis/get-flea-market-shipments-detail';
import { getFleaMarketTransactionDetailRequest } from '@/apis/get-flea-market-transaction-detail';
import { updateFleaMarketTransactionRequest } from '@/apis/update_flea_market_transaction';
import { updateFleaMarketShipmentStatusRequest } from '@/apis/update-flea-market-shipment-status';
import {
  GET_FLEA_MARKET_SHIPMENTS_DETAIL,
  GET_FLEA_MARKET_TRANSACTION_DETAIL,
  GET_USER_INF_FOR_WEB_WITH_USER_ID,
  UPDATE_FLEA_MARKET_SHIPMENT_STATUS,
  UPDATE_FLEA_MARKET_TRANSACTION,
} from '@/constants/endpoints';
import {
  extractUserName,
  hasUserName,
  hasValidTransactionData,
  isTransactionErrorResponse,
  isTransactionSuccessResponse,
  type TransactionDetailExtended,
  type TransactionDetailResponse,
  type UserInfoForWebResponse,
} from '@/types/FleaMarketTransaction';
import { postToNext } from '@/utils/next';

export const useTransactionDetail = () => {
  const router = useRouter();
  const session = useSession();
  const { transactionId } = router.query;

  const [transaction, setTransaction] =
    useState<TransactionDetailExtended | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sellerName, setSellerName] = useState<string>('');
  const [buyerName, setBuyerName] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState(false);

  // ユーザー情報を取得する関数
  const fetchUserInfo = async (userId: string, token: string) => {
    try {
      const request = {
        api: 'get_user_info_for_web',
        myId: token,
        partnerId: userId,
      };
      const response = await postToNext<UserInfoForWebResponse>(
        GET_USER_INF_FOR_WEB_WITH_USER_ID,
        request,
      );

      // 型ガードを使用してuserNameの存在をチェック
      if (hasUserName(response)) {
        return extractUserName(response);
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
    return null;
  };

  const getStatusNote = (status: string) => {
    const noteMap: { [key: string]: string } = {
      pending: '取引が開始されました',
      awaiting_payment: '購入者の支払いを待っています',
      preparing: '商品の発送準備中です',
      shipping: '商品が発送されました',
      in_transit: '商品を配送中です',
      delivered: '商品が配達されました',
      completed: '取引が完了しました',
      cancelled: '取引がキャンセルされました',
    };
    return noteMap[status] || '';
  };

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!transactionId || typeof transactionId !== 'string') {
        setError('取引IDが無効です');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const token = session.data?.user.token || (router.query.sid as string);
        if (!token) {
          setError('認証が必要です');
          return;
        }

        const request = getFleaMarketTransactionDetailRequest(
          token,
          transactionId,
        );

        const response = await postToNext<TransactionDetailResponse>(
          GET_FLEA_MARKET_TRANSACTION_DETAIL,
          request,
        );

        if (isTransactionErrorResponse(response)) {
          setError(response.message || '取引情報の取得に失敗しました');
        } else if (isTransactionSuccessResponse(response)) {
          if (!hasValidTransactionData(response)) {
            setError('取引データまたは商品データが見つかりませんでした');
            return;
          }

          const responseData = response.data || response;
          const transaction = responseData.transaction;
          const item_info = responseData.item_info;

          // transaction と item_info が undefined でないことを確認
          if (!transaction || !item_info) {
            setError('取引データまたは商品データが見つかりませんでした');
            return;
          }

          const transactionData: TransactionDetailExtended = {
            transaction_id: transaction.transaction_id || '',
            item_id: transaction.item_id || '',
            seller_id: transaction.seller_id || '',
            buyer_id: transaction.buyer_id || '',
            price: transaction.price || 0,
            status: transaction.status || '',
            created_at: transaction.created_at || '',
            updated_at: transaction.updated_at || '',
            item: {
              title: item_info.title,
              description: item_info.description,
              price: item_info.price,
              category: item_info.category,
              images: item_info.images || [],
            },
            seller: null, // APIレスポンスにsellerフィールドは存在しない
            buyer: null, // APIレスポンスにbuyerフィールドは存在しない
            estimated_delivery: responseData.estimated_delivery || null,
            shipping_address: responseData.shipping_address || null,
            shipping_history: responseData.shipping_history || [
              {
                status: transaction.status,
                timestamp: transaction.updated_at || transaction.created_at,
                note: getStatusNote(transaction.status),
              },
            ],
          };
          setTransaction(transactionData);

          // ユーザー名を取得（seller_idとbuyer_idが存在する場合のみ）
          if (transaction.seller_id && transaction.buyer_id) {
            try {
              const [seller, buyer] = await Promise.all([
                fetchUserInfo(transaction.seller_id, token),
                fetchUserInfo(transaction.buyer_id, token),
              ]);

              if (seller) setSellerName(seller);
              if (buyer) setBuyerName(buyer);
            } catch (error) {
              console.error('Error fetching user names:', error);
            }
          }
        } else {
          // 未知のレスポンス形式の場合
          const errorMessage =
            typeof response === 'object' &&
            response !== null &&
            'message' in response
              ? (response as { message: string }).message
              : typeof response === 'object' &&
                  response !== null &&
                  'code' in response
                ? `API Error: Code ${(response as { code: number }).code}`
                : '不明なエラーが発生しました';
          setError(errorMessage);
        }
      } catch (err) {
        console.error('Error fetching transaction:', err);
        setError('取引情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (transactionId) {
      fetchTransaction();
    }
  }, [transactionId, session.data?.user.token, router.query.sid]);

  const handleBack = () => {
    router.back();
  };

  const handleConfirmDelivery = async () => {
    if (!transaction || !transactionId || typeof transactionId !== 'string') {
      return;
    }

    const token = session.data?.user.token || (router.query.sid as string);
    if (!token) {
      setError('認証が必要です');
      return;
    }

    try {
      setIsConfirming(true);
      setError(null);

      const request = updateFleaMarketTransactionRequest(
        token,
        transactionId,
        'completed',
      );

      const response = await postToNext(
        UPDATE_FLEA_MARKET_TRANSACTION,
        request,
      );
      if (response && 'errorCode' in response && response.errorCode !== 0) {
        setError('受け取り確認に失敗しました');
      } else {
        // 取引ステータスが正常に更新された場合、配送ステータスも更新
        let shippingId: string | undefined;
        if (transaction.buyer_id) {
          try {
            // get_flea_market_shipments_detail APIを呼び出してshipping_idを取得
            const shipmentsDetailRequest = getFleaMarketShipmentsDetailRequest(
              token,
              transaction.buyer_id,
              transactionId,
            );
            const shipmentsDetailResponse =
              await postToNext<GetFleaMarketShipmentsDetailResponse>(
                GET_FLEA_MARKET_SHIPMENTS_DETAIL,
                shipmentsDetailRequest,
              );

            // postToNextの実際のレスポンス構造に合わせた型チェック
            if (
              'type' in shipmentsDetailResponse &&
              shipmentsDetailResponse.type === 'error'
            ) {
              console.warn(
                'Failed to retrieve shipping_id from API:',
                shipmentsDetailResponse.message || 'Unknown error',
              );
            } else if (
              'data' in shipmentsDetailResponse &&
              shipmentsDetailResponse.data
            ) {
              shippingId = shipmentsDetailResponse.data.shipping_id;
            } else {
              console.warn(
                'Unexpected response format from shipments detail API',
              );
            }
          } catch (error) {
            console.error('Error fetching shipments detail:', error);
          }
        }
        if (shippingId && transaction.buyer_id) {
          try {
            const shipmentRequest = updateFleaMarketShipmentStatusRequest(
              token,
              transaction.buyer_id,
              shippingId,
            );
            const _response = await postToNext<{}>(
              UPDATE_FLEA_MARKET_SHIPMENT_STATUS,
              shipmentRequest,
            );
            // 配送ステータス更新のエラーは無視（取引ステータスは既に更新済み）
          } catch (shipmentError) {
            console.error('Failed to update shipment status:', shipmentError);
            // エラーは記録するが、ユーザーには表示しない
          }
        }

        // 成功した場合、取引データを更新
        setTransaction({
          ...transaction,
          status: 'completed',
          shipping_history: [
            ...(transaction.shipping_history || []),
            {
              status: 'completed',
              timestamp: new Date().toISOString(),
              note: '商品の受け取りが確認されました',
            },
          ],
        });
      }
    } catch (err) {
      console.error('Error confirming delivery:', err);
      setError('受け取り確認に失敗しました');
    } finally {
      setIsConfirming(false);
    }
  };

  const formatPrice = (price: number | undefined) => {
    if (!price && price !== 0) return '0pt';
    return `${price.toLocaleString()}pt`;
  };

  const formatDate = (dateString: string | number) => {
    const date = new Date(dateString);
    // 日本時間（JST）での表示を保証
    return date.toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: '取引中',
      awaiting_payment: '支払い待ち',
      preparing: '発送準備中',
      shipping: '発送済み',
      in_transit: '輸送中',
      delivered: '配達完了',
      completed: '取引完了',
      cancelled: 'キャンセル',
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'check';
      case 'shipping':
      case 'in_transit':
        return 'truck';
      case 'preparing':
        return 'package';
      default:
        return 'clock';
    }
  };

  const getProgressWidth = (status: string) => {
    switch (status) {
      case 'preparing':
      case 'awaiting_payment':
        return 0;
      case 'shipping':
      case 'in_transit':
        return 50;
      case 'delivered':
      case 'completed':
        return 100;
      default:
        return 0;
    }
  };

  const getStepStatus = (stepIndex: number, currentStatus: string) => {
    const progressWidth = getProgressWidth(currentStatus);
    const stepProgress = (stepIndex / 2) * 100;

    if (stepProgress < progressWidth) return 'completed';
    if (stepProgress === progressWidth) return 'active';
    return 'pending';
  };

  return {
    transaction,
    loading,
    error,
    sellerName,
    buyerName,
    handleBack,
    handleConfirmDelivery,
    isConfirming,
    formatPrice,
    formatDate,
    getStatusLabel,
    getStatusIcon,
    getProgressWidth,
    getStepStatus,
    router,
  };
};

import { IconHeart } from '@tabler/icons-react';
// Image component removed (use <img> directly);
import { useNavigate } from '@tanstack/react-router';
import { useSession } from '#/hooks/useSession';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { addFleaMarketFavoriteRequest } from '@/apis/add-flea-market-favorite';
import { getFleaMarketFavoriteListRequest } from '@/apis/get-flea-market-favorite-list';
import {
  type FleaMarketItemWithFavorites,
  getFleaMarketItemListRequest,
} from '@/apis/get-flea-market-item-list';
import { removeFleaMarketFavoriteRequest } from '@/apis/remove-flea-market-favorite';
import {
  ADD_FLEA_MARKET_FAVORITE,
  GET_FLEA_MARKET_FAVORITE_LIST,
  GET_FLEA_MARKET_ITEM_LIST,
  REMOVE_FLEA_MARKET_FAVORITE,
} from '@/constants/endpoints';
import { isFleaMarketError } from '@/constants/fleaMarketErrorCodes';
import { useFavoriteSync } from '@/hooks/useFavoriteSync';
import styles from '@/styles/fleamarket/FleaMarketItemList.module.css';
import gridStyles from '@/styles/fleamarket/seller-detail.module.css';
import type {
  FavoriteActionResponse,
  FavoriteItem,
  FavoriteListApiResponse,
} from '@/types/fleamarket/favorite';
import { imageUrlForFleaMarket } from '@/utils/image';
import { postToNext } from '@/utils/next';

interface FleaMarketItemListProps {
  category?: string;
  sellerId?: string;
  salesStatus?: string;
  token?: string;
  onItemsLoaded?: (totalCount: number, hasItems: boolean) => void;
  gridLayout?: boolean;
}

const FleaMarketItemList: React.FC<FleaMarketItemListProps> = ({
  category = 'all',
  sellerId,
  salesStatus = 'all',
  token: propToken,
  onItemsLoaded,
  gridLayout = false,
}) => {
  const router = useRouter();
  const session = useSession();
  const token = propToken || session.data?.user.token || '';
  const [items, setItems] = useState<FleaMarketItemWithFavorites[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favoriteItems, setFavoriteItems] = useState<Set<string>>(new Set());
  const [togglingFavorites, setTogglingFavorites] = useState<Set<string>>(
    new Set(),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 50; // ページネーション用により小さな値に変更
  const { notifyFavoriteChange } = useFavoriteSync();
  const loadingRef = useRef<HTMLDivElement>(null);
  const gridLoadingRef = useRef<HTMLDivElement>(null);

  // Pull-to-Refresh用の状態（再有効化）
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [startY, setStartY] = useState(0);
  const [allowPullToRefresh, setAllowPullToRefresh] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // パフォーマンス最適化のための状態
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // 水平スクロール境界制御
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAtLeftBoundary, setIsAtLeftBoundary] = useState(true);
  const [isAtRightBoundary, setIsAtRightBoundary] = useState(false);

  // 更新前のスクロール位置を保存
  const savedScrollPositionRef = useRef<number>(0);

  // お気に入り状態の同期管理
  useFavoriteSync(({ itemId, isFavorited, favCount }) => {
    setFavoriteItems((prev) => {
      const newSet = new Set(prev);
      if (isFavorited) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });

    setItems((prevItems) =>
      prevItems.map((itemData) =>
        itemData.item.item_id === itemId
          ? { ...itemData, fav_count: favCount }
          : itemData,
      ),
    );
  });

  const fetchItems = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setCurrentPage(1);
        setHasMore(true);
      }
      setError(null);

      try {
        // 商品一覧とお気に入り状態を並行して取得
        const [itemsResponse, favoriteResponse] = await Promise.all([
          postToNext<{
            code: number;
            data: FleaMarketItemWithFavorites[] | null;
            message?: string;
          }>(
            GET_FLEA_MARKET_ITEM_LIST,
            getFleaMarketItemListRequest(
              category,
              limit,
              pageNum,
              salesStatus === 'all' ? undefined : salesStatus,
              sellerId,
            ),
          ),
          // お気に入り状態は初回のみ取得
          !append && token && session.data?.user?.id
            ? postToNext<FavoriteListApiResponse>(
                GET_FLEA_MARKET_FAVORITE_LIST,
                getFleaMarketFavoriteListRequest(
                  token,
                  session.data.user.id,
                  1,
                  50, // パフォーマンスとメモリ使用量を考慮した安全な件数
                ),
              )
            : Promise.resolve(null),
        ]);

        // 商品データの処理
        if (itemsResponse.type === 'error') {
          throw new Error(itemsResponse.message || 'エラーが発生しました');
        }

        if (itemsResponse.code !== 0) {
          // エラーコードに応じた処理
          const errorCode: number = itemsResponse.code;

          if (isFleaMarketError(errorCode, 'NO_SELLERS_FOUND')) {
            // 出品者が見つからない場合は空配列として処理
            if (!append) {
              setItems([]);
              if (onItemsLoaded) {
                onItemsLoaded(0, false);
              }
            }
            setHasMore(false);
            return;
          } else if (isFleaMarketError(errorCode, 'INSUFFICIENT_POINTS')) {
          } else if (isFleaMarketError(errorCode, 'INVALID_ITEM_CATEGORY')) {
          }

          throw new Error(itemsResponse.message || 'エラーが発生しました');
        }

        const newItemsWithFavorites = Array.isArray(itemsResponse.data)
          ? itemsResponse.data
          : [];

        // ページネーション用の状態更新
        if (append) {
          setItems((prevItems) => [...prevItems, ...newItemsWithFavorites]);
          setCurrentPage(pageNum);
        } else {
          setItems(newItemsWithFavorites);
        }

        // hasMoreの判定: 取得された件数がlimitより少ない場合、これ以上データがない
        setHasMore(newItemsWithFavorites.length >= limit);

        // お気に入り状態の処理（初回のみ）
        if (!append) {
          let favoriteItemIds = new Set<string>();

          if (
            favoriteResponse &&
            favoriteResponse.type !== 'error' &&
            favoriteResponse.code === 0
          ) {
            // サーバーからのデータを使用
            const favoriteData = favoriteResponse.data || [];
            favoriteItemIds = new Set<string>(
              (favoriteData as FavoriteItem[]).map((fav) => fav.item_id),
            );
          }

          setFavoriteItems(favoriteItemIds);

          // 親コンポーネントにアイテム情報を通知
          if (onItemsLoaded) {
            onItemsLoaded(
              newItemsWithFavorites.length,
              newItemsWithFavorites.length > 0,
            );
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : '商品の取得に失敗しました',
        );
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [
      token,
      category,
      limit,
      salesStatus,
      sellerId,
      onItemsLoaded,
      session.data?.user?.id,
    ],
  );

  // 水平スクロール境界チェック関数
  const updateBoundaryStates = useCallback(
    (scrollLeft: number, scrollWidth: number, clientWidth: number) => {
      const atLeft = scrollLeft <= 5;
      const atRight = scrollLeft >= scrollWidth - clientWidth - 5;
      setIsAtLeftBoundary(atLeft);
      setIsAtRightBoundary(atRight);
    },
    [],
  );

  useEffect(() => {
    // フィルター条件の変更時に状態をリセットして最初のページを取得
    setCurrentPage(1);
    setHasMore(true);
    fetchItems(1);
  }, [category, sellerId, salesStatus, token, fetchItems]);

  // アイテム更新時に境界状態をチェック
  useEffect(() => {
    if (items.length > 0) {
      // DOM更新後に境界をチェック
      const timer = setTimeout(() => {
        const container = scrollContainerRef.current;
        if (container) {
          // 更新後でスクロール位置が保存されている場合は復元
          if (savedScrollPositionRef.current > 0) {
            container.scrollLeft = savedScrollPositionRef.current;
            savedScrollPositionRef.current = 0; // リセット
          }

          const { scrollLeft, scrollWidth, clientWidth } = container;
          updateBoundaryStates(scrollLeft, scrollWidth, clientWidth);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
    return;
  }, [items, updateBoundaryStates]);

  // 無限スクロール用のIntersection Observer
  useEffect(() => {
    const inlineLoadingElement = loadingRef.current;
    const gridLoadingElement = gridLoadingRef.current;

    // レイアウトに応じて適切な要素を選択
    const targetElement = gridLayout
      ? gridLoadingElement
      : inlineLoadingElement;

    if (!targetElement || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          !isLoading
        ) {
          fetchItems(currentPage + 1, true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      },
    );

    observer.observe(targetElement);

    return () => {
      if (targetElement) {
        observer.unobserve(targetElement);
      }
    };
  }, [hasMore, isLoadingMore, isLoading, currentPage, fetchItems, gridLayout]);

  // Pull-to-Refresh機能（再有効化・安全版）
  const handleRefresh = async () => {
    // 現在のスクロール位置を保存
    const container = scrollContainerRef.current;
    if (container) {
      savedScrollPositionRef.current = container.scrollLeft;
    }

    setIsRefreshing(true);
    setPullDistance(0);
    setIsPulling(false);

    try {
      // ページをリセットして最初から取得
      setCurrentPage(1);
      setHasMore(true);
      await fetchItems(1, false);
    } finally {
      setIsRefreshing(false);

      // 更新完了後、スクロール位置を復元
      setTimeout(() => {
        const container = scrollContainerRef.current;
        if (container) {
          container.scrollLeft = savedScrollPositionRef.current;
          // 境界状態も更新
          const { scrollLeft, scrollWidth, clientWidth } = container;
          updateBoundaryStates(scrollLeft, scrollWidth, clientWidth);
        }
      }, 100);
    }
  };

  // スクロール監視（最適化）
  const handleScroll = useCallback(() => {
    if (!isScrolling) {
      setIsScrolling(true);
    }

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, [isScrolling]);

  // 水平スクロールハンドラー
  const handleHorizontalScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      // 更新中は水平スクロールを無効化
      if (isRefreshing) {
        return;
      }

      const container = e.currentTarget;
      const { scrollLeft, scrollWidth, clientWidth } = container;

      // 境界状態を更新
      updateBoundaryStates(scrollLeft, scrollWidth, clientWidth);

      // 左端でさらに左にスクロールしようとした場合、スクロールを制限
      if (scrollLeft <= 0 && isAtLeftBoundary) {
        container.scrollLeft = 0;
        return;
      }

      // 右端でさらに右にスクロールしようとした場合、スクロールを制限
      if (scrollLeft >= scrollWidth - clientWidth && isAtRightBoundary) {
        container.scrollLeft = scrollWidth - clientWidth;
        return;
      }
    },
    [isAtLeftBoundary, isAtRightBoundary, updateBoundaryStates, isRefreshing],
  );

  // タッチ開始位置を記録（境界制御用）
  const touchStartX = useRef<number>(0);
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      // 更新中はタッチ操作を無効化
      if (isRefreshing) {
        e.preventDefault();
        return;
      }

      touchStartX.current = e.touches[0]?.clientX || 0;

      // 現在の境界状態をチェック
      const container = scrollContainerRef.current;
      if (container) {
        const { scrollLeft, scrollWidth, clientWidth } = container;
        updateBoundaryStates(scrollLeft, scrollWidth, clientWidth);
      }
    },
    [updateBoundaryStates, isRefreshing],
  );

  // タッチ移動時の境界制御
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      // 更新中はすべてのタッチ移動を無効化
      if (isRefreshing) {
        e.preventDefault();
        return;
      }

      const currentX = e.touches[0]?.clientX || 0;
      const deltaX = currentX - touchStartX.current;

      // 左端で右向きスワイプ（左にスクロールしようとする）を制限
      if (isAtLeftBoundary && deltaX > 0) {
        const container = scrollContainerRef.current;
        if (container && container.scrollLeft <= 0) {
          e.preventDefault();
          return;
        }
      }

      // 右端で左向きスワイプ（右にスクロールしようとする）を制限
      if (isAtRightBoundary && deltaX < 0) {
        const container = scrollContainerRef.current;
        if (container) {
          const { scrollLeft, scrollWidth, clientWidth } = container;
          if (scrollLeft >= scrollWidth - clientWidth) {
            e.preventDefault();
            return;
          }
        }
      }
    },
    [isAtLeftBoundary, isAtRightBoundary, isRefreshing],
  );

  // Pull-to-Refresh機能（水平スクロールと両立版）
  const handlePullStart = useCallback((e: React.TouchEvent) => {
    // 縦スクロールコンテナでのみPull-to-Refreshを有効化
    const container = containerRef.current;
    if (!container || (container.scrollTop ?? 0) > 10) {
      setAllowPullToRefresh(false);
      return;
    }

    const touch = e.touches[0];
    if (touch) {
      setStartY(touch.clientY);
      setAllowPullToRefresh(true);
    }
    setIsPulling(false);
    setPullDistance(0);
  }, []);

  const handlePullMove = useCallback(
    (e: React.TouchEvent) => {
      if (!allowPullToRefresh || isRefreshing) return;

      const container = containerRef.current;
      if (!container || (container.scrollTop ?? 0) > 2) {
        return;
      }

      const touch = e.touches[0];
      if (!touch) return;

      const currentY = touch.clientY;
      const deltaY = currentY - startY;

      // 縦方向の下向きの動きのみPull-to-Refreshとして処理
      if (deltaY > 20 && deltaY <= 100) {
        // Pull-to-Refresh中は水平スクロールを完全に禁止
        e.preventDefault();
        setPullDistance(deltaY);
        setIsPulling(true);
      }
    },
    [allowPullToRefresh, isRefreshing, startY],
  );

  const handlePullEnd = useCallback(() => {
    setAllowPullToRefresh(false);

    if (isPulling && pullDistance > 60 && !isRefreshing) {
      handleRefresh();
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  }, [isPulling, pullDistance, isRefreshing, handleRefresh]);

  const handleItemClick = (itemId: string) => {
    router.push(`/fleamarket/item/${itemId}`);
  };

  const formatFavoriteCount = (count: number): string => {
    if (count >= 1000) {
      return `${Math.floor(count / 1000)}k`;
    }
    return count.toString();
  };

  const handleFavoriteToggle = async (
    itemId: string,
    currentFavCount: number,
  ) => {
    if (!token || !session.data?.user?.id) {
      alert('ログインが必要です');
      return;
    }

    if (togglingFavorites.has(itemId)) {
      return; // 既に処理中
    }

    const isFavorited = favoriteItems.has(itemId);
    const newFavCount = isFavorited ? currentFavCount - 1 : currentFavCount + 1;

    // 楽観的UI更新
    setFavoriteItems((prev) => {
      const newSet = new Set(prev);
      if (isFavorited) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });

    setItems((prevItems) =>
      prevItems.map((itemData) =>
        itemData.item.item_id === itemId
          ? { ...itemData, fav_count: newFavCount }
          : itemData,
      ),
    );

    setTogglingFavorites((prev) => new Set(prev).add(itemId));

    try {
      const request = isFavorited
        ? removeFleaMarketFavoriteRequest(token, session.data.user.id, itemId)
        : addFleaMarketFavoriteRequest(token, session.data.user.id, itemId);

      const endpoint = isFavorited
        ? REMOVE_FLEA_MARKET_FAVORITE
        : ADD_FLEA_MARKET_FAVORITE;

      const response = await postToNext<FavoriteActionResponse>(
        endpoint,
        request,
      );

      // 操作成功：他のコンポーネントにお気に入り状態変更を通知
      if (response.type === 'success') {
        notifyFavoriteChange({
          itemId,
          isFavorited: !isFavorited,
          favCount: newFavCount,
        });
      }
    } catch (_error) {
      // エラー時にロールバック
      setFavoriteItems((prev) => {
        const newSet = new Set(prev);
        if (isFavorited) {
          newSet.add(itemId);
        } else {
          newSet.delete(itemId);
        }
        return newSet;
      });

      setItems((prevItems) =>
        prevItems.map((itemData) =>
          itemData.item.item_id === itemId
            ? { ...itemData, fav_count: currentFavCount }
            : itemData,
        ),
      );

      alert('いいねの更新に失敗しました');
    } finally {
      setTogglingFavorites((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // 表示用のアイテム（最大3件）
  const displayItems = items;

  const formatPrice = (price: number) => {
    return price.toLocaleString('ja-JP');
  };

  if (error && items.length === 0) {
    return (
      <div className={styles.inlineContainer}>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button className={styles.retryButton} onClick={() => fetchItems(1)}>
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  if (gridLayout) {
    // グリッドレイアウトの場合
    return (
      <div className={gridStyles.itemsSection}>
        <div
          ref={containerRef}
          onScroll={handleScroll}
          onTouchStart={handlePullStart}
          onTouchMove={handlePullMove}
          onTouchEnd={handlePullEnd}
          style={{
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
            height: '100%',
            touchAction: isPulling ? 'none' : 'pan-y',
            WebkitOverflowScrolling: 'touch',
            transform: 'translate3d(0, 0, 0)',
            contain: 'layout style paint',
            isolation: 'isolate',
            backfaceVisibility: 'hidden',
            perspective: '1000px',
          }}
        >
          <div
            style={{
              transform: `translate3d(0, ${isPulling ? Math.min(pullDistance * 0.6, 60) : 0}px, 0)`,
              transition: isPulling ? 'none' : 'transform 0.3s ease-out',
              backfaceVisibility: 'hidden',
              contain: 'layout style paint',
              willChange: isPulling ? 'transform' : 'auto',
            }}
          >
            {/* Pull-to-Refresh インジケーター */}
            {(isPulling || isRefreshing) && (
              <div
                style={{
                  position: 'fixed',
                  top: `${80 + (isPulling ? Math.min(pullDistance * 0.3, 30) : 0)}px`,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 9999,
                  opacity: isPulling ? Math.min(pullDistance / 60, 1) : 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  pointerEvents: 'none',
                  transition: isPulling ? 'none' : 'all 0.3s ease-out',
                }}
              >
                <div
                  className={styles.spinner}
                  style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #f3f3f3',
                    borderTop: '2px solid #e91e63',
                    borderRadius: '50%',
                    animation:
                      isRefreshing || pullDistance > 60
                        ? 'spin 1s linear infinite'
                        : 'none',
                    transform:
                      isPulling && !isRefreshing
                        ? `rotate(${(pullDistance / 60) * 360}deg)`
                        : 'none',
                  }}
                />
                <span
                  style={{
                    fontSize: '11px',
                    color: '#666',
                    fontWeight: 'bold',
                    zIndex: 1000,
                  }}
                >
                  {isRefreshing
                    ? '更新中...'
                    : pullDistance > 60
                      ? '離して更新'
                      : '引っ張って更新'}
                </span>
              </div>
            )}

            {items.length === 0 && !isLoading ? (
              <div className={gridStyles.noItems}>
                <p>出品商品はありません</p>
              </div>
            ) : (
              <>
                <div className={gridStyles.itemGrid}>
                  {displayItems.map((itemData) => {
                    const isFavorited = favoriteItems.has(
                      itemData.item.item_id,
                    );
                    return (
                      <div
                        key={itemData.item.item_id}
                        className={gridStyles.itemCard}
                      >
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick(itemData.item.item_id);
                          }}
                          className={gridStyles.detailButton}
                        >
                          <div
                            className={gridStyles.itemImageContainer}
                            onClick={() =>
                              handleItemClick(itemData.item.item_id)
                            }
                          >
                            {itemData.item.images &&
                            itemData.item.images.length > 0 ? (
                              <Image
                                src={imageUrlForFleaMarket(
                                  itemData.item.images[0] ?? '',
                                )}
                                alt={itemData.item.title}
                                className={gridStyles.itemImage}
                                width={200}
                                height={200}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const nextElement = e.currentTarget
                                    .nextElementSibling as HTMLElement;
                                  if (nextElement) {
                                    nextElement.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div
                              className={gridStyles.noItemImage}
                              style={{
                                display:
                                  itemData.item.images &&
                                  itemData.item.images.length > 0
                                    ? 'none'
                                    : 'flex',
                              }}
                            >
                              <span>📦</span>
                              <span>画像なし</span>
                            </div>
                            {itemData.item.sales_status === 'sold' && (
                              <div className={gridStyles.soldOutBadge}></div>
                            )}
                          </div>

                          <div className={gridStyles.itemInfo}>
                            <h4
                              className={gridStyles.itemTitle}
                              onClick={() =>
                                handleItemClick(itemData.item.item_id)
                              }
                            >
                              {itemData.item.title || '商品名なし'}
                            </h4>
                            <div className={gridStyles.itemPriceContainer}>
                              <p className={gridStyles.itemPrice}>
                                {formatPrice(itemData.item.price)}
                              </p>
                              <button
                                className={gridStyles.favoriteButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFavoriteToggle(
                                    itemData.item.item_id,
                                    itemData.fav_count || 0,
                                  );
                                }}
                                disabled={togglingFavorites.has(
                                  itemData.item.item_id,
                                )}
                              >
                                <IconHeart
                                  size={25}
                                  fill={isFavorited ? '#ff4d6d' : 'none'}
                                  color={isFavorited ? '#ff4d6d' : '#575757'}
                                />
                                <div className={gridStyles.favoriteCount}>
                                  {formatFavoriteCount(itemData.fav_count || 0)}
                                </div>
                              </button>
                            </div>

                            <div className={gridStyles.itemActions}>
                              {itemData.item.sales_status !== 'sold' ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!token) {
                                      alert('ログインが必要です');
                                      return;
                                    }
                                    router.push(
                                      `/fleamarket/purchase-confirmation/${itemData.item.item_id}`,
                                    );
                                  }}
                                  className={gridStyles.purchaseButton}
                                  disabled={isLoading}
                                >
                                  購入する
                                </button>
                              ) : (
                                <button
                                  className={gridStyles.soldOutButton}
                                  disabled
                                >
                                  売り切れ
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 無限スクロール用のローディング要素 */}
                {hasMore && items.length > 0 && (
                  <div
                    ref={gridLoadingRef}
                    style={{
                      gridColumn: '1 / -1',
                      textAlign: 'center',
                      padding: '20px',
                      minHeight: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isLoadingMore ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#666',
                        }}
                      >
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            border: '2px solid #f3f3f3',
                            borderTop: '2px solid #e91e63',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                          }}
                        ></div>
                        読み込み中...
                      </div>
                    ) : (
                      <div style={{ color: '#999', fontSize: '14px' }}>
                        スクロールして続きを読み込み
                      </div>
                    )}
                  </div>
                )}

                {isLoading && items.length === 0 && (
                  <div className={gridStyles.loading}>
                    <p>読み込み中...</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // インラインレイアウトの場合（デフォルト）
  return (
    <div className={styles.inlineContainer}>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onTouchStart={handlePullStart}
        onTouchMove={handlePullMove}
        onTouchEnd={handlePullEnd}
        style={{
          position: 'relative',
          height: '100%',
          touchAction: isPulling ? 'none' : 'pan-y',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          transform: 'translate3d(0, 0, 0)',
          contain: 'layout style paint',
          isolation: 'isolate',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
        }}
      >
        <div
          style={{
            transform: `translate3d(0, ${isPulling ? Math.min(pullDistance * 0.6, 60) : 0}px, 0)`,
            transition: isPulling ? 'none' : 'transform 0.3s ease-out',
            backfaceVisibility: 'hidden',
            contain: 'layout style paint',
            willChange: isPulling ? 'transform' : 'auto',
          }}
        >
          {/* Pull-to-Refresh インジケーター */}
          {(isPulling || isRefreshing) && (
            <div
              style={{
                position: 'fixed',
                top: `${80 + (isPulling ? Math.min(pullDistance * 0.3, 30) : 0)}px`,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                zIndex: 9999,
                opacity: isPulling ? Math.min(pullDistance / 60, 1) : 1,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                padding: '12px 24px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                pointerEvents: 'none',
                transition: isPulling ? 'none' : 'all 0.3s ease-out',
              }}
            >
              <div
                className={styles.spinner}
                style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #f3f3f3',
                  borderTop: '2px solid #e91e63',
                  borderRadius: '50%',
                  animation:
                    isRefreshing || pullDistance > 60
                      ? 'spin 1s linear infinite'
                      : 'none',
                  transform:
                    isPulling && !isRefreshing
                      ? `rotate(${(pullDistance / 60) * 360}deg)`
                      : 'none',
                }}
              />
              <span
                style={{ fontSize: '11px', color: '#666', fontWeight: 'bold' }}
              >
                {isRefreshing
                  ? '更新中...'
                  : pullDistance > 60
                    ? '離して更新'
                    : '引っ張って更新'}
              </span>
            </div>
          )}

          {items.length === 0 && !isLoading ? (
            <div className={styles.emptyState}>
              <p>出品商品はありません</p>
            </div>
          ) : (
            <>
              <div
                className={`${styles.scrollContainer} ${
                  isAtLeftBoundary ? styles.atLeftBoundary : ''
                } ${isAtRightBoundary ? styles.atRightBoundary : ''} ${
                  isAtLeftBoundary && isAtRightBoundary
                    ? styles.atBothBoundaries
                    : ''
                }`
                  .replace(/\s+/g, ' ')
                  .trim()}
                ref={scrollContainerRef}
                onScroll={handleHorizontalScroll}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                style={{
                  overflowX: isRefreshing ? 'hidden' : 'auto',
                  pointerEvents: isRefreshing ? 'none' : 'auto',
                  userSelect: isRefreshing ? 'none' : 'auto',
                  scrollBehavior: 'auto',
                }}
              >
                <div className={styles.itemList}>
                  {displayItems.map((itemData) => {
                    const isFavorited = favoriteItems.has(
                      itemData.item.item_id,
                    );
                    return (
                      <div
                        key={itemData.item.item_id}
                        className={styles.inlineItemCard}
                        onClick={() => handleItemClick(itemData.item.item_id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className={styles.itemImageWrapper}>
                          {itemData.item.images &&
                          itemData.item.images.length > 0 &&
                          itemData.item.images[0] ? (
                            <Image
                              src={imageUrlForFleaMarket(
                                itemData.item.images[0],
                              )}
                              alt={itemData.item.title}
                              width={120}
                              height={120}
                              className={styles.itemImage}
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <div className={styles.noImage}>
                              <span>No Image</span>
                            </div>
                          )}
                          {itemData.item.sales_status === 'sold' && (
                            <div className={styles.soldOverlay}>
                              <span>SOLD</span>
                            </div>
                          )}
                          {/* いいね数表示 */}
                          <div className={styles.favoriteCount}>
                            <IconHeart size={14} />
                            <span>
                              {formatFavoriteCount(itemData.fav_count || 0)}
                            </span>
                          </div>
                          {/* いいねボタン */}
                          <button
                            className={styles.favoriteButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavoriteToggle(
                                itemData.item.item_id,
                                itemData.fav_count || 0,
                              );
                            }}
                            disabled={togglingFavorites.has(
                              itemData.item.item_id,
                            )}
                          >
                            <IconHeart
                              size={18}
                              fill={isFavorited ? '#ff4d6d' : 'none'}
                              color={isFavorited ? '#ff4d6d' : 'white'}
                            />
                          </button>
                        </div>
                        <div className={styles.itemDetails}>
                          <h4 className={styles.itemTitle}>
                            {itemData.item.title.length > 8
                              ? `${itemData.item.title.slice(0, 8)}...`
                              : itemData.item.title}
                          </h4>
                          <p className={styles.itemPrice}>
                            {formatPrice(itemData.item.price)}pt
                          </p>
                          {itemData.item.sales_status !== 'sold' && (
                            <button
                              className={styles.purchaseButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/fleamarket/purchase-confirmation/${itemData.item.item_id}`,
                                );
                              }}
                            >
                              購入する
                            </button>
                          )}
                          {itemData.item.sales_status === 'sold' && (
                            <div className={styles.soldStatus}>売り切れ</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 無限スクロール用のローディング要素 */}
              {hasMore && items.length > 0 && (
                <div
                  ref={loadingRef}
                  style={{
                    textAlign: 'center',
                    padding: '20px',
                    minHeight: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isLoadingMore ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#666',
                      }}
                    >
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          border: '2px solid #f3f3f3',
                          borderTop: '2px solid #e91e63',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                        }}
                      ></div>
                      読み込み中...
                    </div>
                  ) : (
                    <div style={{ color: '#999', fontSize: '14px' }}>
                      スクロールして続きを読み込み
                    </div>
                  )}
                </div>
              )}

              {isLoading && items.length === 0 && (
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner}></div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FleaMarketItemList;

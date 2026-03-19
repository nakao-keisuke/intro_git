import { create } from 'zustand';

/**
 * プロフィールページ用ストア
 *
 * ProfileImageGallery と ProfileThumbnailGallery 間で
 * 購入済みメディアIDを共有するために使用
 */
type ProfileStore = {
  /** 購入済みメディアIDのセット */
  purchasedMediaIds: Set<string>;

  /** 購入済みメディアIDを追加 */
  addPurchasedMediaId: (mediaId: string) => void;

  /** 購入済みメディアIDを一括設定 */
  setPurchasedMediaIds: (ids: Set<string>) => void;

  /** 購入済みメディアIDをリセット */
  resetPurchasedMediaIds: () => void;

  /** メディアギャラリーの現在のインデックス */
  mediaGalleryImageIndex: number;

  /** メディアギャラリーのインデックスを設定 */
  setMediaGalleryImageIndex: (index: number) => void;
};

export const useProfileStore = create<ProfileStore>((set) => ({
  purchasedMediaIds: new Set<string>(),

  addPurchasedMediaId: (mediaId) =>
    set((state) => ({
      purchasedMediaIds: new Set([...state.purchasedMediaIds, mediaId]),
    })),

  setPurchasedMediaIds: (ids) => set({ purchasedMediaIds: ids }),

  resetPurchasedMediaIds: () => set({ purchasedMediaIds: new Set<string>() }),

  mediaGalleryImageIndex: 0,

  setMediaGalleryImageIndex: (index) => set({ mediaGalleryImageIndex: index }),
}));

import defaultAvatarImg from '../../public/default-avatar.jpeg';

export const DEFAULT_AVATAR_PATH = '/default-avatar.jpeg';
export { defaultAvatarImg };

/**
 * 画像カテゴリ定数
 * STFサーバーへのアップロード時に使用
 */
export const IMAGE_CATEGORIES = {
  /** プロフィール画像 */
  PROFILE: '3',
} as const;

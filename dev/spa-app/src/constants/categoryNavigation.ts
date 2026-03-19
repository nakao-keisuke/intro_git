export type NavItem = {
  href: string;
  label: string;
  labelKey: string;
  activeClass: string;
  hoverClass: string;
  iconName:
    | 'home'
    | 'message'
    | 'clipboard'
    | 'photo'
    | 'shopping-bag'
    | 'crown';
};

export const CATEGORY_NAV_ITEMS: NavItem[] = [
  {
    href: '/girls/all',
    label: 'トップ',
    labelKey: 'top',
    activeClass: 'bg-red-500 text-white',
    hoverClass: 'hover:text-red-500 hover:border-red-500',
    iconName: 'home',
  },
  {
    href: '/conversation',
    label: 'メッセージ',
    labelKey: 'messages',
    activeClass: 'bg-red-500 text-white',
    hoverClass: 'hover:text-red-500 hover:border-red-500',
    iconName: 'message',
  },
  {
    href: '/board',
    label: '掲示板',
    labelKey: 'bulletin',
    activeClass: 'bg-red-500 text-white',
    hoverClass: 'hover:text-red-500 hover:border-red-500',
    iconName: 'clipboard',
  },
  {
    href: '/gallery',
    label: '動画・画像',
    labelKey: 'mediaGallery',
    activeClass: 'bg-red-500 text-white',
    hoverClass: 'hover:text-red-500 hover:border-red-500',
    iconName: 'photo',
  },
  {
    href: '/fleamarket',
    label: 'フリマ',
    labelKey: 'fleamarket',
    activeClass: 'bg-red-500 text-white',
    hoverClass: 'hover:text-red-500 hover:border-red-500',
    iconName: 'shopping-bag',
  },
  {
    href: '/ranking',
    label: 'ランキング',
    labelKey: 'ranking',
    activeClass: 'bg-red-500 text-white',
    hoverClass: 'hover:text-red-500 hover:border-red-500',
    iconName: 'crown',
  },
];

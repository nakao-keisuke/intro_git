export type SettingItemType = {
  labelKey: string;
  action: string;
  link?: string;
  isModal?: boolean;
  modalType?: string;
  itemType?: 'notification' | 'emailNotification';
  isNative?: boolean; // true: ネイティブ専用, false: Web専用
};

export type SettingCategoryType = {
  titleKey: string;
  items: SettingItemType[];
  categoryType?: 'notification';
};

export const SETTING_CATEGORIES: SettingCategoryType[] = [
  {
    titleKey: 'categoryNotification',
    categoryType: 'notification',
    items: [
      {
        labelKey: 'inAppNotification',
        action: 'toggle',
        itemType: 'notification',
      },
      {
        labelKey: 'emailNotification',
        action: 'toggle',
        itemType: 'emailNotification',
      },
    ],
  },
  {
    titleKey: 'categoryAppUsage',
    items: [
      {
        labelKey: 'addToHomeScreen',
        action: 'navigate',
        link: '/setting/iphone',
      },
      {
        labelKey: 'howToPlay',
        action: 'modal',
        isModal: true,
        link: '/tuto',
      },
      {
        labelKey: 'callTroubleshooting',
        action: 'navigate',
        link: '/approach',
      },
    ],
  },
  {
    titleKey: 'categoryAccountSettings',
    items: [
      {
        labelKey: 'emailRegistrationChange',
        action: 'navigate',
        link: '/setting/register-mail',
        isNative: false, // Web専用
      },
      {
        labelKey: 'emailSettings',
        action: 'navigate',
        link: '/setting/native-change-email',
        isNative: true, // ネイティブ専用
      },
      {
        labelKey: 'blockedUsers',
        action: 'navigate',
        link: '/block',
      },
    ],
  },
  {
    titleKey: 'categorySupportInfo',
    items: [
      {
        labelKey: 'news',
        action: 'navigate',
        link: '/news',
      },
      {
        labelKey: 'contactUs',
        action: 'modal',
        isModal: true,
        modalType: 'contact',
      },
      {
        labelKey: 'termsOfService',
        action: 'navigate',
        link: '/tos',
      },
      {
        labelKey: 'privacyPolicy',
        action: 'navigate',
        link: '/privacy',
      },
    ],
  },
  {
    titleKey: 'categoryOther',
    items: [
      {
        labelKey: 'logout',
        action: 'modal',
        isModal: true,
        modalType: 'logout',
      },
      {
        labelKey: 'withdraw',
        action: 'modal',
        isModal: true,
        modalType: 'quit',
      },
    ],
  },
];

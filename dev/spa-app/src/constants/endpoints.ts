// ユーザー情報関連
export const HTTP_GET_MY_USER_INFO = '/api/user/my-info';
export const GET_USER_INFO = '/api/get-user-info';
export const GET_USER_INF_FOR_WEB_WITH_USER_ID = '/api/get-user-inf-for-web';
export const GET_PROFILE_IMAGES = '/api/get-profile-images';
export const UPDATE_USER_INFO = '/api/update-user-info';
export const GET_RECOMMENDED_USERS = '/api/get-recommended-users';
export const HTTP_MORE_MEET_PEOPLE_USERS = '/api/meet-people/more';
export const HTTP_MORE_RECENT_VIDEO_CALL_USERS =
  '/api/recent-video-call-users/more';
export const GET_HOME_DATA = '/api/get-home-data';
export const GET_USER_POINT = '/api/get-user-point';
export const HTTP_GET_MY_POINT = '/api/get-my-point';
export const GET_FAVORITE_ANOTHER_USERS = '/api/get-favorite-another-users';

// 通話・ビデオ関連
export const GET_AGORA_UID = '/api/get-agora-uid';
export const GET_RTM_LOGIN_AUTH = '/api/get-rtm-login-auth';
export const GET_UTAGE_VIDEO_CALL_CHANNELS =
  '/api/get-utage-video-call-channels';
export const HTTP_SEND_CALL_REQUEST = '/api/request/call';
export const HTTP_SEND_ABSENCE_CALL_MESSAGE = '/api/message/send-absence-call';
export const UPDATE_CALL_WAITING = '/api/update-call-waiting';
export const HTTP_UPDATE_CALL_WAITING = '/api/call-waiting/update';
export const CHECK_INCOMING_CALL = '/api/check-incoming-call';
export const ENDED_CALL_NOTIFICATION = '/api/ended-call-notification';

// ポイント決済関連
export const PAY_LIVE_POINT = '/api/pay-live-point';
// export const PAY_VIDEO_CALL_POINT = '/api/pay-video-call-point';
export const PAY_VIDEO_CALL_POINT = '/api/call/pay/video';
export const PAY_VOICE_CALL_POINT = '/api/pay-voice-call-point';
export const PAY_PRESENT_MENU_POINT = '/api/pay-present-menu-point';
export const PAY_LOVENSE_MENU_POINT = '/api/pay-lovense-menu-point';

// メッセージ・チャット関連
export const HTTP_SEND_TEXT_MESSAGE = '/api/message/send-text';
export const HTTP_SEND_STICKER = '/api/message/send-sticker';
export const HTTP_GET_STICKERS = '/api/get-stickers';
export const HTTP_GET_GIFT_STICKERS = '/api/get-gift-stickers';
// 旧エンドポイント(移行完了までの互換性維持のため)
export const SEND_IMAGE_MESSAGE = '/api/send-image-from-web';
export const HTTP_SEND_IMAGE_MESSAGE = '/api/message/send-image';
// 旧エンドポイント(移行完了までの互換性維持のため)
export const SEND_VIDEO_MESSAGE = '/api/send-video-from-web';
export const HTTP_SEND_VIDEO_MESSAGE = '/api/message/send-video';

// App Router API endpoints
export const SEND_IMAGE_MESSAGE_APP = '/api/send-image-from-web';
export const SEND_VIDEO_MESSAGE_APP = '/api/send-video-from-web';
export const GET_UNREAD_COUNT = '/api/get-unread-count';
export const HTTP_GET_CONVERSATION_MORE = '/api/conversation/more';
export const HTTP_CONVERSATION_PREFETCH = '/api/conversation/prefetch'; // 複数タブ一括取得エンドポイント
export const GET_CHAT_HISTORY = '/api/get-chat-history';
export const GET_MORE_CHAT_HISTORY = '/api/get-more-chat-history';
export const HTTP_GET_TEXT = '/api/get-text';
export const GET_LIST_CONVERSATION = '/api/get-list-conversation';
export const HTTP_CONVERSATION_MARK_READ = '/api/conversation/mark-read';
export const DELETE_CONVERSATION = '/api/conversation';

// ギャラリー・メディア関連
export const PURCHASE_IMAGE = '/api/purchase-image';
export const HTTP_PURCHASE_IMAGE = '/api/purchase/image';
// 旧エンドポイント(移行完了までの互換性維持のため)
export const PURCHASE_VIDEO = '/api/purchase-video';
export const HTTP_PURCHASE_VIDEO = '/api/purchase/video';
export const PLAY_AUDIO = '/api/play-audio';
export const HTTP_PURCHASE_AUDIO = '/api/purchase/audio';
export const GET_GALLERY_FAVORITE = '/api/get-gallery-item-favorite-status';
export const GET_GALLERY_ITEMS = '/api/get-gallery-items';
export const GET_UNOPEN_ITEMS = '/api/get-unopened-items';
export const HTTP_GET_VIDEO_RANKING = '/api/get-video-ranking';
export const HTTP_GET_IMAGE_RANKING = '/api/get-image-ranking';
export const GET_VIDEO_RANKING = HTTP_GET_VIDEO_RANKING;
export const GET_IMAGE_RANKING = HTTP_GET_IMAGE_RANKING;
// 互換維持: 旧定数名を新Routeへ向ける
export const SEND_IMAGE_REQUEST = '/api/request/image';
export const GET_UNOPENED_ITEMS = '/api/get-unopened-items';
export const HTTP_SEND_IMAGE_REQUEST = '/api/request/image';
export const HTTP_SEND_VIDEO_REQUEST = '/api/request/video';

// 決済・課金関連
export const GET_PAYMENT_CUSTOMER = '/api/get-payment-customer';
export const HTTP_QUICK_CHARGE = '/api/payment/quick-charge'; // 新規エンドポイント（App Router Route Handler）
export const PAIDY_CAPTURE = '/api/paidy-capture-request';
export const GET_CREDIT_PURCHASE_COURSE_INFO =
  '/api/get-credit-purchase-course-info';
// App Router 側のクレジット購入情報エンドポイント
export const CREDIT_PURCHASE_INFO = '/api/credit-purchase-info';
export const LOG_BEFORE_PURCHASE = '/api/log-before-purchase';
export const SQUARE_PAYMENT = '/api/square-payment';
// 新方式の決済顧客情報エンドポイント（Route Handler）
export const HTTP_PAYMENT_CUSTOMER = '/api/payment/customer';

// ユーザー操作関連
export const HTTP_ADD_FAVORITE = '/api/favorite/add';
export const HTTP_ADD_BOOKMARK = '/api/bookmark/add';
export const HTTP_DELETE_BOOKMARK = '/api/bookmark/delete';
export const HTTP_GET_BOOKMARK_LIST = '/api/bookmark/list';
export const ADD_BLOCK = '/api/add-block';
export const HTTP_ADD_BLOCK = '/api/block/add';
export const HTTP_REMOVE_BLOCK = '/api/block/remove';
export const ADD_REPORT = '/api/add-report';
export const HTTP_ADD_REPORT = '/api/report/add';

// 認証・アカウント関連
export const HTTP_SEND_CONFIRM_EMAIL = '/api/send-confirm-email';
export const HTTP_DEACTIVATE_ACCOUNT = '/api/deactivate-account';
export const HTTP_SEND_PHONE_AUTH_CODE = '/api/auth/send-phone-auth-code';
export const HTTP_RESEND_PHONE_AUTH_CODE = '/api/auth/resend-phone-auth-code';
export const HTTP_VERIFY_PHONE_AUTH_CODE = '/api/auth/verify-phone-auth-code';
export const HTTP_PASSWORD_RESET_REQUEST = '/api/password-reset-request';
export const HTTP_RESET_PASSWORD_FOR_WEB = '/api/reset-pwd-for-web';
export const HTTP_CHANGE_PASSWORD = '/api/change-password';
export const NATIVE_CHANGE_EMAIL = '/api/native/change-email';

// 通知関連
export const HTTP_UPDATE_FCM_TOKEN = '/api/update-fcm-token';
export const GET_NOTIFICATION_SETTINGS = '/api/get-notification-settings';
export const UPDATE_NOTIFICATION_SETTINGS = '/api/update-notification-settings';
export const HTTP_GET_NOTIFICATIONS = '/api/get-notifications';
// 通知許可設定（新API）
export const HTTP_GET_NOTIFICATION_SETTING = '/api/notification-setting/get';
export const HTTP_UPDATE_NOTIFICATION_SETTING =
  '/api/notification-setting/update';

// ボーナス・特典関連
export const GET_PWA_BONUS = '/api/get-pwa-bonus';
export const GET_NOTIFICATION_BONUS = '/api/get-notification-bonus';
export const RECEIVE_MENU_RELEASE_POINTBACK_BONUS =
  '/api/receive-menu-release-pointback-bonus';
export const HTTP_CHECK_MISSION_COMPLETED = '/api/check-mission-completed';
export const CHECK_MISSION_COMPLETED = HTTP_CHECK_MISSION_COMPLETED;

// プレゼント・Lovense関連
export const GET_PRESENT_MENU_LIST = '/api/get-present-menu-list';
export const GET_LOVENSE_MENU_LIST = '/api/get-lovense-menu-list';
export const GET_UNCOMPLETED_LOVENSE_LOG_BY_ROOM =
  '/api/get-uncompleted-lovense-log-by-room';
// App Router版（新規）
export const HTTP_GET_PRESENT_MENU_LIST = '/api/present/menu-list';
export const HTTP_PAY_PRESENT_MENU_POINT = '/api/present/pay';
export const HTTP_GET_LOVENSE_MENU_LIST = '/api/lovense/menu-list';
export const HTTP_PAY_LOVENSE_MENU_POINT = '/api/lovense/pay';
export const HTTP_GET_UNCOMPLETED_LOVENSE_LOG = '/api/lovense/uncompleted-log';
export const HTTP_SEND_LOVENSE_CONTROL_COMMAND =
  '/api/lovense/send-control-command';

// フリーマーケット関連
export const GET_FLEA_MARKET_ITEM_LIST = '/api/get-flea-market-item-list';
export const GET_FLEA_MARKET_ITEM_DETAIL = '/api/get-flea-market-item-detail';
export const ADD_FLEA_MARKET_FAVORITE = '/api/add-flea-market-favorite';
export const REMOVE_FLEA_MARKET_FAVORITE = '/api/remove-flea-market-favorite';
export const GET_FLEA_MARKET_FAVORITE_LIST =
  '/api/get-flea-market-favorite-list';
export const PURCHASE_FLEA_MARKET_ITEM = '/api/purchase-flea-market-item';
export const REGISTER_ADDRESS_FLEA_MARKET = '/api/register-address-flea-market';
export const GET_ADDRESS_FLEA_MARKET = '/api/get-address-flea-market';
export const GET_FLEA_MARKET_TRANSACTION_LIST =
  '/api/get-flea-market-transaction-list';
export const GET_FLEA_MARKET_TRANSACTION_DETAIL =
  '/api/get-flea-market-transaction-detail';
export const UPDATE_FLEA_MARKET_TRANSACTION =
  '/api/update-flea-market-transaction';
export const UPDATE_FLEA_MARKET_SHIPMENT_STATUS =
  '/api/update-flea-market-shipment-status';
export const GET_FLEA_MARKET_SHIPMENTS_DETAIL =
  '/api/get-flea-market-shipments-detail';

// フリマお気に入り関連（新規実装）
export const HTTP_GET_FLEA_MARKET_FAVORITE_LIST =
  '/api/fleamarket/favorite/get-list';
export const HTTP_ADD_FLEA_MARKET_FAVORITE = '/api/fleamarket/favorite/add';
export const HTTP_REMOVE_FLEA_MARKET_FAVORITE =
  '/api/fleamarket/favorite/remove';

// 掲示板関連
export const POST_BOARD_MESSAGE = '/api/post-board-message';
export const GET_BOARD_DATA = '/api/get-board-data';
// 掲示板関連（App Router版）
export const HTTP_GET_BOARD_DATA = '/api/board/get-data';
export const HTTP_POST_BOARD_MESSAGE = '/api/board/post-message';

// ランキング関連
export const GET_RANKING_DATA = '/api/get-ranking-data';

// ライブ・配信関連
export const GET_VIDEO_USERS = '/api/utage-web-get-recommended-live-users';
export const GET_LIVE_USERS = '/api/get-live-users';
export const GET_RECENT_VIDEO_CALL_USERS = '/api/get-recent-video-call-users';
export const GET_UTAGE_WEB_GET_LIVE_CHANNELS =
  '/api/utage-web-get-live-channels';
export const HTTP_GET_ACTIVE_LIVE_RECORDING = '/api/live-recording/active';
export const HTTP_GET_ACTIVE_USERS_FOR_UTAGE_SITEMAP =
  '/api/get-active-users-for-utage-sitemap';

//ミッション
export const HTTP_GET_UTAGE_ONBOARDING_MISSION_PROGRESS =
  '/api/get-utage-onboarding-mission-progress';
export const HTTP_UPDATE_ONBOARDING_MISSION_PROGRESS =
  '/api/update-onboarding-mission-progress';
export const HTTP_GET_ONBOARDING_MISSION_BONUS =
  '/api/get-onboarding-mission-bonus';
export const ADD_PERIOD_POINT_BACK = '/api/add-period-point-back';

// ニュース関連
export const GET_NEWS_DATA = '/api/get-news-data';

// ポーリング統合
export const POLLING = '/api/polling';

// その他
export const UNSEAL_FINGER_PRINT_DATA = '/api/unseal';
export const HTTP_UTAGE_NOT_ENOUGH_POINT = '/api/notification/point-shortage'; // 新規エンドポイント（App Router Route Handler）
export const HTTP_GET_FOOT_PRINT_LIST = '/api/footprint/list';
export const GET_MORE_FOOTPRINTS = '/api/get-more-footprints';
export const POST_USER_REVIEW = '/api/post-user-review';
export const GET_USER_REVIEW_LIST = '/api/get-user-review-list';
// App Router 版レビュー API
export const HTTP_POST_USER_REVIEW = '/api/review/post';
export const HTTP_GET_USER_REVIEW_LIST = '/api/review/list';
export const HTTP_REVIEW_POSTING_ENABLED = '/api/review/posting-enabled';
export const HTTP_GET_VIDEO_CHAT_MESSAGES = '/api/video-chat/messages';
// バッジ関連
export const HTTP_GRANT_BADGE = '/api/badge/grant';
export const HTTP_BADGE_GRANT_STATUS = '/api/badge/grant-status';
export const HTTP_BADGE_PROGRESS = '/api/badge/progress';

// 翻訳関連
export const HTTP_TRANSLATE = '/api/translate';

export const JAMBO_API_ROUTE = {
  BOARD_MESSAGE_LIST: 'get_utage_web_board_message',
  POST_BOARD_MESSAGE: 'post_session_board_message',
  POINT_INFO: 'get_utage_web_point_info',
  MEET_PEOPLE: 'utage_web_get_meet_people_exclude_video_call_channeler',
  LIVE_USERS: 'second_apps_get_live_channels',
  RECENT_VIDEO_CALL_USERS: 'get_recent_video_call_female_users',
  LIST_CONVERSATION: 'list_conversation',
  MARK_READS: 'mark_reads',
  UTAGE_WEB_GET_LIVE_CHANNELS: 'utage_web_get_live_channels',
  GET_CREDIT_PURCHASE_COURSE_INFO: 'get_credit_purchase_course_info',
  GET_USER_INFO: 'get_user_inf',
  GET_USER_INFO_FOR_WEB: 'get_user_inf_for_web',
  UPDATE_USER_INFO: 'upd_user_inf',
  CHANGE_GALLERY_ITEM_FAVORITE_STATUS: 'change_gallery_item_favorite_status',
  GET_UNOPENED_ITEM: 'get_unopened_item',
  GET_PHONE_VERIFICATION_STATUS: 'get_phone_verification_status',
  CHECK_REGISTER_EMAIL_STATUS_FOR_UTAGE_WEB:
    'check_register_email_status_for_utage_web',
  HAS_RECEIVED_PWA_REGISTER_BONUS: 'has_received_pwa_register_bonus',
  GET_UTAGE_ONBOARDING_MISSION_PROGRESS:
    'get_utage_onboarding_mission_progress',
  UPDATE_UTAGE_ONBOARDING_MISSION_PROGRESS:
    'update_utage_onboarding_mission_progress',
  GET_UTAGE_ONBOARDING_MISSION_POINT: 'get_utage_onboarding_mission_point',
  // 決済関連
  ADD_POINT: 'add_point',
  GET_PAYMENT_CUSTOMER: 'get_payment_customer',
  // フリマお気に入り関連
  GET_FLEA_MARKET_FAVORITE_LIST: 'get_flea_market_favorite_list',
  ADD_FLEA_MARKET_FAVORITE: 'add_flea_market_favorite',
  REMOVE_FLEA_MARKET_FAVORITE: 'remove_flea_market_favorite',
  // ブロック・通報関連
  ADD_BLOCK: 'add_blk',
  REMOVE_BLOCK: 'rmv_blk',
  ADD_REPORT: 'rpt',
  SEND_TEXT_MESSAGE: 'send_message_from_web',
  SEND_IMAGE: 'send_image_from_web',
  SEND_VIDEO: 'send_video_from_web',
  SEND_ABSENCE_CALL_MESSAGE: 'utage_web_absence_call_message_notification',
  LOG_CONSUMED_POINT: 'log_utage_web_consumed_point',
  // ライブ録画関連
  GET_ACTIVE_LIVE_RECORDING: 'get_active_live_recording',
  // レビュー投稿可否
  GET_REVIEW_POSTING_ENABLED: 'get_review_posting_enabled',
  // ポーリング関連
  TOTAL_UNREAD: 'total_unread',
  GET_CHAT_HISTORY: 'get_chat_history',
  GET_CHAT_FILE_ARCHIVE: 'get_chat_file_archive',
  GET_OPENED_AUDIO: 'get_opened_audio',
  GET_OPENED_IMAGE: 'get_opened_image',
  GET_OPENED_VIDEO: 'get_opened_video',
  GET_WEB_INCOMING_CALL: 'get_web_incoming_call',
  UTAGE_WEB_POLLING: 'utage_web_polling',
  GET_SPECIFIED_USER_POINT: 'get_specified_user_point',
  GET_NEW_CHAT: 'get_new_chat',
  GET_BOOKMARK_STREAM_INFO: 'get_bookmark_stream_info',
  GET_VIDEO_CHAT_MESSAGES: 'get_video_chat_messages',
  GET_ACTIVE_USERS_FOR_UTAGE_SITEMAP: 'get_active_users_for_utage_sitemap',
  // 通知許可設定関連
  GET_NOTIFICATION_SETTING_FOR_WEB: 'get_noti_setting_for_web',
  UPDATE_NOTIFICATION_SETTING_FOR_WEB: 'upd_noti_setting_for_web',
  // 通知関連
  LIST_NOTIFICATION: 'lst_noti',
  UPDATE_FCM_TOKEN: 'upd_noti_token',
  // ポイント不足通知
  UTAGE_NOT_ENOUGH_POINT: 'utage_not_enough_point',
  // 認証・アカウント管理
  CHANGE_PASSWORD: 'chg_pwd',
  PASSWORD_RESET_REQUEST: 'password_reset_request',
  RESET_PASSWORD_FOR_WEB: 'reset_pwd_for_web',
  SEND_CONFIRM_REGISTER_EMAIL_FOR_UTAGE_WEB:
    'send_confirm_register_email_for_utage_web',
  DEACTIVATE_ACCOUNT: 'de_act',
  SEND_PHONE_AUTH_CODE: 'send_phone_auth_code',
  RESEND_PHONE_AUTH_CODE: 'resend_phone_auth_code',
  VERIFY_PHONE_AUTH_CODE: 'verify_phone_auth_code',
  // 通話許可設定関連
  UPDATE_CALL_WAITING: 'set_call_waiting',
  // ブックマーク関連
  LIST_BOOKMARK: 'list_bookmark',
  ADD_BOOKMARK: 'add_bookmark',
  DELETE_BOOKMARK: 'delete_bookmark',
  // 足跡関連
  GET_FOOT_PRINT_LIST: 'get_footprint_history_for_web',
  // いいね関連
  ADD_FAV: 'add_fav',
  // 通話リクエスト関連
  SEND_CALL_REQUEST_FROM_WEB: 'send_call_request_from_web',
  // 画像・動画リクエスト関連
  SEND_IMAGE_REQUEST: 'send_image_request',
  SEND_VIDEO_REQUEST: 'send_video_request',
  // 通話終了通知
  ENDED_CALL_NOTIFICATION: 'ended_call_notification',
  // レビュー関連
  POST_USER_REVIEW: 'post_user_review',
  GET_USER_REVIEW_LIST: 'get_user_review_list',
  // プレゼント関連
  GET_VIDEO_CHAT_MENU_LIST: 'get_video_chat_menu_list',
  PAY_SECOND_VIDEO_CHAT_MENU_POINT: 'pay_second_video_chat_menu_point',
  // Lovense関連
  GET_LOVENSE_MENU_LIST: 'get_lovense_menu_list',
  PAY_SECOND_LOVENSE_MENU_POINT: 'pay_second_lovense_menu_point',
  GET_UNCOMPLETED_LOVENSE_LOG_BY_ROOM: 'get_uncompleted_lovense_log_by_room',
  SEND_LOVENSE_CONTROL_COMMAND: 'send_lovense_control_command',
  GET_IMAGE_RANKING: 'get_image_ranking',
  GET_VIDEO_RANKING: 'get_video_ranking',
  // バッジ関連
  CHECK_BADGE_GRANT_STATUS: 'check_badge_grant_status',
  GRANT_USER_BADGE: 'grant_user_badge',
  GET_BADGE_PROGRESS: 'get_badge_progress',
  // 翻訳関連
  TRANSLATE: 'translation',
} as const;

export type JamboApiRoute =
  (typeof JAMBO_API_ROUTE)[keyof typeof JAMBO_API_ROUTE];

export const isProtectedPage = (api: JamboApiRoute) => {
  return api === JAMBO_API_ROUTE.BOARD_MESSAGE_LIST;
};

export const getUrlFromApi = (api: JamboApiRoute) => {
  switch (api) {
    case JAMBO_API_ROUTE.BOARD_MESSAGE_LIST:
      return '/base';
    default:
      return '/base';
  }
};

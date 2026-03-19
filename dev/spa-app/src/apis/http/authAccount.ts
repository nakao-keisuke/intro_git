import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';

// ──────────────────────────────────────────
// Client ⇔ Route Handler
// ──────────────────────────────────────────

export type ChangePasswordRequest = {
  oldPassword: string;
  newPassword: string;
};

export type PasswordResetRequest = {
  emailOrPhone: string;
};

export type ResetPasswordForWebRequest = {
  fromUserId: string;
  newPassword: string;
  originalPassword: string;
};

export type SendConfirmEmailRequest = {
  email: string;
  type?: 'register' | 'change';
};

export type DeactivateAccountRequest = {
  comment: string;
};

export type SendPhoneAuthCodeRequest = {
  phoneNumber: string;
};

export type VerifyPhoneAuthCodeRequest = {
  phoneNumber: string;
  authCode: string;
};

// ──────────────────────────────────────────
// Route Handler ⇔ Jambo
// ──────────────────────────────────────────

export type ChangePasswordJamboRequest = {
  api: typeof JAMBO_API_ROUTE.CHANGE_PASSWORD;
  token: string;
  new_pwd: string;
  old_pwd: string;
  original_pwd: string;
  application: 15;
};

export type PasswordResetJamboRequest = {
  api: typeof JAMBO_API_ROUTE.PASSWORD_RESET_REQUEST;
  phone_number?: string;
  email?: string;
  ip: string;
};

export type ResetPasswordForWebJamboRequest = {
  api: typeof JAMBO_API_ROUTE.RESET_PASSWORD_FOR_WEB;
  from_user_id: string;
  new_pwd: string;
  original_pwd: string;
  ip: string;
};

export type SendConfirmEmailJamboRequest = {
  api: typeof JAMBO_API_ROUTE.SEND_CONFIRM_REGISTER_EMAIL_FOR_UTAGE_WEB;
  token: string;
  email: string;
  confirm_email_token: string;
  ip: string;
};

export type DeactivateAccountJamboRequest = {
  api: typeof JAMBO_API_ROUTE.DEACTIVATE_ACCOUNT;
  token: string;
  cmt: string;
  ip: string;
};

export type SendPhoneAuthCodeJamboRequest = {
  api: typeof JAMBO_API_ROUTE.SEND_PHONE_AUTH_CODE;
  phone_number: string;
  ip: string;
};

export type ResendPhoneAuthCodeJamboRequest = {
  api: typeof JAMBO_API_ROUTE.RESEND_PHONE_AUTH_CODE;
  phone_number: string;
  ip: string;
};

export type VerifyPhoneAuthCodeJamboRequest = {
  api: typeof JAMBO_API_ROUTE.VERIFY_PHONE_AUTH_CODE;
  token?: string;
  phone_number: string;
  auth_code: string;
  ip: string;
};

export type AuthAccountJamboResponse = {
  code: number;
  message?: string;
  errorCode?: number;
};

export const createChangePasswordJamboRequest = (
  token: string,
  newPassword: string,
  oldPassword: string,
  originalPassword: string,
): ChangePasswordJamboRequest => ({
  api: JAMBO_API_ROUTE.CHANGE_PASSWORD,
  token,
  new_pwd: newPassword,
  old_pwd: oldPassword,
  original_pwd: originalPassword,
  application: 15,
});

export const createPasswordResetJamboRequest = (
  emailOrPhone: string,
  ip: string,
): PasswordResetJamboRequest => {
  const isEmail = emailOrPhone.includes('@');

  return {
    api: JAMBO_API_ROUTE.PASSWORD_RESET_REQUEST,
    ip,
    ...(isEmail ? { email: emailOrPhone } : { phone_number: emailOrPhone }),
  };
};

export const createResetPasswordForWebJamboRequest = (
  fromUserId: string,
  newPassword: string,
  originalPassword: string,
  ip: string,
): ResetPasswordForWebJamboRequest => ({
  api: JAMBO_API_ROUTE.RESET_PASSWORD_FOR_WEB,
  from_user_id: fromUserId,
  new_pwd: newPassword,
  original_pwd: originalPassword,
  ip,
});

export const createSendConfirmEmailJamboRequest = (
  token: string,
  email: string,
  confirmEmailToken: string,
  ip: string,
): SendConfirmEmailJamboRequest => ({
  api: JAMBO_API_ROUTE.SEND_CONFIRM_REGISTER_EMAIL_FOR_UTAGE_WEB,
  token,
  email,
  confirm_email_token: confirmEmailToken,
  ip,
});

export const createDeactivateAccountJamboRequest = (
  token: string,
  comment: string,
  ip: string,
): DeactivateAccountJamboRequest => ({
  api: JAMBO_API_ROUTE.DEACTIVATE_ACCOUNT,
  token,
  cmt: comment,
  ip,
});

export const createSendPhoneAuthCodeJamboRequest = (
  phoneNumber: string,
  ip: string,
): SendPhoneAuthCodeJamboRequest => ({
  api: JAMBO_API_ROUTE.SEND_PHONE_AUTH_CODE,
  phone_number: phoneNumber,
  ip,
});

export const createResendPhoneAuthCodeJamboRequest = (
  phoneNumber: string,
  ip: string,
): ResendPhoneAuthCodeJamboRequest => ({
  api: JAMBO_API_ROUTE.RESEND_PHONE_AUTH_CODE,
  phone_number: phoneNumber,
  ip,
});

export const createVerifyPhoneAuthCodeJamboRequest = (
  phoneNumber: string,
  authCode: string,
  ip: string,
  token?: string,
): VerifyPhoneAuthCodeJamboRequest => ({
  api: JAMBO_API_ROUTE.VERIFY_PHONE_AUTH_CODE,
  ...(token ? { token } : {}),
  phone_number: phoneNumber,
  auth_code: authCode,
  ip,
});

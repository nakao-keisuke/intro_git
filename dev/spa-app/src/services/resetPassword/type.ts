export type ResetPasswordRequest = {
  fromUserId: string;
  newPassword: string;
  originalPassword: string;
};

export type ResetPasswordAPIResponse = {
  type: 'success' | 'error';
  message?: string;
};

export type VerifyAuthCodeParams = {
  authCode: string;
  userId: string;
};

export type VerifyAuthCodeResult = {
  isVerified: boolean;
  authCode: string;
  userId: string;
  error?: string;
};

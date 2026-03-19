export interface PasswordResetRequest {
  emailOrPhone: string;
}

export interface PasswordResetAPIResponse {
  type: 'success' | 'error';
  message?: string;
}

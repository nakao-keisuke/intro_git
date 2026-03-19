export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
}

export interface ChangePasswordInitialData {
  hasValidSession: boolean;
  userEmail?: string;
}

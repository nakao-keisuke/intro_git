export interface PhoneVerificationStatus {
  isPhoneVerified: boolean;
}

export interface SendPhoneAuthCodeRequest {
  phoneNumber: string;
}

export interface SendPhoneAuthCodeResponse {
  code: number;
}

export interface VerifyPhoneAuthCodeRequest {
  phoneNumber: string;
  authCode: string;
}

export interface VerifyPhoneAuthCodeResponse {
  code: number;
}

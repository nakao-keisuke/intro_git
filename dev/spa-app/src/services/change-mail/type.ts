export interface ChangeMailInitialData {
  emailStatus: 'alreadyRegistered' | 'unconfirmed' | 'notRegistered';
  unconfirmedMail?: string;
}

export interface SendConfirmEmailData {
  email: string;
}

export interface SendConfirmEmailResponse {
  success: boolean;
  message?: string;
}

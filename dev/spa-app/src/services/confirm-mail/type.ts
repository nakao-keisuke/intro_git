export interface ValidateEmailResponse {
  email: string;
  email_status: 'already_registered' | 'unconfirmed';
}

export interface ConfirmMailPageData {
  email: string;
  status: 'already_registered' | 'unconfirmed';
}

export interface ConfirmMailError {
  type: 'error';
  message: string;
}

export type ConfirmMailResult =
  | {
      type: 'success';
      email: string;
      status: 'already_registered' | 'unconfirmed';
    }
  | ConfirmMailError;

import type { APIRequest } from '@/libs/http/type';
import type { ResponseData } from '@/types/NextApi';

export type EmailStatus =
  | 'not_registered'
  | 'unconfirmed'
  | 'already_registered';

export type CheckEmailStatusRequest = APIRequest & {
  token?: string;
};

export type CheckEmailStatusResponse = {
  emailStatus: EmailStatus;
  email: string | undefined;
};

export type SendConfirmEmailRequest = {
  email: string;
};

export type SendConfirmEmailResponse = ResponseData<{}>;

import type { NativeApplicationId } from '@/constants/applicationId';

export type ChangeEmailParams = {
  email: string;
  password: string;
  applicationId: NativeApplicationId;
};

export type ChangeEmailSuccessResponse = {
  readonly type: 'success';
  readonly email: string;
  readonly hashedPassword: string;
};

export type ChangeEmailErrorResponse = {
  readonly type: 'error';
  readonly message: string;
};

export type ChangeEmailResponse =
  | ChangeEmailSuccessResponse
  | ChangeEmailErrorResponse;

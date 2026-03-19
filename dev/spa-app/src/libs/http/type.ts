export interface APIRequest {
  readonly api?: string;
}

export interface APIResponse<T> {
  readonly code: number;
  readonly data?: T;
}

export const Context = {
  CLIENT: 'client',
} as const;

export type Context = (typeof Context)[keyof typeof Context];

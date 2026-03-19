import type { ResponseData } from '@/types/NextApi';

export type UnsealClientRequest = {
  readonly sealedData: string;
};

export type SealedDataType = {
  readonly visitorId: string | undefined;
  readonly isVPN: boolean | undefined;
};

export type UnsealRouteResponse = ResponseData<{
  readonly data: SealedDataType;
}>;

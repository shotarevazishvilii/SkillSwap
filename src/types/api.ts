export type ApiError = {
  code: string;
  message: string;
  statusCode: number;
};

export type ApiSuccess<TData> = {
  data: TData;
  error?: never;
  ok: true;
};

export type ApiFailure = {
  data?: never;
  error: ApiError;
  ok: false;
};

export type ApiResponse<TData> = ApiSuccess<TData> | ApiFailure;

export type ServiceResult<TData = unknown> = Promise<ApiResponse<TData>>;

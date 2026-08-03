// ---------------------------------------------------------------------------
// Shared API Types
// Client-side mirrors of the server-side response shapes from api-response.ts.
// These are used by the API service layer and React Query hooks for type-safe
// data extraction and toast message handling.
// ---------------------------------------------------------------------------

/** Pagination metadata returned by paginated endpoints */
export interface ApiResponseMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Successful API response shape.
 * The `message` field is extracted by mutation hooks to drive toast notifications.
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  meta?: ApiResponseMeta;
}

/**
 * Error API response shape.
 * The `error` field is extracted by mutation/query error handlers for toast display.
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  statusCode: number;
}

/** Union type for all possible API responses */
export type ApiResponseEnvelope<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Typed error class for API errors.
 * Wraps the HTTP status and server error message for downstream consumption.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly serverMessage: string;

  constructor(statusCode: number, serverMessage: string) {
    super(serverMessage);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.serverMessage = serverMessage;
  }
}

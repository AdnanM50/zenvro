import { NextResponse } from 'next/server';

interface ApiResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

interface ApiResponseSuccess<T = unknown> {
  success: true;
  message: string;
  data: T;
  meta?: ApiResponseMeta;
}

interface ApiResponseError {
  success: false;
  error: string;
  statusCode: number;
}

function successResponse<T>(message: string, data: T, status = 200, meta?: ApiResponseMeta): NextResponse {
  const body: ApiResponseSuccess<T> = {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  };
  return NextResponse.json(body, { status });
}

function errorResponse(error: string, status = 500): NextResponse {
  const body: ApiResponseError = {
    success: false,
    error,
    statusCode: status,
  };
  return NextResponse.json(body, { status });
}

export const api = {
  ok: <T>(data: T, message = 'Success') => successResponse(message, data, 200),
  created: <T>(data: T, message = 'Created successfully') => successResponse(message, data, 201),
  paginated: <T>(data: T, meta: ApiResponseMeta, message = 'Success') => successResponse(message, data, 200, meta),

  badRequest: (error = 'Bad request') => errorResponse(error, 400),
  unauthorized: (error = 'Not authenticated') => errorResponse(error, 401),
  forbidden: (error = 'Forbidden') => errorResponse(error, 403),
  notFound: (error = 'Not found') => errorResponse(error, 404),
  conflict: (error = 'Conflict') => errorResponse(error, 409),
  tooMany: (error = 'Too many requests') => errorResponse(error, 429),
  serverError: (error = 'Internal server error') => errorResponse(error, 500),
};

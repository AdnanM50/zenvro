import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api-response';

export function validateAnalyticsParams(request: NextRequest): NextResponse | null {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (startDate && isNaN(Date.parse(startDate))) {
    return api.badRequest('Invalid startDate format');
  }

  if (endDate && isNaN(Date.parse(endDate))) {
    return api.badRequest('Invalid endDate format');
  }

  return null;
}

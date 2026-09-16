import { NextRequest } from 'next/server';
import { requireAdmin } from '@/middlewares';
import { SalesReportModel, SalesReportFilter } from '@/models/sales-report.model';
import { api } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const filter: SalesReportFilter = {
      range: (searchParams.get('range') as SalesReportFilter['range']) || '30days',
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      paymentStatus: searchParams.get('paymentStatus') || 'all',
      paymentMethod: searchParams.get('paymentMethod') || 'all',
    };

    const report = await SalesReportModel.generateReport(filter);

    return api.ok(report, 'Sales report generated successfully');
  } catch (error) {
    console.error('Get sales report error:', error);
    return api.serverError('Failed to generate sales report');
  }
}

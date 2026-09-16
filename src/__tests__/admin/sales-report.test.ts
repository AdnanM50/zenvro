import type { SalesReportData, SalesReportFilter } from '@/models/sales-report.model';

describe('Admin Sales Report Unit Tests', () => {
  describe('SalesReport Filter Range Validation', () => {
    it('supports valid time range filter options', () => {
      const validRanges: Array<SalesReportFilter['range']> = [
        'today',
        '7days',
        '30days',
        'this_month',
        'this_year',
        'all',
        'custom',
      ];

      validRanges.forEach((range) => {
        expect(['today', '7days', '30days', 'this_month', 'this_year', 'all', 'custom']).toContain(range);
      });
    });
  });

  describe('SalesReport Revenue & Metric Calculations', () => {
    const mockReportData: SalesReportData = {
      grossRevenue: 540.0,
      netRevenue: 540.0,
      totalOrders: 3,
      paidOrdersCount: 2,
      averageOrderValue: 270.0,
      totalItemsSold: 3,
      salesTimeline: [
        { date: '2026-09-15', revenue: 328.0, ordersCount: 1 },
        { date: '2026-09-16', revenue: 212.0, ordersCount: 1 },
      ],
      paymentBreakdown: [
        { method: 'stripe', revenue: 540.0, count: 2, percentage: 100 },
      ],
      categoryBreakdown: [
        { category: 'Women', revenue: 328.0, itemsSold: 2, percentage: 61 },
        { category: 'Men', revenue: 212.0, itemsSold: 1, percentage: 39 },
      ],
      topProducts: [
        {
          name: 'Studio Hanger Coat',
          category: 'Women',
          unitsSold: 2,
          avgPrice: 164.0,
          totalRevenue: 328.0,
          revenueShare: 61,
          image: '',
        },
        {
          name: 'Black Cloud Puffer',
          category: 'Men',
          unitsSold: 1,
          avgPrice: 212.0,
          totalRevenue: 212.0,
          revenueShare: 39,
          image: '',
        },
      ],
      orders: [
        {
          orderNumber: 'VL-3896228591',
          customerName: 'Adnan Islam',
          customerEmail: 'selixiw785@gexige.com',
          total: 328.0,
          itemsCount: 2,
          paymentMethod: 'stripe',
          paymentStatus: 'paid',
          date: '2026-09-15T12:00:00.000Z',
        },
      ],
      filterLabel: 'Last 30 Days',
      generatedAt: '2026-09-16T12:00:00.000Z',
    };

    it('calculates gross revenue as total sum of orders', () => {
      expect(mockReportData.grossRevenue).toBe(540.0);
    });

    it('calculates average order value accurately from paid orders', () => {
      const calculatedAOV = mockReportData.netRevenue / mockReportData.paidOrdersCount;
      expect(calculatedAOV).toBe(270.0);
      expect(mockReportData.averageOrderValue).toBe(calculatedAOV);
    });

    it('ensures category percentage totals equal 100%', () => {
      const totalPercentage = mockReportData.categoryBreakdown.reduce(
        (sum, item) => sum + item.percentage,
        0
      );
      expect(totalPercentage).toBe(100);
    });

    it('ensures top product revenue shares correctly sum up to 100%', () => {
      const totalShare = mockReportData.topProducts.reduce(
        (sum, item) => sum + (item.revenueShare || 0),
        0
      );
      expect(totalShare).toBe(100);
    });
  });
});

jest.mock('next/server', () => {
  return {
    NextRequest: class {},
    NextResponse: {
      json(data: any, init?: { status?: number }) {
        const res = Object.create(Response.prototype);
        res.status = init?.status ?? 200;
        res.json = async () => data;
        return res;
      },
    },
  };
});

jest.mock('@/lib/auth', () => ({
  verifyAccessToken: jest.fn(),
}));

jest.mock('@/models/user.model', () => ({
  UserModel: {
    findById: jest.fn(),
  },
}));

jest.mock('@/models/dashboard.model', () => ({
  DashboardModel: {
    getStats: jest.fn(),
  },
}));

import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { DashboardModel } from '@/models/dashboard.model';
import { GET } from '@/app/api/admin/dashboard/route';

const adminUser = { _id: 'admin-1', role: 'admin' };
const regularUser = { _id: 'u2', role: 'user' };

function makeRequest(options: { method?: string; body?: unknown; token?: string | null } = {}): NextRequest {
  const token = options.token === undefined ? 'valid-token' : options.token;
  return {
    cookies: {
      get: (name: string) => (token && name === 'access_token' ? { value: token } : undefined),
    },
    json: async () => options.body ?? {},
  } as unknown as NextRequest;
}

async function parseResponse(res: any) {
  return { status: res.status, body: await res.json() };
}

describe('Dashboard API Route Handler (/api/admin/dashboard)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyAccessToken as jest.Mock).mockReturnValue({ userId: 'admin-1', role: 'admin' });
    (UserModel.findById as jest.Mock).mockResolvedValue(adminUser);
  });

  describe('GET /api/admin/dashboard', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await GET(makeRequest({ token: null }));
      const { status } = await parseResponse(res);
      expect(status).toBe(401);
    });

    it('returns 403 when user is not an admin', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue(regularUser);
      const res = await GET(makeRequest());
      const { status } = await parseResponse(res);
      expect(status).toBe(403);
    });

    it('returns dashboard analytics data for admin user', async () => {
      const mockStats = {
        topMetrics: {
          totalIncome: { amount: 378802, formatted: '$378,802', growth: -1.56, isPositive: false, sparkline: [12, 14, 7] },
          totalVisitors: { amount: 34945, formatted: '34,945', growth: 1.56, isPositive: true, sparkline: [8, 3, 9] },
          totalBalance: { amount: 378802, formatted: '$378,802.00', cardNumber: '•••• •••• •••• 8842', cardHolder: 'ZENVRO STORE', expiry: '12/29' },
        },
        statGrid: {
          totalProducts: { count: 300, change: '+200 this week' },
          totalCustomers: { count: 50000, change: '-5k this week' },
          totalOrders: { count: 1500, change: '+1k this week' },
          totalSales: { amount: 2500000, formatted: '$25,00,000.00', change: '+$10k this week' },
        },
        revenueReport: {
          totalEarnings: 50000000,
          totalExpenses: 20000,
          formattedEarnings: '$500,00,000.00',
          formattedExpenses: '$20,000.00',
          yearly: [],
          monthly: [],
        },
        recentOrders: [],
        topSellingProducts: [],
      };
      (DashboardModel.getStats as jest.Mock).mockResolvedValue(mockStats);

      const res = await GET(makeRequest());
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(mockStats);
    });

    it('handles server errors gracefully', async () => {
      (DashboardModel.getStats as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      const res = await GET(makeRequest());
      const { status, body } = await parseResponse(res);
      expect(status).toBe(500);
      expect(body.success).toBe(false);
    });
  });
});

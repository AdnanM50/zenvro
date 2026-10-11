import { DashboardModel } from '@/models/dashboard.model';

const mockOrdersCollection = {
  countDocuments: jest.fn(),
  find: jest.fn(),
};

const mockProductsCollection = {
  countDocuments: jest.fn(),
  find: jest.fn(),
};

const mockUsersCollection = {
  countDocuments: jest.fn(),
  find: jest.fn(),
};

const mockCategoriesCollection = {
  find: jest.fn(),
};

jest.mock('@/lib/db', () => ({
  getDb: jest.fn().mockResolvedValue({
    collection: (name: string) => {
      if (name === 'orders') return mockOrdersCollection;
      if (name === 'products') return mockProductsCollection;
      if (name === 'users') return mockUsersCollection;
      if (name === 'categories') return mockCategoriesCollection;
      return {};
    },
  }),
}));

describe('DashboardModel.getStats() dynamic aggregations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calculates dynamic metrics properly from database orders, products, and users', async () => {
    mockOrdersCollection.countDocuments.mockResolvedValue(2);
    mockProductsCollection.countDocuments.mockResolvedValue(10);
    mockUsersCollection.countDocuments.mockResolvedValue(5);

    const nowIso = new Date().toISOString();

    const mockOrders = [
      {
        _id: 'ord-1',
        orderNumber: 'VL-892101',
        customerName: 'Alice Johnson',
        userEmail: 'alice@example.com',
        total: 150,
        orderStatus: 'confirmed',
        paymentMethod: 'stripe',
        createdAt: nowIso,
        items: [
          {
            productId: 'p1',
            name: 'Velour Blazer',
            category: 'Apparel',
            price: 150,
            quantity: 1,
            image: 'https://example.com/p1.jpg',
          },
        ],
      },
      {
        _id: 'ord-2',
        orderNumber: 'VL-892102',
        customerName: 'Bob Smith',
        userEmail: 'bob@example.com',
        total: 50,
        orderStatus: 'cancelled',
        paymentMethod: 'paypal',
        createdAt: nowIso,
        items: [
          {
            productId: 'p2',
            name: 'Running Cap',
            category: 'Accessories',
            price: 50,
            quantity: 1,
            image: 'https://example.com/p2.jpg',
          },
        ],
      },
    ];

    const mockProducts = [
      {
        _id: 'p1',
        name: 'Velour Blazer',
        category: 'Apparel',
        salePrice: 150,
        sold: 10,
        createdAt: nowIso,
      },
    ];

    const mockUsers = [
      {
        _id: 'u1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        createdAt: nowIso,
      },
    ];

    const mockCategories = [
      { _id: 'c1', name: 'Apparel' },
      { _id: 'c2', name: 'Accessories' },
    ];

    mockOrdersCollection.find.mockReturnValue({
      sort: () => ({
        limit: () => ({
          toArray: async () => mockOrders,
        }),
        toArray: async () => mockOrders,
      }),
    });

    mockProductsCollection.find.mockReturnValue({
      sort: () => ({
        limit: () => ({
          toArray: async () => mockProducts,
        }),
        toArray: async () => mockProducts,
      }),
    });

    mockUsersCollection.find.mockReturnValue({
      sort: () => ({
        limit: () => ({
          toArray: async () => mockUsers,
        }),
        toArray: async () => mockUsers,
      }),
    });

    mockCategoriesCollection.find.mockReturnValue({
      toArray: async () => mockCategories,
    });

    const stats = await DashboardModel.getStats();

    // Verify Total Income is dynamically summed from orders (150 + 50 = 200)
    expect(stats.topMetrics.totalIncome.amount).toBe(200);
    expect(stats.topMetrics.totalIncome.formatted).toBe('$200');
    expect(stats.topMetrics.totalBalance.amount).toBe(200);

    // Verify stat grid counts
    expect(stats.statGrid.totalOrders.count).toBe(2);
    expect(stats.statGrid.totalProducts.count).toBe(10);
    expect(stats.statGrid.totalCustomers.count).toBe(5);
    expect(stats.statGrid.totalSales.amount).toBe(200);

    // Verify Order breakdown
    expect(stats.orderStatistics.totalOrders).toBe(2);
    expect(stats.orderStatistics.breakdown.delivered.count).toBe(1);
    expect(stats.orderStatistics.breakdown.cancelled.count).toBe(1);

    // Verify Top selling products
    expect(stats.topSellingProducts.length).toBeGreaterThan(0);
    expect(stats.topSellingProducts[0].name).toBe('Velour Blazer');

    // Verify Recent Orders
    expect(stats.recentOrders.length).toBe(2);
    expect(stats.recentOrders[0].customer).toBe('Alice Johnson');

    // Verify Transaction activity
    expect(stats.transactionActivity.length).toBe(2);

    // Verify Categories
    expect(stats.categoryRevenue.categories.length).toBe(2);
  });
});

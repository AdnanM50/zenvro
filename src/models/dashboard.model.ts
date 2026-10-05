import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

export interface DashboardStats {
  topMetrics: {
    totalIncome: {
      amount: number;
      formatted: string;
      growth: number;
      isPositive: boolean;
      sparkline: number[];
    };
    totalVisitors: {
      amount: number;
      formatted: string;
      growth: number;
      isPositive: boolean;
      sparkline: number[];
    };
    totalBalance: {
      amount: number;
      formatted: string;
      cardNumber: string;
      cardHolder: string;
      expiry: string;
    };
  };
  revenueReport: {
    totalEarnings: number;
    totalExpenses: number;
    formattedEarnings: string;
    formattedExpenses: string;
    yearly: Array<{ month: string; earning: number; expense: number }>;
    monthly: Array<{ month: string; earning: number; expense: number }>;
  };
  statGrid: {
    totalProducts: { count: number; change: string };
    totalCustomers: { count: number; change: string };
    totalOrders: { count: number; change: string };
    totalSales: { amount: number; formatted: string; change: string };
  };
  orderStatistics: {
    totalOrders: number;
    growth: number;
    pendingPercentage: number;
    pendingStatusLabel: string;
    breakdown: {
      delivered: { count: number; percentage: number };
      cancelled: { count: number; percentage: number };
      pending: { count: number; percentage: number };
      returned: { count: number; percentage: number };
    };
  };
  salesStatistics: {
    timeframe: string;
    weekly: Array<{ day: string; direct: number; online: number; express: number }>;
  };
  latestPurchases: Array<{
    id: string;
    name: string;
    price: string;
    status: string;
    statusStyle: string;
    avatar: string;
  }>;
  overallStatistics: {
    expenses: { amount: number; formatted: string; change: number };
    newUsers: { count: number; formatted: string; change: number };
    returningUsers: { count: number; formatted: string; change: number };
  };
  recentActivity: Array<{
    id: string;
    time: string;
    user: string;
    action: string;
    dotColor: string;
    ringColor: string;
  }>;
  transactionActivity: Array<{
    id: string;
    name: string;
    date: string;
    amount: string;
    isPositive: boolean;
    initial: string;
  }>;
  categoryRevenue: {
    totalRevenue: number;
    totalCategories: number;
    averageRevenue: number;
    highestCategory: { name: string; amount: number };
    lowestCategory: { name: string; amount: number };
    categories: Array<{ name: string; category: string; revenue: number }>;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customer: string;
    email: string;
    avatar: string;
    product: string;
    quantity: number;
    amount: string;
    status: string;
    statusStyle: string;
    date: string;
  }>;
  topSellingProducts: Array<{
    id: string;
    name: string;
    category: string;
    price: string;
    sales: string;
    image: string;
  }>;
}

export const DashboardModel = {
  async getStats(): Promise<DashboardStats> {
    try {
      const db = await getDb();
      const ordersCol = db.collection('orders');
      const productsCol = db.collection('products');
      const usersCol = db.collection('users');
      const categoriesCol = db.collection('categories');

      // 1. Parallel database queries for actual counts and aggregations
      const [
        totalOrdersCount,
        totalProductsCount,
        totalUsersCount,
        totalCategoriesCount,
        revenueAgg,
        recentOrdersRaw,
        topProductsRaw,
        categoriesRaw,
      ] = await Promise.all([
        ordersCol.countDocuments().catch(() => 0),
        productsCol.countDocuments().catch(() => 0),
        usersCol.countDocuments().catch(() => 0),
        categoriesCol.countDocuments().catch(() => 0),
        ordersCol
          .aggregate([
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$total' },
                avgOrderValue: { $avg: '$total' },
              },
            },
          ])
          .toArray()
          .catch(() => []),
        ordersCol
          .find({})
          .sort({ createdAt: -1 })
          .limit(10)
          .toArray()
          .catch(() => []),
        productsCol
          .find({})
          .sort({ createdAt: -1 })
          .limit(6)
          .toArray()
          .catch(() => []),
        categoriesCol
          .find({})
          .limit(14)
          .toArray()
          .catch(() => []),
      ]);

      const dbRevenue = Number(revenueAgg[0]?.totalRevenue || 0);
      const effectiveIncome = dbRevenue > 0 ? dbRevenue : 378802;
      const effectiveOrdersCount = totalOrdersCount > 0 ? totalOrdersCount : 1500;
      const effectiveProductsCount = totalProductsCount > 0 ? totalProductsCount : 300;
      const effectiveUsersCount = totalUsersCount > 0 ? totalUsersCount : 50000;
      const effectiveCategoriesCount = totalCategoriesCount > 0 ? totalCategoriesCount : 14;

      // Status helper mapping
      const getStatusStyle = (status: string) => {
        const lower = (status || '').toLowerCase();
        if (lower === 'confirmed' || lower === 'delivered' || lower === 'success' || lower === 'paid') {
          return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20';
        }
        if (lower === 'cancelled' || lower === 'failed') {
          return 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-500/20';
        }
        if (lower === 'in progress' || lower === 'processing' || lower === 'shipped') {
          return 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-500/20';
        }
        return 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 border border-pink-500/20';
      };

      // 2. Format Recent Orders
      const recentOrders =
        recentOrdersRaw.length > 0
          ? recentOrdersRaw.map((o: Record<string, any>, idx: number) => {
              const firstItem = o.items?.[0] || {};
              const shippingAddr = o.shippingAddress || {};
              const name = shippingAddr.fullName || o.customerName || `Customer #${(idx + 1).toString().padStart(3, '0')}`;
              const email = o.userEmail || shippingAddr.email || 'customer@velora.com';
              const productName = firstItem.name || (o.items?.length ? `${o.items.length} Items` : 'Fashion Apparel');
              const quantity = o.items?.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0) || 1;
              const dateFormatted = o.createdAt
                ? new Date(o.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
                : 'Today';

              return {
                id: (o._id as ObjectId).toString(),
                orderNumber: o.orderNumber || `VL-${890000 + idx}`,
                customer: name,
                email,
                avatar: `https://images.unsplash.com/photo-${1544005313 + (idx % 5)}?w=100&auto=format&fit=crop&q=80`,
                product: productName,
                quantity,
                amount: `$${Number(o.total || firstItem.price || 49.99).toFixed(2)}`,
                status: o.orderStatus || o.paymentStatus || 'In Progress',
                statusStyle: getStatusStyle(o.orderStatus || o.paymentStatus || 'In Progress'),
                date: dateFormatted,
              };
            })
          : [
              {
                id: '1',
                orderNumber: 'VL-892101',
                customer: 'Elena Smith',
                email: 'elenasmith387@gmail.com',
                avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
                product: 'All-Purpose Cleaner',
                quantity: 3,
                amount: '$9.99',
                status: 'In Progress',
                statusStyle: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-500/20',
                date: '03, Sep 2026',
              },
              {
                id: '2',
                orderNumber: 'VL-892102',
                customer: 'Nelson Gold',
                email: 'noahrussell556@gmail.com',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                product: 'Kitchen Knife Set',
                quantity: 4,
                amount: '$49.99',
                status: 'Pending',
                statusStyle: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 border border-pink-500/20',
                date: '26, Jul 2026',
              },
              {
                id: '3',
                orderNumber: 'VL-892103',
                customer: 'Grace Mitchell',
                email: 'gracemitchell79@gmail.com',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
                product: 'Velvet Throw Blanket',
                quantity: 2,
                amount: '$29.99',
                status: 'Success',
                statusStyle: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20',
                date: '12, May 2026',
              },
              {
                id: '4',
                orderNumber: 'VL-892104',
                customer: 'Spencer Robin',
                email: 'leophillips124@gmail.com',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
                product: 'Aromatherapy Diffuser',
                quantity: 4,
                amount: '$19.99',
                status: 'Success',
                statusStyle: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20',
                date: '15, Aug 2026',
              },
              {
                id: '5',
                orderNumber: 'VL-892105',
                customer: 'Chloe Lewis',
                email: 'chloelewis67@gmail.com',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
                product: 'Insulated Water Bottle',
                quantity: 2,
                amount: '$14.99',
                status: 'Pending',
                statusStyle: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 border border-pink-500/20',
                date: '11, Oct 2026',
              },
            ];

      // 3. Format Top Selling Products
      const topSellingProducts =
        topProductsRaw.length > 0
          ? topProductsRaw.slice(0, 5).map((p: Record<string, any>, idx: number) => ({
              id: (p._id as ObjectId).toString(),
              name: p.name || 'Fashion Product',
              category: typeof p.category === 'string' ? p.category : p.category?.name || 'Apparel',
              price: `$${Number(p.price || 120).toFixed(0)}`,
              sales: `${260 - idx * 35} Sales`,
              image: p.images?.[0]?.url || p.image || 'https://images.unsplash.com/photo-1580481077195-c3a821a58875?w=120&auto=format&fit=crop&q=80',
            }))
          : [
              {
                id: '1',
                name: 'Chair with Cushion',
                category: 'Furniture',
                price: '$124',
                sales: '260 Sales',
                image: 'https://images.unsplash.com/photo-1580481077195-c3a821a58875?w=120&auto=format&fit=crop&q=80',
              },
              {
                id: '2',
                name: 'Hand Bag',
                category: 'Accessories',
                price: '$564',
                sales: '181 Sales',
                image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=120&auto=format&fit=crop&q=80',
              },
              {
                id: '3',
                name: 'Sneakers',
                category: 'Sports',
                price: '$964',
                sales: '134 Sales',
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop&q=80',
              },
              {
                id: '4',
                name: 'Ron Hoodie',
                category: 'Fashion',
                price: '$769',
                sales: '127 Sales',
                image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=120&auto=format&fit=crop&q=80',
              },
              {
                id: '5',
                name: 'Minimalist Desk Lamp',
                category: 'Home Decor',
                price: '$89',
                sales: '114 Sales',
                image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=120&auto=format&fit=crop&q=80',
              },
            ];

      // 4. Format Category Revenue
      const categoryNames = [
        'Electronics',
        'Wearables',
        'Audio',
        'Mobiles',
        'Gaming',
        'Laptops',
        'Cameras',
        'Displays',
        'Smart Home',
        'Storage',
        'Network',
        'Accessories',
        'Cables',
        'Power',
      ];

      const categoryRevenueList = categoriesRaw.length
        ? categoriesRaw.map((cat: Record<string, any>, i: number) => ({
            name: `Store ${String.fromCharCode(65 + (i % 26))}`,
            category: cat.name || categoryNames[i % categoryNames.length],
            revenue: Math.floor(3200 + ((i * 739) % 6500)),
          }))
        : [
            { name: 'Store A', category: 'Electronics', revenue: 4800 },
            { name: 'Store B', category: 'Wearables', revenue: 7200 },
            { name: 'Store C', category: 'Audio', revenue: 4500 },
            { name: 'Store D', category: 'Mobiles', revenue: 8000 },
            { name: 'Store E', category: 'Gaming', revenue: 6500 },
            { name: 'Store F', category: 'Laptops', revenue: 9200 },
            { name: 'Store G', category: 'Cameras', revenue: 6400 },
            { name: 'Store H', category: 'Displays', revenue: 6300 },
            { name: 'Store I', category: 'Smart Home', revenue: 3200 },
            { name: 'Store J', category: 'Storage', revenue: 6500 },
            { name: 'Store K', category: 'Network', revenue: 6500 },
            { name: 'Store W', category: 'Accessories', revenue: 3500 },
            { name: 'Store X', category: 'Cables', revenue: 6600 },
            { name: 'Store Z', category: 'Power', revenue: 6800 },
          ];

      return {
        topMetrics: {
          totalIncome: {
            amount: effectiveIncome,
            formatted: `$${effectiveIncome.toLocaleString()}`,
            growth: -1.56,
            isPositive: false,
            sparkline: [12, 14, 7, 11, 6, 9],
          },
          totalVisitors: {
            amount: 34945,
            formatted: '34,945',
            growth: 1.56,
            isPositive: true,
            sparkline: [8, 3, 9, 5, 9, 7],
          },
          totalBalance: {
            amount: effectiveIncome,
            formatted: `$${effectiveIncome.toLocaleString()}.00`,
            cardNumber: '•••• •••• •••• 8842',
            cardHolder: 'ZENVRO STORE',
            expiry: '12/29',
          },
        },
        revenueReport: {
          totalEarnings: 50000000,
          totalExpenses: 20000,
          formattedEarnings: '$500,00,000.00',
          formattedExpenses: '$20,000.00',
          yearly: [
            { month: 'Jan', earning: 22000, expense: 12000 },
            { month: 'Feb', earning: 18000, expense: 15000 },
            { month: 'Mar', earning: 27000, expense: 16000 },
            { month: 'Apr', earning: 43000, expense: 33000 },
            { month: 'May', earning: 19000, expense: 16000 },
            { month: 'Jun', earning: 25000, expense: 18000 },
            { month: 'Jul', earning: 16000, expense: 13000 },
            { month: 'Aug', earning: 28000, expense: 18000 },
            { month: 'Sep', earning: 47000, expense: 35000 },
            { month: 'Oct', earning: 21000, expense: 16000 },
            { month: 'Nov', earning: 28000, expense: 19000 },
            { month: 'Dec', earning: 24000, expense: 16000 },
          ],
          monthly: [
            { month: 'W1', earning: 32000, expense: 18000 },
            { month: 'W2', earning: 48000, expense: 22000 },
            { month: 'W3', earning: 41000, expense: 29000 },
            { month: 'W4', earning: 54000, expense: 31000 },
          ],
        },
        statGrid: {
          totalProducts: {
            count: effectiveProductsCount,
            change: '+200 this week',
          },
          totalCustomers: {
            count: effectiveUsersCount,
            change: '-5k this week',
          },
          totalOrders: {
            count: effectiveOrdersCount,
            change: '+1k this week',
          },
          totalSales: {
            amount: 2500000,
            formatted: '$25,00,000.00',
            change: '+$10k this week',
          },
        },
        orderStatistics: {
          totalOrders: 3736,
          growth: 0.57,
          pendingPercentage: 87.8,
          pendingStatusLabel: 'Pending',
          breakdown: {
            delivered: { count: 1800, percentage: 48 },
            cancelled: { count: 320, percentage: 8 },
            pending: { count: 3280, percentage: 87.8 },
            returned: { count: 140, percentage: 4 },
          },
        },
        salesStatistics: {
          timeframe: 'Weekly',
          weekly: [
            { day: 'Mon', direct: 50, online: 45, express: 20 },
            { day: 'Tue', direct: 68, online: 42, express: 28 },
            { day: 'Wed', direct: 55, online: 35, express: 18 },
            { day: 'Thu', direct: 72, online: 48, express: 30 },
            { day: 'Fri', direct: 80, online: 60, express: 35 },
            { day: 'Sat', direct: 90, online: 65, express: 40 },
            { day: 'Sun', direct: 70, online: 55, express: 32 },
          ],
        },
        latestPurchases: [
          {
            id: '1',
            name: 'SwiftBuds',
            price: '$39.99',
            status: 'Success',
            statusStyle: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-500/20',
            avatar: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&auto=format&fit=crop&q=80',
          },
          {
            id: '2',
            name: 'CozyCloud Pillow...',
            price: '$19.95',
            status: 'Pending',
            statusStyle: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 border border-pink-500/20',
            avatar: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=100&auto=format&fit=crop&q=80',
          },
          {
            id: '3',
            name: 'AquaGrip Bottle',
            price: '$9.99',
            status: 'Failed',
            statusStyle: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-500/20',
            avatar: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=100&auto=format&fit=crop&q=80',
          },
          {
            id: '4',
            name: 'GlowLite Lamp',
            price: '$24.99',
            status: 'Success',
            statusStyle: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-500/20',
            avatar: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=100&auto=format&fit=crop&q=80',
          },
          {
            id: '5',
            name: 'Bitvitamin',
            price: '$26.45',
            status: 'Success',
            statusStyle: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-500/20',
            avatar: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=100&auto=format&fit=crop&q=80',
          },
          {
            id: '6',
            name: 'FitTrack',
            price: '$49.95',
            status: 'Success',
            statusStyle: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-500/20',
            avatar: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=100&auto=format&fit=crop&q=80',
          },
        ],
        overallStatistics: {
          expenses: { amount: 134032, formatted: '$134,032', change: 0.45 },
          newUsers: { count: 7893, formatted: '7,893', change: 11.05 },
          returningUsers: { count: 3258, formatted: '3,258', change: 1.69 },
        },
        recentActivity: [
          {
            id: '1',
            time: '12 Hrs',
            user: 'John Doe',
            action: 'Updated the product description for Widget X.',
            dotColor: 'bg-[#6366F1]',
            ringColor: 'ring-[#6366F1]/20',
          },
          {
            id: '2',
            time: '4:32pm',
            user: 'Jane Smith',
            action: 'added a new user with username janesmith89.',
            dotColor: 'bg-[#EC4899]',
            ringColor: 'ring-[#EC4899]/20',
          },
          {
            id: '3',
            time: '11:45am',
            user: 'Michael Brown',
            action: 'Changed the status of order #12345 to Shipped.',
            dotColor: 'bg-[#F59E0B]',
            ringColor: 'ring-[#F59E0B]/20',
          },
          {
            id: '4',
            time: '9:27am',
            user: 'Sarah Connor',
            action: 'Processed a refund for Order #9821.',
            dotColor: 'bg-[#10B981]',
            ringColor: 'ring-[#10B981]/20',
          },
        ],
        transactionActivity: [
          {
            id: '1',
            name: 'Stripe',
            date: 'Today 7:18 AM',
            amount: '+$580.00',
            isPositive: true,
            initial: 'S',
          },
          {
            id: '2',
            name: 'Cashback',
            date: '01 Jan, 11:44 AM',
            amount: '+$560.00',
            isPositive: true,
            initial: 'C',
          },
          {
            id: '3',
            name: 'Refund from amazon',
            date: 'Today 7:18 AM',
            amount: '-$60.00',
            isPositive: false,
            initial: 'a',
          },
          {
            id: '4',
            name: 'Refund from amazon',
            date: 'Today 7:18 AM',
            amount: '-$60.00',
            isPositive: false,
            initial: 'a',
          },
          {
            id: '5',
            name: 'Refund from amazon',
            date: 'Today 7:18 AM',
            amount: '-$60.00',
            isPositive: false,
            initial: 'a',
          },
          {
            id: '6',
            name: 'PayPal Checkout',
            date: 'Yesterday 4:20 PM',
            amount: '+$1,280.00',
            isPositive: true,
            initial: 'P',
          },
        ],
        categoryRevenue: {
          totalRevenue: 30000,
          totalCategories: effectiveCategoriesCount,
          averageRevenue: 6000,
          highestCategory: { name: 'Laptops', amount: 9200 },
          lowestCategory: { name: 'Smart Home', amount: 3200 },
          categories: categoryRevenueList,
        },
        recentOrders,
        topSellingProducts,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },
};

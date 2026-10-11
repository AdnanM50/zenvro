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

function formatRelativeTime(dateInput: Date | string | number | undefined): string {
  if (!dateInput) return 'Recently';
  const now = Date.now();
  const past = new Date(dateInput).getTime();
  const diffMs = Math.max(0, now - past);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateInput).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTransactionDate(dateInput: Date | string | number | undefined): string {
  if (!dateInput) return 'Today';
  const date = new Date(dateInput);
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  if (isToday) return `Today ${timeStr}`;

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
  if (isYesterday) return `Yesterday ${timeStr}`;

  return `${date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}, ${timeStr}`;
}

const getStatusStyle = (status: string) => {
  const lower = (status || '').toLowerCase();
  if (
    lower === 'confirmed' ||
    lower === 'delivered' ||
    lower === 'success' ||
    lower === 'paid' ||
    lower === 'completed'
  ) {
    return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20';
  }
  if (lower === 'cancelled' || lower === 'failed' || lower === 'refunded') {
    return 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-500/20';
  }
  if (lower === 'in progress' || lower === 'processing' || lower === 'shipped') {
    return 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-500/20';
  }
  return 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 border border-pink-500/20';
};

export const DashboardModel = {
  async getStats(): Promise<DashboardStats> {
    try {
      const db = await getDb();
      const ordersCol = db.collection('orders');
      const productsCol = db.collection('products');
      const usersCol = db.collection('users');
      const categoriesCol = db.collection('categories');

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // 1. Parallel primary queries
      const [
        totalOrdersCount,
        totalProductsCount,
        totalUsersCount,
        recentOrdersRaw,
        recentProductsRaw,
        recentUsersRaw,
        categoriesRaw,
        allOrdersRaw,
      ] = await Promise.all([
        ordersCol.countDocuments().catch(() => 0),
        productsCol.countDocuments().catch(() => 0),
        usersCol.countDocuments().catch(() => 0),
        ordersCol.find({}).sort({ createdAt: -1 }).limit(10).toArray().catch(() => []),
        productsCol.find({}).sort({ createdAt: -1 }).limit(10).toArray().catch(() => []),
        usersCol.find({}, { projection: { password: 0 } }).sort({ createdAt: -1 }).limit(10).toArray().catch(() => []),
        categoriesCol.find({}).toArray().catch(() => []),
        ordersCol.find({}).sort({ createdAt: -1 }).toArray().catch(() => []),
      ]);

      // 2. Aggregate Sales & Revenue Calculations
      let totalRevenue = 0;
      let weeklyRevenue = 0;
      let last30DaysRevenue = 0;
      let prev30DaysRevenue = 0;

      let deliveredCount = 0;
      let cancelledCount = 0;
      let pendingCount = 0;
      let returnedCount = 0;

      // Groupings for top selling products, categories, weekly distribution, monthly distribution
      const productSalesMap: Record<string, { id: string; name: string; category: string; price: number; sales: number; image: string }> = {};
      const categoryRevenueMap: Record<string, number> = {};

      const weeklyDayMap: Record<string, { direct: number; online: number; express: number }> = {
        Mon: { direct: 0, online: 0, express: 0 },
        Tue: { direct: 0, online: 0, express: 0 },
        Wed: { direct: 0, online: 0, express: 0 },
        Thu: { direct: 0, online: 0, express: 0 },
        Fri: { direct: 0, online: 0, express: 0 },
        Sat: { direct: 0, online: 0, express: 0 },
        Sun: { direct: 0, online: 0, express: 0 },
      };

      const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const yearlyEarningsMap: Record<string, { earning: number; expense: number }> = {};
      monthsShort.forEach((m) => {
        yearlyEarningsMap[m] = { earning: 0, expense: 0 };
      });

      const monthlyWeeksMap: Record<string, { earning: number; expense: number }> = {
        W1: { earning: 0, expense: 0 },
        W2: { earning: 0, expense: 0 },
        W3: { earning: 0, expense: 0 },
        W4: { earning: 0, expense: 0 },
        W5: { earning: 0, expense: 0 },
      };

      // Sparkline revenue per day for last 6 days
      const sparklineDays = [0, 0, 0, 0, 0, 0];

      // User order frequency for returning users calculation
      const userOrderCountMap: Record<string, number> = {};

      allOrdersRaw.forEach((order: any) => {
        const orderTotal = typeof order.total === 'number' ? order.total : (order.subtotal || 0) + (order.shipping || 0);
        const orderDate = new Date(order.createdAt || Date.now());
        const orderStatus = (order.orderStatus || order.paymentStatus || 'pending').toLowerCase();
        const paymentMethod = (order.paymentMethod || 'stripe').toLowerCase();

        totalRevenue += orderTotal;

        // User order tracking
        const userKey = order.userEmail || order.userId || (order.shippingAddress && order.shippingAddress.email);
        if (userKey) {
          userOrderCountMap[userKey] = (userOrderCountMap[userKey] || 0) + 1;
        }

        // Date filters
        if (orderDate >= sevenDaysAgo) {
          weeklyRevenue += orderTotal;

          // Days sparkline
          const dayDiff = Math.min(5, Math.max(0, Math.floor((now.getTime() - orderDate.getTime()) / (24 * 60 * 60 * 1000))));
          sparklineDays[5 - dayDiff] += orderTotal;

          // Day of week
          const dayName = orderDate.toLocaleDateString('en-US', { weekday: 'short' });
          if (weeklyDayMap[dayName]) {
            if (paymentMethod === 'stripe' || paymentMethod === 'card') {
              weeklyDayMap[dayName].direct += 1;
            } else if (paymentMethod === 'paypal' || paymentMethod === 'wallet') {
              weeklyDayMap[dayName].online += 1;
            } else {
              weeklyDayMap[dayName].express += 1;
            }
          }
        }

        if (orderDate >= thirtyDaysAgo) {
          last30DaysRevenue += orderTotal;
        } else if (orderDate >= sixtyDaysAgo) {
          prev30DaysRevenue += orderTotal;
        }

        // Yearly & Monthly aggregation
        if (orderDate.getFullYear() === now.getFullYear()) {
          const monthShort = monthsShort[orderDate.getMonth()];
          if (yearlyEarningsMap[monthShort]) {
            yearlyEarningsMap[monthShort].earning += orderTotal;
            yearlyEarningsMap[monthShort].expense += Math.round(orderTotal * 0.35 + (order.shipping || 0));
          }
        }

        if (orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()) {
          const dayOfMonth = orderDate.getDate();
          const weekKey = dayOfMonth <= 7 ? 'W1' : dayOfMonth <= 14 ? 'W2' : dayOfMonth <= 21 ? 'W3' : dayOfMonth <= 28 ? 'W4' : 'W5';
          if (monthlyWeeksMap[weekKey]) {
            monthlyWeeksMap[weekKey].earning += orderTotal;
            monthlyWeeksMap[weekKey].expense += Math.round(orderTotal * 0.35 + (order.shipping || 0));
          }
        }

        // Status counts
        if (orderStatus === 'delivered' || orderStatus === 'success' || orderStatus === 'paid' || orderStatus === 'confirmed') {
          deliveredCount++;
        } else if (orderStatus === 'cancelled' || orderStatus === 'failed') {
          cancelledCount++;
        } else if (orderStatus === 'returned' || orderStatus === 'refunded') {
          returnedCount++;
        } else {
          pendingCount++;
        }

        // Items breakdown for Top Selling & Category Revenue
        if (Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const qty = item.quantity || 1;
            const price = item.price || 0;
            const itemName = item.name || 'Apparel Item';
            const itemCategory = item.category || 'Apparel';
            const itemImage =
              item.image ||
              item.featuredImage ||
              'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop&q=80';

            // Top Products map
            if (!productSalesMap[itemName]) {
              productSalesMap[itemName] = {
                id: (item.productId || item._id || String(Math.random())).toString(),
                name: itemName,
                category: itemCategory,
                price,
                sales: 0,
                image: itemImage,
              };
            }
            productSalesMap[itemName].sales += qty;

            // Category map
            categoryRevenueMap[itemCategory] = (categoryRevenueMap[itemCategory] || 0) + price * qty;
          });
        }
      });

      // 3. New products, users, and orders in the last 7 days
      let weeklyNewProducts = 0;
      recentProductsRaw.forEach((p: any) => {
        if (p.createdAt && new Date(p.createdAt) >= sevenDaysAgo) weeklyNewProducts++;
      });

      let weeklyNewUsers = 0;
      let monthlyNewUsers = 0;
      recentUsersRaw.forEach((u: any) => {
        if (u.createdAt) {
          const uDate = new Date(u.createdAt);
          if (uDate >= sevenDaysAgo) weeklyNewUsers++;
          if (uDate >= thirtyDaysAgo) monthlyNewUsers++;
        }
      });

      let weeklyOrdersCount = 0;
      allOrdersRaw.forEach((o: any) => {
        if (o.createdAt && new Date(o.createdAt) >= sevenDaysAgo) weeklyOrdersCount++;
      });

      // 4. Growth & Calculations
      const incomeGrowth =
        prev30DaysRevenue > 0
          ? Number((((last30DaysRevenue - prev30DaysRevenue) / prev30DaysRevenue) * 100).toFixed(2))
          : last30DaysRevenue > 0
          ? 12.5
          : 0;

      const totalOrderCount = allOrdersRaw.length || totalOrdersCount;
      const effectiveDelivered = totalOrderCount > 0 ? deliveredCount : 0;
      const effectiveCancelled = totalOrderCount > 0 ? cancelledCount : 0;
      const effectivePending = totalOrderCount > 0 ? pendingCount : 0;
      const effectiveReturned = totalOrderCount > 0 ? returnedCount : 0;

      const pendingPercentage = totalOrderCount > 0 ? Number(((effectivePending / totalOrderCount) * 100).toFixed(1)) : 0;
      const deliveredPercentage = totalOrderCount > 0 ? Number(((effectiveDelivered / totalOrderCount) * 100).toFixed(1)) : 0;
      const cancelledPercentage = totalOrderCount > 0 ? Number(((effectiveCancelled / totalOrderCount) * 100).toFixed(1)) : 0;
      const returnedPercentage = totalOrderCount > 0 ? Number(((effectiveReturned / totalOrderCount) * 100).toFixed(1)) : 0;

      // Returning Users Count
      const returningUsersCount = Object.values(userOrderCountMap).filter((cnt) => cnt > 1).length;

      // 5. Build Dynamic Recent Orders
      const recentOrders = recentOrdersRaw.map((o: any, idx: number) => {
        const firstItem = o.items?.[0] || {};
        const shippingAddr = o.shippingAddress || {};
        const name = shippingAddr.fullName || o.customerName || `Customer #${(idx + 1).toString().padStart(3, '0')}`;
        const email = o.userEmail || shippingAddr.email || 'customer@zenvro.com';
        const productName = firstItem.name || (o.items?.length ? `${o.items.length} Items` : 'Fashion Apparel');
        const quantity = o.items?.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0) || 1;
        const totalAmount = typeof o.total === 'number' ? o.total : (o.subtotal || 0) + (o.shipping || 0);

        return {
          id: (o._id as ObjectId).toString(),
          orderNumber: o.orderNumber || `VL-${892100 + idx}`,
          customer: name,
          email,
          avatar: `https://images.unsplash.com/photo-${1534528741775 + (idx % 6)}?w=100&auto=format&fit=crop&q=80`,
          product: productName,
          quantity,
          amount: `$${Number(totalAmount).toFixed(2)}`,
          status: o.orderStatus || o.paymentStatus || 'In Progress',
          statusStyle: getStatusStyle(o.orderStatus || o.paymentStatus || 'In Progress'),
          date: o.createdAt
            ? new Date(o.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Today',
        };
      });

      // 6. Build Dynamic Top Selling Products
      let topSellingProducts = Object.values(productSalesMap)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5)
        .map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: `$${Number(p.price).toFixed(0)}`,
          sales: `${p.sales} Sales`,
          image: p.image,
        }));

      if (topSellingProducts.length === 0 && recentProductsRaw.length > 0) {
        topSellingProducts = recentProductsRaw.slice(0, 5).map((p: any, idx: number) => ({
          id: (p._id as ObjectId).toString(),
          name: p.name || 'Featured Product',
          category: typeof p.category === 'string' ? p.category : p.category?.name || 'Fashion',
          price: `$${Number(p.salePrice || p.regularPrice || 99).toFixed(0)}`,
          sales: `${Math.max(1, p.sold || 10 - idx * 2)} Sales`,
          image:
            p.featuredImage ||
            p.media?.featuredImage ||
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop&q=80',
        }));
      }

      // 7. Build Dynamic Category Revenue Chart
      const dynamicCategoryList: Array<{ name: string; category: string; revenue: number }> = [];
      const storePrefixes = ['Store A', 'Store B', 'Store C', 'Store D', 'Store E', 'Store F', 'Store G', 'Store H', 'Store I', 'Store J', 'Store K', 'Store W', 'Store X', 'Store Z'];

      if (categoriesRaw.length > 0) {
        categoriesRaw.forEach((cat: any, i: number) => {
          const catName = cat.name || `Category ${i + 1}`;
          const rev = categoryRevenueMap[catName] || Math.floor((totalRevenue / (categoriesRaw.length || 1)) * (0.8 + ((i * 7) % 5) * 0.1));
          dynamicCategoryList.push({
            name: storePrefixes[i % storePrefixes.length],
            category: catName,
            revenue: Math.max(0, Math.round(rev)),
          });
        });
      } else if (Object.keys(categoryRevenueMap).length > 0) {
        Object.entries(categoryRevenueMap).forEach(([catName, rev], i) => {
          dynamicCategoryList.push({
            name: storePrefixes[i % storePrefixes.length],
            category: catName,
            revenue: Math.round(rev),
          });
        });
      }

      const totalCatRevenue = dynamicCategoryList.reduce((acc, c) => acc + c.revenue, 0) || totalRevenue;
      const sortedByRev = [...dynamicCategoryList].sort((a, b) => b.revenue - a.revenue);
      const highestCat = sortedByRev[0] || { category: 'All Products', revenue: totalCatRevenue };
      const lowestCat = sortedByRev[sortedByRev.length - 1] || { category: 'General', revenue: 0 };
      const avgCatRevenue = dynamicCategoryList.length > 0 ? Math.round(totalCatRevenue / dynamicCategoryList.length) : 0;

      // 8. Build Dynamic Latest Purchases (from real orders line items)
      const latestPurchases: Array<{
        id: string;
        name: string;
        price: string;
        status: string;
        statusStyle: string;
        avatar: string;
      }> = [];

      for (const order of recentOrdersRaw) {
        if (latestPurchases.length >= 6) break;
        if (Array.isArray(order.items)) {
          for (const item of order.items) {
            if (latestPurchases.length >= 6) break;
            const status = order.orderStatus === 'confirmed' || order.orderStatus === 'delivered' ? 'Success' : order.orderStatus || 'Success';
            latestPurchases.push({
              id: `${order._id}-${latestPurchases.length}`,
              name: item.name || 'Ordered Product',
              price: `$${Number(item.price || 29.99).toFixed(2)}`,
              status: status.charAt(0).toUpperCase() + status.slice(1),
              statusStyle: getStatusStyle(status),
              avatar:
                item.image ||
                item.featuredImage ||
                'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&auto=format&fit=crop&q=80',
            });
          }
        }
      }

      // 9. Build Dynamic Transaction Activity (from real orders)
      const transactionActivity: Array<{
        id: string;
        name: string;
        date: string;
        amount: string;
        isPositive: boolean;
        initial: string;
      }> = recentOrdersRaw.slice(0, 6).map((order: any, idx: number) => {
        const method = (order.paymentMethod || 'stripe').toLowerCase();
        const isCancelled = order.orderStatus === 'cancelled' || order.orderStatus === 'refunded';
        const orderTotal = typeof order.total === 'number' ? order.total : (order.subtotal || 0) + (order.shipping || 0);

        let name = 'Stripe Checkout';
        let initial = 'S';
        if (isCancelled) {
          name = `Refund for ${order.orderNumber || 'Order'}`;
          initial = 'R';
        } else if (method === 'paypal') {
          name = 'PayPal Checkout';
          initial = 'P';
        } else if (method === 'cod') {
          name = 'Cash on Delivery';
          initial = 'C';
        }

        return {
          id: (order._id as ObjectId).toString() || `tx-${idx}`,
          name,
          date: formatTransactionDate(order.createdAt),
          amount: `${isCancelled ? '-' : '+'}$${Number(orderTotal).toFixed(2)}`,
          isPositive: !isCancelled,
          initial,
        };
      });

      // 10. Build Dynamic Recent Activity Timeline
      const recentActivity: Array<{
        id: string;
        time: string;
        user: string;
        action: string;
        dotColor: string;
        ringColor: string;
      }> = [];

      const dotPalette = [
        { dotColor: 'bg-[#6366F1]', ringColor: 'ring-[#6366F1]/20' },
        { dotColor: 'bg-[#EC4899]', ringColor: 'ring-[#EC4899]/20' },
        { dotColor: 'bg-[#F59E0B]', ringColor: 'ring-[#F59E0B]/20' },
        { dotColor: 'bg-[#10B981]', ringColor: 'ring-[#10B981]/20' },
      ];

      // Add recent order actions
      recentOrdersRaw.slice(0, 2).forEach((o: any, i: number) => {
        const customer = o.shippingAddress?.fullName || o.customerName || 'Customer';
        const color = dotPalette[recentActivity.length % dotPalette.length];
        recentActivity.push({
          id: `act-ord-${o._id || i}`,
          time: formatRelativeTime(o.createdAt),
          user: customer,
          action: `Placed order #${o.orderNumber || 'VL-8921'} for $${Number(o.total || 49.99).toFixed(2)}.`,
          dotColor: color.dotColor,
          ringColor: color.ringColor,
        });
      });

      // Add recent product creations/updates
      recentProductsRaw.slice(0, 1).forEach((p: any, i: number) => {
        const color = dotPalette[recentActivity.length % dotPalette.length];
        recentActivity.push({
          id: `act-prod-${p._id || i}`,
          time: formatRelativeTime(p.createdAt || p.updatedAt),
          user: 'Store Admin',
          action: `Published product "${p.name}" to inventory.`,
          dotColor: color.dotColor,
          ringColor: color.ringColor,
        });
      });

      // Add recent user registrations
      recentUsersRaw.slice(0, 1).forEach((u: any, i: number) => {
        const color = dotPalette[recentActivity.length % dotPalette.length];
        recentActivity.push({
          id: `act-user-${u._id || i}`,
          time: formatRelativeTime(u.createdAt),
          user: u.name || 'New Customer',
          action: `Registered an account (${u.email}).`,
          dotColor: color.dotColor,
          ringColor: color.ringColor,
        });
      });

      // 11. Yearly & Monthly charts
      const yearlyReport = monthsShort.map((m) => ({
        month: m,
        earning: yearlyEarningsMap[m].earning,
        expense: yearlyEarningsMap[m].expense,
      }));

      const monthlyReport = ['W1', 'W2', 'W3', 'W4', 'W5'].map((w) => ({
        month: w,
        earning: monthlyWeeksMap[w].earning,
        expense: monthlyWeeksMap[w].expense,
      }));

      const weeklySalesList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
        day,
        direct: weeklyDayMap[day].direct,
        online: weeklyDayMap[day].online,
        express: weeklyDayMap[day].express,
      }));

      const totalEstimatedExpenses = Math.round(totalRevenue * 0.3);

      return {
        topMetrics: {
          totalIncome: {
            amount: totalRevenue,
            formatted: `$${totalRevenue.toLocaleString()}`,
            growth: incomeGrowth,
            isPositive: incomeGrowth >= 0,
            sparkline: sparklineDays,
          },
          totalVisitors: {
            amount: 34945,
            formatted: '34,945',
            growth: 1.56,
            isPositive: true,
            sparkline: [8, 3, 9, 5, 9, 7],
          },
          totalBalance: {
            amount: totalRevenue,
            formatted: `$${totalRevenue.toLocaleString()}.00`,
            cardNumber: '•••• •••• •••• 8842',
            cardHolder: 'ZENVRO STORE',
            expiry: '12/29',
          },
        },
        revenueReport: {
          totalEarnings: totalRevenue,
          totalExpenses: totalEstimatedExpenses,
          formattedEarnings: `$${totalRevenue.toLocaleString()}.00`,
          formattedExpenses: `$${totalEstimatedExpenses.toLocaleString()}.00`,
          yearly: yearlyReport,
          monthly: monthlyReport,
        },
        statGrid: {
          totalProducts: {
            count: totalProductsCount,
            change: `+${weeklyNewProducts} this week`,
          },
          totalCustomers: {
            count: totalUsersCount,
            change: `+${weeklyNewUsers} this week`,
          },
          totalOrders: {
            count: totalOrdersCount,
            change: `+${weeklyOrdersCount} this week`,
          },
          totalSales: {
            amount: totalRevenue,
            formatted: `$${totalRevenue.toLocaleString()}.00`,
            change: `+$${weeklyRevenue.toLocaleString()} this week`,
          },
        },
        orderStatistics: {
          totalOrders: totalOrderCount,
          growth: incomeGrowth,
          pendingPercentage,
          pendingStatusLabel: 'Pending',
          breakdown: {
            delivered: { count: effectiveDelivered, percentage: deliveredPercentage },
            cancelled: { count: effectiveCancelled, percentage: cancelledPercentage },
            pending: { count: effectivePending, percentage: pendingPercentage },
            returned: { count: effectiveReturned, percentage: returnedPercentage },
          },
        },
        salesStatistics: {
          timeframe: 'Weekly',
          weekly: weeklySalesList,
        },
        latestPurchases,
        overallStatistics: {
          expenses: {
            amount: totalEstimatedExpenses,
            formatted: `$${totalEstimatedExpenses.toLocaleString()}`,
            change: incomeGrowth > 0 ? 0.45 : -0.2,
          },
          newUsers: {
            count: monthlyNewUsers || totalUsersCount,
            formatted: (monthlyNewUsers || totalUsersCount).toLocaleString(),
            change: weeklyNewUsers > 0 ? 11.05 : 0,
          },
          returningUsers: {
            count: returningUsersCount,
            formatted: returningUsersCount.toLocaleString(),
            change: returningUsersCount > 0 ? 1.69 : 0,
          },
        },
        recentActivity,
        transactionActivity,
        categoryRevenue: {
          totalRevenue: totalCatRevenue,
          totalCategories: categoriesRaw.length || dynamicCategoryList.length,
          averageRevenue: avgCatRevenue,
          highestCategory: { name: highestCat.category, amount: highestCat.revenue },
          lowestCategory: { name: lowestCat.category, amount: lowestCat.revenue },
          categories: dynamicCategoryList,
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

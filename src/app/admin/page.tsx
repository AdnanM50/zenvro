"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { useApiGet, createQueryKeys } from "@/hooks";
import { getDashboardStats } from "@/services/dashboard.service";
import type { DashboardStats } from "@/models/dashboard.model";

import TopMetricCards from "@/app/admin/_components/dashboard/TopMetricCards";
import RevenueReportChart from "@/app/admin/_components/dashboard/RevenueReportChart";
import StatGridCards from "@/app/admin/_components/dashboard/StatGridCards";
import OrderStatisticsGauge from "@/app/admin/_components/dashboard/OrderStatisticsGauge";
import SalesStatisticsChart from "@/app/admin/_components/dashboard/SalesStatisticsChart";
import LatestPurchaseProducts from "@/app/admin/_components/dashboard/LatestPurchaseProducts";
import OverallStatisticsWidget from "@/app/admin/_components/dashboard/OverallStatisticsWidget";
import RecentActivityTimeline from "@/app/admin/_components/dashboard/RecentActivityTimeline";
import TransactionActivityList from "@/app/admin/_components/dashboard/TransactionActivityList";
import CategoryRevenueChart from "@/app/admin/_components/dashboard/CategoryRevenueChart";
import RecentOrdersTable from "@/app/admin/_components/dashboard/RecentOrdersTable";
import TopSellingProductsList from "@/app/admin/_components/dashboard/TopSellingProductsList";

const dashboardKeys = createQueryKeys("admin-dashboard");

export default function AdminDashboardPage() {
  const { data: response, isLoading, refetch, isFetching } = useApiGet<DashboardStats>({
    queryKey: dashboardKeys.all,
    queryFn: getDashboardStats,
  });

  const stats = response?.data;

  return (
    <div className="space-y-5 sm:space-y-6 max-w-full pb-8">
      {/* 1. Top KPI Row: Total Income, Total Visitor, ZENVRO Debit Card */}
      <TopMetricCards data={stats?.topMetrics} />

      {/* 2. Middle Section: Revenue Report (Double Bar), 2x2 Quick Stats, Order Statistics (Gauge) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        <div className="lg:col-span-5 flex flex-col">
          <RevenueReportChart data={stats?.revenueReport} />
        </div>
        <div className="lg:col-span-4 flex flex-col">
          <StatGridCards data={stats?.statGrid} />
        </div>
        <div className="lg:col-span-3 flex flex-col">
          <OrderStatisticsGauge data={stats?.orderStatistics} />
        </div>
      </div>

      {/* 3. Performance & Activity Row: Sales Stats (Stacked), Latest Purchase, Overall Stats, Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6 items-stretch">
        <div className="flex flex-col">
          <SalesStatisticsChart data={stats?.salesStatistics} />
        </div>
        <div className="flex flex-col">
          <LatestPurchaseProducts data={stats?.latestPurchases} />
        </div>
        <div className="flex flex-col">
          <OverallStatisticsWidget data={stats?.overallStatistics} />
        </div>
        <div className="flex flex-col">
          <RecentActivityTimeline data={stats?.recentActivity} />
        </div>
      </div>

      {/* 4. Transactions & Category Revenue Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        <div className="lg:col-span-4 flex flex-col">
          <TransactionActivityList data={stats?.transactionActivity} />
        </div>
        <div className="lg:col-span-8 flex flex-col">
          <CategoryRevenueChart data={stats?.categoryRevenue} />
        </div>
      </div>

      {/* 5. Bottom Section: Customer Orders Table & Top-Selling Category */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <RecentOrdersTable data={stats?.recentOrders} />
        </div>
        <div className="lg:col-span-4 flex flex-col">
          <TopSellingProductsList data={stats?.topSellingProducts} />
        </div>
      </div>
    </div>
  );
}

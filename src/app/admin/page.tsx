"use client";

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

export default function AdminDashboardPage() {
  return (
    <div className="space-y-5 sm:space-y-6 max-w-full pb-8">
      {/* 1. Top KPI Row: Total Sales, Total Income, Total Visitor, Today's Sale */}
      <TopMetricCards />

      {/* 2. Middle Section: Revenue Report (Double Bar), 2x2 Quick Stats, Order Statistics (Gauge) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        <div className="lg:col-span-5 flex flex-col">
          <RevenueReportChart />
        </div>
        <div className="lg:col-span-4 flex flex-col">
          <StatGridCards />
        </div>
        <div className="lg:col-span-3 flex flex-col">
          <OrderStatisticsGauge />
        </div>
      </div>

      {/* 3. Performance & Activity Row: Sales Stats (Stacked), Latest Purchase, Overall Stats, Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6 items-stretch">
        <div className="flex flex-col">
          <SalesStatisticsChart />
        </div>
        <div className="flex flex-col">
          <LatestPurchaseProducts />
        </div>
        <div className="flex flex-col">
          <OverallStatisticsWidget />
        </div>
        <div className="flex flex-col">
          <RecentActivityTimeline />
        </div>
      </div>

      {/* 4. Transactions & Category Revenue Performance (Replaces vendor design with top store categories) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        <div className="lg:col-span-4 flex flex-col">
          <TransactionActivityList />
        </div>
        <div className="lg:col-span-8 flex flex-col">
          <CategoryRevenueChart />
        </div>
      </div>

      {/* 5. Bottom Section: Customer Orders Table & Top-Selling Category */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <RecentOrdersTable />
        </div>
        <div className="lg:col-span-4 flex flex-col">
          <TopSellingProductsList />
        </div>
      </div>
    </div>
  );
}

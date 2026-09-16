"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Calendar,
  Filter,
  Download,
  Printer,
  CreditCard,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  FileSpreadsheet,
  ArrowUpRight,
  Sparkles,
  Layers,
  Receipt,
  User,
  Copy,
  Eye,
  FileText,
  Info,
  ChevronRight,
} from "lucide-react";
import type { SalesReportData, SalesReportFilter } from "@/models/sales-report.model";

import RevenueAreaChart from "./_components/RevenueAreaChart";
import PaymentDonutChart from "./_components/PaymentDonutChart";

export default function AdminSalesReportPage() {
  const [report, setReport] = useState<SalesReportData | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [range, setRange] = useState<SalesReportFilter["range"]>("30days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");

  // Detail Modals State
  const [selectedProductDetail, setSelectedProductDetail] = useState<SalesReportData["topProducts"][0] | null>(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<SalesReportData["orders"][0] | null>(null);

  // PDF Print Preview Modal
  const [showPdfModal, setShowPdfModal] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (range) params.append("range", range);
      if (range === "custom" && startDate) params.append("startDate", startDate);
      if (range === "custom" && endDate) params.append("endDate", endDate);
      if (paymentStatus !== "all") params.append("paymentStatus", paymentStatus);
      if (paymentMethod !== "all") params.append("paymentMethod", paymentMethod);

      const res = await fetch(`/api/admin/reports/sales?${params.toString()}`);
      const json = await res.json();

      if (res.ok && json.success) {
        setReport(json.data);
      } else {
        toast.error(json.error || "Failed to generate sales report");
      }
    } catch (err) {
      console.error("Failed to load sales report:", err);
      toast.error("Failed to load sales report");
    } finally {
      setLoading(false);
    }
  }, [range, startDate, endDate, paymentStatus, paymentMethod]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoStr;
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-on-surface">Sales & Revenue Report</h1>
          </div>
          <p className="text-sm text-secondary mt-1">
            Real-time financial performance analytics, order trends, product performance, and official PDF exports.
          </p>
        </div>

        <button
          onClick={() => setShowPdfModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-background hover:bg-primary-fixed hover:text-white rounded-full text-xs font-black uppercase tracking-wider transition shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Download PDF Report
        </button>
      </div>

      {/* Date & Filter Toolbar */}
      <div className="rounded-2xl border border-surface-container bg-surface-container-low p-4 space-y-4 shadow-xs">
        {/* Quick Range Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-secondary uppercase tracking-wider mr-2 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            Time Range:
          </span>
          {[
            { id: "today", label: "Today" },
            { id: "7days", label: "Last 7 Days" },
            { id: "30days", label: "Last 30 Days" },
            { id: "this_month", label: "This Month" },
            { id: "this_year", label: "This Year" },
            { id: "all", label: "All Time" },
            { id: "custom", label: "Custom Range" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setRange(item.id as SalesReportFilter["range"])}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                range === item.id
                  ? "bg-primary text-background shadow-xs"
                  : "bg-background text-on-surface border border-surface-container-high hover:border-primary/50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Custom Date Pickers & Method Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-outline-variant/40">
          {range === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-background border border-surface-container-high text-xs font-bold px-3 py-1.5 rounded-xl outline-none"
              />
              <span className="text-xs text-secondary font-bold">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-background border border-surface-container-high text-xs font-bold px-3 py-1.5 rounded-xl outline-none"
              />
            </div>
          )}

          <div className="flex items-center gap-2 border border-surface-container-high bg-background px-4 py-1.5 rounded-full shadow-xs">
            <Filter className="w-3.5 h-3.5 text-secondary" />
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="bg-transparent text-xs font-bold text-on-surface outline-none cursor-pointer"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid Only</option>
              <option value="pending">Pending Only</option>
              <option value="failed">Failed Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2 border border-surface-container-high bg-background px-4 py-1.5 rounded-full shadow-xs">
            <CreditCard className="w-3.5 h-3.5 text-secondary" />
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="bg-transparent text-xs font-bold text-on-surface outline-none cursor-pointer"
            >
              <option value="all">All Gateways</option>
              <option value="stripe">Stripe</option>
              <option value="cod">Cash on Delivery</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          <span className="text-xs text-secondary font-bold ml-auto">
            Report Scope: <strong className="text-on-surface">{report?.filterLabel || "Selected Period"}</strong>
          </span>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-surface-container bg-surface-container-low p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">Gross Sales</span>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-on-surface mt-3">
            {report ? formatCurrency(report.grossRevenue) : "$0.00"}
          </p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            Total Order Volume
          </span>
        </div>

        <div className="rounded-2xl border border-surface-container bg-surface-container-low p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">Net Paid Revenue</span>
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-on-surface mt-3">
            {report ? formatCurrency(report.netRevenue) : "$0.00"}
          </p>
          <span className="text-[10px] text-indigo-600 font-bold mt-1">
            {report?.paidOrdersCount || 0} Paid Orders
          </span>
        </div>

        <div className="rounded-2xl border border-surface-container bg-surface-container-low p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">Total Orders</span>
            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-on-surface mt-3">{report?.totalOrders || 0}</p>
          <span className="text-[10px] text-secondary font-medium mt-1">Confirmed Checkouts</span>
        </div>

        <div className="rounded-2xl border border-surface-container bg-surface-container-low p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">Average Order (AOV)</span>
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-on-surface mt-3">
            {report ? formatCurrency(report.averageOrderValue) : "$0.00"}
          </p>
          <span className="text-[10px] text-secondary font-medium mt-1">Per Paid Customer</span>
        </div>

        <div className="rounded-2xl border border-surface-container bg-surface-container-low p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">Items Sold</span>
            <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-on-surface mt-3">{report?.totalItemsSold || 0}</p>
          <span className="text-[10px] text-secondary font-medium mt-1">Garment Units</span>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Over Time Area/Line Chart */}
        <div className="lg:col-span-8 rounded-2xl border border-surface-container bg-surface-container-low p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-outline-variant/40 pb-4 mb-4">
            <div>
              <h3 className="font-headline font-black text-lg text-on-surface">Revenue Over Time</h3>
              <p className="text-xs text-secondary">Sales performance breakdown across dates</p>
            </div>
            <Sparkles className="w-5 h-5 text-primary" />
          </div>

          {loading ? (
            <div className="h-56 flex items-center justify-center text-xs font-bold text-secondary">Loading chart...</div>
          ) : (
            <RevenueAreaChart data={report?.salesTimeline || []} />
          )}
        </div>

        {/* Payment Gateway Donut Chart */}
        <div className="lg:col-span-4 rounded-2xl border border-surface-container bg-surface-container-low p-6 shadow-xs flex flex-col justify-between">
          <div className="border-b border-outline-variant/40 pb-4 mb-4">
            <h3 className="font-headline font-black text-lg text-on-surface">Payment Methods</h3>
            <p className="text-xs text-secondary">Revenue distribution by gateway</p>
          </div>

          {loading ? (
            <div className="h-56 flex items-center justify-center text-xs font-bold text-secondary">Loading breakdown...</div>
          ) : (
            <PaymentDonutChart data={report?.paymentBreakdown || []} />
          )}
        </div>
      </div>

      {/* Sales by Category & Top Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Sales Breakdown Card */}
        <div className="lg:col-span-4 rounded-2xl border border-surface-container bg-surface-container-low p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-outline-variant/40 pb-4 mb-4">
            <div>
              <h3 className="font-headline font-black text-lg text-on-surface">Category Sales</h3>
              <p className="text-xs text-secondary">Revenue share by garment category</p>
            </div>
            <Layers className="w-5 h-5 text-primary" />
          </div>

          <div className="space-y-4">
            {report?.categoryBreakdown && report.categoryBreakdown.length > 0 ? (
              report.categoryBreakdown.map((item) => (
                <div key={item.category} className="space-y-2 p-3 rounded-xl bg-surface border border-surface-container-high">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-on-surface">{item.category}</span>
                    <span className="font-black text-on-surface">{formatCurrency(item.revenue)}</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-secondary">
                    <span>{item.itemsSold} units sold</span>
                    <span className="font-bold text-primary">{item.percentage}% Revenue</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-secondary py-8 text-center font-medium">No category breakdown data.</div>
            )}
          </div>
        </div>

        {/* Top Performing Products Table */}
        <div className="lg:col-span-8 rounded-2xl border border-surface-container bg-surface-container-low overflow-hidden shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-outline-variant/60 flex items-center justify-between">
              <div>
                <h3 className="font-headline font-black text-lg text-on-surface">Top Performing Products</h3>
                <p className="text-xs text-secondary">Garments generating the highest volume and revenue share</p>
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                {report?.topProducts.length || 0} Products Ranked
              </span>
            </div>

            <div className="max-h-[360px] overflow-y-auto overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-surface-container-lowest shadow-xs">
                  <tr className="border-b border-outline-variant text-[11px] font-black uppercase tracking-wider text-secondary">
                    <th className="py-3.5 px-5">Rank & Product</th>
                    <th className="py-3.5 px-5">Category</th>
                    <th className="py-3.5 px-5">Avg Price</th>
                    <th className="py-3.5 px-5">Units Sold</th>
                    <th className="py-3.5 px-5">Revenue Share</th>
                    <th className="py-3.5 px-5 text-right">Total Revenue</th>
                    <th className="py-3.5 px-5 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/60 text-sm">
                  {report?.topProducts.map((prod, idx) => (
                    <tr key={prod.name} className="hover:bg-surface-container-high/30 transition">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-surface-container-high text-xs font-black flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          {prod.image ? (
                            <img src={prod.image} alt={prod.name} className="w-9 h-9 object-cover rounded-lg shrink-0 border border-surface-container-high" />
                          ) : (
                            <div className="w-9 h-9 bg-surface-container-high rounded-lg flex items-center justify-center font-bold text-xs">
                              VL
                            </div>
                          )}
                          <span className="font-bold text-on-surface">{prod.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-secondary font-medium">{prod.category || "Apparel"}</td>
                      <td className="py-3.5 px-5 text-xs font-bold text-on-surface">{formatCurrency(prod.avgPrice || 0)}</td>
                      <td className="py-3.5 px-5 font-bold text-on-surface">{prod.unitsSold} units</td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${prod.revenueShare || 0}%` }} />
                          </div>
                          <span className="text-[11px] font-bold text-secondary">{prod.revenueShare || 0}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-black text-on-surface text-right">{formatCurrency(prod.totalRevenue)}</td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => setSelectedProductDetail(prod)}
                          title="View Detailed Product Analytics"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition text-xs font-bold cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Sales Transactions Log */}
      <div className="rounded-2xl border border-surface-container bg-surface-container-low overflow-hidden shadow-xs">
        <div className="p-5 border-b border-outline-variant/60 flex items-center justify-between">
          <div>
            <h3 className="font-headline font-black text-lg text-on-surface">Detailed Sales Transactions Log</h3>
            <p className="text-xs text-secondary">Individual order logs captured during this reporting period</p>
          </div>
          <span className="text-xs font-bold text-secondary">
            {report?.orders.length || 0} Transactions
          </span>
        </div>

        <div className="max-h-[380px] overflow-y-auto overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-surface-container-lowest shadow-xs">
              <tr className="border-b border-outline-variant text-[11px] font-black uppercase tracking-wider text-secondary">
                <th className="py-3.5 px-5">Order #</th>
                <th className="py-3.5 px-5">Customer</th>
                <th className="py-3.5 px-5">Items</th>
                <th className="py-3.5 px-5">Gateway</th>
                <th className="py-3.5 px-5">Payment Status</th>
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-5 text-right">Order Total</th>
                <th className="py-3.5 px-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60 text-sm">
              {report?.orders.map((ord) => (
                <tr key={ord.orderNumber} className="hover:bg-surface-container-high/30 transition">
                  <td className="py-3.5 px-5">
                    <span className="font-bold text-on-surface font-mono">{ord.orderNumber}</span>
                  </td>
                  <td className="py-3.5 px-5">
                    <div>
                      <p className="font-bold text-on-surface text-xs">{ord.customerName}</p>
                      <p className="text-[11px] text-secondary">{ord.customerEmail}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-xs font-bold text-secondary">{ord.itemsCount} items</td>
                  <td className="py-3.5 px-5 text-xs font-bold uppercase">{ord.paymentMethod}</td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      ord.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-xs text-secondary">{formatDate(ord.date)}</td>
                  <td className="py-3.5 px-5 font-black text-on-surface text-right">{formatCurrency(ord.total)}</td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => setSelectedOrderDetail(ord)}
                      title="View Transaction Detail"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition text-xs font-bold cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Detail</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Performance Detail Modal */}
      {selectedProductDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-surface border border-surface-container-high rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar text-on-surface">
            <div className="flex items-start justify-between border-b border-outline-variant/40 pb-4">
              <div className="flex items-center gap-3">
                {selectedProductDetail.image ? (
                  <img src={selectedProductDetail.image} alt={selectedProductDetail.name} className="w-12 h-12 object-cover rounded-xl border border-surface-container-high" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center font-bold text-sm">
                    VL
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                    Rank #{ (report?.topProducts.findIndex(p => p.name === selectedProductDetail.name) ?? 0) + 1 }
                  </span>
                  <h3 className="font-headline font-black text-lg text-on-surface mt-1">{selectedProductDetail.name}</h3>
                  <p className="text-xs text-secondary">{selectedProductDetail.category || "Apparel Category"}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProductDetail(null)}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-secondary hover:text-on-surface hover:bg-surface-container-highest transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Metrics breakdown grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container">
                <p className="text-[10px] font-bold uppercase text-secondary">Units Sold</p>
                <p className="text-xl font-black text-on-surface mt-1">{selectedProductDetail.unitsSold} Units</p>
                <span className="text-[10px] text-emerald-600 font-bold">High Demand</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container">
                <p className="text-[10px] font-bold uppercase text-secondary">Avg Unit Price</p>
                <p className="text-xl font-black text-on-surface mt-1">{formatCurrency(selectedProductDetail.avgPrice || 0)}</p>
                <span className="text-[10px] text-secondary">Standard Retail</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container">
                <p className="text-[10px] font-bold uppercase text-secondary">Total Revenue</p>
                <p className="text-xl font-black text-on-surface mt-1">{formatCurrency(selectedProductDetail.totalRevenue)}</p>
                <span className="text-[10px] text-primary font-bold">{selectedProductDetail.revenueShare || 0}% of Total</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container">
                <p className="text-[10px] font-bold uppercase text-secondary">Revenue Share</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${selectedProductDetail.revenueShare || 0}%` }} />
                  </div>
                  <span className="text-xs font-black">{selectedProductDetail.revenueShare || 0}%</span>
                </div>
              </div>
            </div>

            {/* Product Summary Note */}
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <Sparkles className="w-4 h-4" />
                <span>Product Sales Insights</span>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                This garment is currently ranked among the top performers in the store during the <strong>{report?.filterLabel}</strong> period.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedProductDetail(null)}
                className="px-5 py-2.5 rounded-full bg-primary text-background font-bold text-xs hover:bg-primary-fixed hover:text-white transition cursor-pointer"
              >
                Close Analytics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-surface border border-surface-container-high rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar text-on-surface">
            <div className="flex items-start justify-between border-b border-outline-variant/40 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-primary" />
                  <h3 className="font-mono font-black text-lg text-on-surface">{selectedOrderDetail.orderNumber}</h3>
                  <button
                    onClick={() => copyToClipboard(selectedOrderDetail.orderNumber, "Order number")}
                    className="p-1 hover:bg-surface-container-high rounded-md transition text-secondary hover:text-on-surface cursor-pointer"
                    title="Copy Order ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-secondary mt-0.5">Placed on {formatDate(selectedOrderDetail.date)}</p>
              </div>
              <button
                onClick={() => setSelectedOrderDetail(null)}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-secondary hover:text-on-surface hover:bg-surface-container-highest transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Customer Info Card */}
            <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  Customer Details
                </span>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  selectedOrderDetail.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                }`}>
                  {selectedOrderDetail.paymentStatus}
                </span>
              </div>
              <p className="text-sm font-black text-on-surface">{selectedOrderDetail.customerName}</p>
              <p className="text-xs text-secondary">{selectedOrderDetail.customerEmail}</p>
            </div>

            {/* Payment Gateway & Items Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container">
                <p className="text-[10px] font-bold uppercase text-secondary">Payment Method</p>
                <p className="text-sm font-black text-on-surface mt-1 uppercase">{selectedOrderDetail.paymentMethod}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container">
                <p className="text-[10px] font-bold uppercase text-secondary">Items Ordered</p>
                <p className="text-sm font-black text-on-surface mt-1">{selectedOrderDetail.itemsCount} Garments</p>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container space-y-2">
              <div className="flex justify-between text-xs text-secondary font-medium">
                <span>Items Subtotal</span>
                <span>{formatCurrency(selectedOrderDetail.total)}</span>
              </div>
              <div className="flex justify-between text-xs text-secondary font-medium">
                <span>Shipping & Taxes</span>
                <span className="text-emerald-600 font-bold">Included</span>
              </div>
              <div className="border-t border-outline-variant/40 pt-2 flex justify-between text-sm font-black text-on-surface">
                <span>Total Paid Amount</span>
                <span className="text-primary">{formatCurrency(selectedOrderDetail.total)}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOrderDetail(null)}
                className="px-5 py-2.5 rounded-full bg-primary text-background font-bold text-xs hover:bg-primary-fixed hover:text-white transition cursor-pointer"
              >
                Close Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Printable Modal */}
      {showPdfModal && report && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-white text-black border border-gray-300 rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Control Bar */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-200 print:hidden">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-black" />
                <h2 className="text-xl font-black">Official Sales Report PDF Preview</h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrintPdf}
                  className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-gray-800 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Content Container */}
            <div ref={printRef} className="pt-6 space-y-6 text-black font-sans">
              <div className="flex items-center justify-between border-b border-black pb-4">
                <div>
                  <h1 className="text-2xl font-black tracking-widest uppercase">VELOUR DIRECT</h1>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">OFFICIAL SALES & REVENUE REPORT</p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-bold">Period: {report.filterLabel}</p>
                  <p className="text-gray-500">Generated: {formatDate(report.generatedAt)}</p>
                </div>
              </div>

              {/* PDF Metrics Table */}
              <div className="grid grid-cols-4 gap-4 p-4 border border-gray-300 rounded-xl bg-gray-50">
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-500">Gross Sales</p>
                  <p className="text-lg font-black">{formatCurrency(report.grossRevenue)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-500">Net Paid Revenue</p>
                  <p className="text-lg font-black">{formatCurrency(report.netRevenue)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-500">Total Orders</p>
                  <p className="text-lg font-black">{report.totalOrders}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-500">Avg Order Value</p>
                  <p className="text-lg font-black">{formatCurrency(report.averageOrderValue)}</p>
                </div>
              </div>

              {/* PDF Top Products */}
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider mb-2 border-b border-gray-300 pb-1">
                  Top Selling Garments
                </h3>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-300 font-bold bg-gray-100">
                      <th className="py-2 px-2">Product Name</th>
                      <th className="py-2 px-2">Category</th>
                      <th className="py-2 px-2">Avg Price</th>
                      <th className="py-2 px-2">Units Sold</th>
                      <th className="py-2 px-2 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.topProducts.map((p) => (
                      <tr key={p.name} className="border-b border-gray-200">
                        <td className="py-2 px-2 font-bold">{p.name}</td>
                        <td className="py-2 px-2 text-gray-600">{p.category}</td>
                        <td className="py-2 px-2">{formatCurrency(p.avgPrice || 0)}</td>
                        <td className="py-2 px-2">{p.unitsSold}</td>
                        <td className="py-2 px-2 text-right font-bold">{formatCurrency(p.totalRevenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PDF Recent Orders Summary */}
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider mb-2 border-b border-gray-300 pb-1">
                  Sales Transactions Log
                </h3>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-300 font-bold bg-gray-100">
                      <th className="py-2 px-2">Order #</th>
                      <th className="py-2 px-2">Customer</th>
                      <th className="py-2 px-2">Gateway</th>
                      <th className="py-2 px-2">Status</th>
                      <th className="py-2 px-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.orders.map((o) => (
                      <tr key={o.orderNumber} className="border-b border-gray-200">
                        <td className="py-2 px-2 font-bold">{o.orderNumber}</td>
                        <td className="py-2 px-2">{o.customerName}</td>
                        <td className="py-2 px-2 uppercase">{o.paymentMethod}</td>
                        <td className="py-2 px-2 uppercase font-bold">{o.paymentStatus}</td>
                        <td className="py-2 px-2 text-right font-bold">{formatCurrency(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

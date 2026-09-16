"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  CreditCard,
  Search,
  RefreshCw,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Eye,
  Filter,
  Copy,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Building2,
  ShieldCheck,
  User,
  MapPin,
  Package,
} from "lucide-react";
import type { PaymentRecord, PaymentStats } from "@/models/payment-history.model";

export default function AdminPaymentHistoryPage() {
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail Modal
  const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);
      if (paymentStatus !== "all") params.append("paymentStatus", paymentStatus);
      if (paymentMethod !== "all") params.append("paymentMethod", paymentMethod);

      const res = await fetch(`/api/admin/payments?${params.toString()}`);
      const json = await res.json();

      if (res.ok && json.success) {
        setRecords(json.data.records || []);
        setStats(json.data.stats || null);
        if (json.data.meta) {
          setTotalPages(json.data.meta.totalPages || 1);
          setTotalCount(json.data.meta.total || 0);
        }
      } else {
        toast.error(json.error || "Failed to load payment history");
      }
    } catch (err) {
      console.error("Failed to fetch payment history:", err);
      toast.error("Failed to fetch payment history");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, paymentStatus, paymentMethod]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleStatusChange = async (id: string, newStatus: PaymentRecord["paymentStatus"]) => {
    try {
      setUpdatingId(id);
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, paymentStatus: newStatus }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success(`Payment status updated to ${newStatus}`);
        fetchPayments();
        if (selectedRecord && selectedRecord.id === id) {
          setSelectedRecord({ ...selectedRecord, paymentStatus: newStatus });
        }
      } else {
        toast.error(json.error || "Failed to update payment status");
      }
    } catch {
      toast.error("Failed to update payment status");
    } finally {
      setUpdatingId(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

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
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  const getStatusBadge = (status: PaymentRecord["paymentStatus"]) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Paid
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <RotateCcw className="w-3.5 h-3.5" />
            Refunded
          </span>
        );
      default:
        return <span className="text-xs font-bold text-gray-500">{status}</span>;
    }
  };

  const getMethodBadge = (method: PaymentRecord["paymentMethod"]) => {
    switch (method) {
      case "stripe":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <CreditCard className="w-3.5 h-3.5" />
            Stripe
          </span>
        );
      case "cod":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Building2 className="w-3.5 h-3.5" />
            Cash on Delivery
          </span>
        );
      case "paypal":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <DollarSign className="w-3.5 h-3.5" />
            PayPal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-gray-500/10 text-gray-600 border border-gray-500/20 uppercase">
            {method}
          </span>
        );
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-black tracking-tight text-on-surface">Payment History</h1>
          </div>
          <p className="text-sm text-secondary mt-1">
            Track transaction records, gateway payments, cash on delivery, and update payment statuses.
          </p>
        </div>
      </div>

      {/* Analytics Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-surface-container bg-surface-container-low p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-secondary">Total Revenue</p>
            <p className="text-2xl font-black text-on-surface mt-0.5">
              {stats ? formatCurrency(stats.totalRevenue) : "$0.00"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-surface-container bg-surface-container-low p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-secondary">Paid Transactions</p>
            <p className="text-2xl font-black text-on-surface mt-0.5">{stats?.paidCount ?? 0}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-surface-container bg-surface-container-low p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-secondary">Pending Payments</p>
            <p className="text-2xl font-black text-on-surface mt-0.5">{stats?.pendingCount ?? 0}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-surface-container bg-surface-container-low p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-secondary">Refunded / Failed</p>
            <p className="text-2xl font-black text-on-surface mt-0.5">
              {(stats?.refundedCount ?? 0) + (stats?.failedCount ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-surface-container bg-surface-container-low p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            placeholder="Search Order #, Customer, Email, Txn ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-11 pr-4 py-2.5 bg-background border border-surface-container-high rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 transition placeholder:text-secondary/70"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 border border-surface-container-high bg-background px-4 py-2 rounded-full shadow-xs">
            <Filter className="w-3.5 h-3.5 text-secondary" />
            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-bold text-on-surface outline-none cursor-pointer"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="flex items-center gap-2 border border-surface-container-high bg-background px-4 py-2 rounded-full shadow-xs">
            <CreditCard className="w-3.5 h-3.5 text-secondary" />
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-bold text-on-surface outline-none cursor-pointer"
            >
              <option value="all">All Payment Methods</option>
              <option value="stripe">Stripe</option>
              <option value="cod">Cash on Delivery</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          {(search || paymentStatus !== "all" || paymentMethod !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setPaymentStatus("all");
                setPaymentMethod("all");
                setPage(1);
              }}
              className="text-xs font-bold text-primary hover:underline px-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Payment Transactions Table */}
      <div className="rounded-2xl border border-outline-variant bg-surface overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low text-[11px] font-black uppercase tracking-wider text-secondary">
                <th className="py-4 px-5">Order / Transaction ID</th>
                <th className="py-4 px-5">Customer</th>
                <th className="py-4 px-5">Amount</th>
                <th className="py-4 px-5">Payment Method</th>
                <th className="py-4 px-5">Payment Status</th>
                <th className="py-4 px-5">Date</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60 text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-5"><div className="h-4 w-28 bg-surface-container-high rounded" /></td>
                    <td className="py-4 px-5"><div className="h-4 w-36 bg-surface-container-high rounded" /></td>
                    <td className="py-4 px-5"><div className="h-4 w-16 bg-surface-container-high rounded" /></td>
                    <td className="py-4 px-5"><div className="h-4 w-20 bg-surface-container-high rounded" /></td>
                    <td className="py-4 px-5"><div className="h-4 w-20 bg-surface-container-high rounded" /></td>
                    <td className="py-4 px-5"><div className="h-4 w-24 bg-surface-container-high rounded" /></td>
                    <td className="py-4 px-5 text-right"><div className="h-4 w-12 bg-surface-container-high rounded ml-auto" /></td>
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-secondary font-medium">
                    No payment transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-surface-container-low/50 transition">
                    <td className="py-4 px-5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-on-surface">{record.orderNumber}</span>
                        <div className="flex items-center gap-1 text-xs text-secondary font-mono">
                          <span className="truncate max-w-[140px]" title={record.transactionId}>
                            {record.transactionId}
                          </span>
                          <button
                            onClick={() => copyToClipboard(record.transactionId, "Transaction ID")}
                            className="hover:text-primary transition"
                            title="Copy Transaction ID"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface">{record.customerName}</span>
                        <span className="text-xs text-secondary">{record.customerEmail}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-black text-on-surface text-base">
                        {formatCurrency(record.amount)}
                      </span>
                    </td>
                    <td className="py-4 px-5">{getMethodBadge(record.paymentMethod)}</td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(record.paymentStatus)}
                        <select
                          disabled={updatingId === record.id}
                          value={record.paymentStatus}
                          onChange={(e) =>
                            handleStatusChange(record.id, e.target.value as PaymentRecord["paymentStatus"])
                          }
                          className="text-xs bg-background border border-outline-variant rounded-lg px-2 py-1 outline-none font-bold text-secondary hover:text-on-surface cursor-pointer disabled:opacity-50"
                          title="Change status"
                        >
                          <option value="paid">Paid</option>
                          <option value="pending">Pending</option>
                          <option value="failed">Failed</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-xs text-secondary font-medium whitespace-nowrap">
                      {formatDate(record.createdAt)}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container hover:bg-primary hover:text-background border border-outline-variant rounded-xl text-xs font-bold transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="border-t border-outline-variant px-5 py-4 flex items-center justify-between">
            <span className="text-xs font-bold text-secondary">
              Showing {records.length} of {totalCount} transactions
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container disabled:opacity-50 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold px-2 text-on-surface">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container disabled:opacity-50 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Receipt Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-surface border border-outline-variant rounded-3xl p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-5 border-b border-outline-variant">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Payment Receipt</p>
                <h2 className="text-2xl font-black text-on-surface mt-0.5">{selectedRecord.orderNumber}</h2>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Payment Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/60">
                <div>
                  <p className="text-[10px] font-bold uppercase text-secondary">Amount Paid</p>
                  <p className="text-lg font-black text-on-surface">{formatCurrency(selectedRecord.amount)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-secondary">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedRecord.paymentStatus)}</div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-secondary">Method</p>
                  <div className="mt-1">{getMethodBadge(selectedRecord.paymentMethod)}</div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-secondary">Date</p>
                  <p className="text-xs font-bold text-on-surface mt-1">{formatDate(selectedRecord.createdAt)}</p>
                </div>
              </div>

              {/* Transaction ID & Copy */}
              <div className="p-4 border border-outline-variant rounded-2xl flex items-center justify-between bg-background">
                <div>
                  <p className="text-xs font-bold text-secondary uppercase">Transaction / Intent ID</p>
                  <p className="text-sm font-mono font-bold text-on-surface mt-0.5">{selectedRecord.transactionId}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(selectedRecord.transactionId, "Transaction ID")}
                  className="p-2 border border-outline-variant rounded-xl hover:bg-surface-container transition text-xs font-bold flex items-center gap-1.5"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>

              {/* Customer & Shipping */}
              <div className="p-4 border border-outline-variant rounded-2xl space-y-3 bg-background">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-primary">
                  <User className="w-4 h-4" />
                  Customer Information
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-secondary font-medium">Name</p>
                    <p className="font-bold text-on-surface">{selectedRecord.shippingAddress.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary font-medium">Email</p>
                    <p className="font-bold text-on-surface">{selectedRecord.shippingAddress.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary font-medium">Address</p>
                    <p className="font-bold text-on-surface">{selectedRecord.shippingAddress.address}, {selectedRecord.shippingAddress.city}</p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary font-medium">Country / Zip</p>
                    <p className="font-bold text-on-surface">{selectedRecord.shippingAddress.country} ({selectedRecord.shippingAddress.postalCode})</p>
                  </div>
                </div>
              </div>

              {/* Items Purchased */}
              {selectedRecord.items && selectedRecord.items.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    Items Purchased ({selectedRecord.itemsCount})
                  </p>
                  <div className="divide-y divide-outline-variant/60 border border-outline-variant rounded-2xl overflow-hidden">
                    {selectedRecord.items.map((item, idx) => (
                      <div key={idx} className="p-3.5 flex items-center justify-between bg-surface">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
                          ) : (
                            <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center font-bold text-xs">
                              VL
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-on-surface">{item.name}</p>
                            <p className="text-[11px] text-secondary">Size: {item.size} × Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-xs font-black">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Update Quick Action */}
              <div className="pt-4 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-secondary font-medium">
                  Update payment status for this transaction
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedRecord.id, "paid")}
                    className="px-3 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition"
                  >
                    Mark Paid
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedRecord.id, "refunded")}
                    className="px-3 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition"
                  >
                    Mark Refunded
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedRecord.id, "failed")}
                    className="px-3 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition"
                  >
                    Mark Failed
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import {
  ShoppingCart,
 
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  Eye,
  FileText,
  Printer,
  Copy,
  DollarSign,
  ChevronRight,
  ChevronDown,
  Check,
  User,
  MapPin,
  CreditCard,
  Sparkles,
} from "lucide-react";
import type { Order, OrderStatus, PaymentStatus } from "@/types/order";
import DataTable, { ColumnDef } from "@/app/admin/_components/common/DataTable";

interface StatusOption<T extends string> {
  value: T;
  label: string;
  badgeClass: string;
  dotClass: string;
}

const PAYMENT_STATUS_OPTIONS: StatusOption<PaymentStatus>[] = [
  {
    value: "paid",
    label: "Paid",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60 shadow-xs",
    dotClass: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
  },
  {
    value: "pending",
    label: "Pending",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:border-amber-500/60 shadow-xs",
    dotClass: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]",
  },
  {
    value: "failed",
    label: "Failed",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:border-rose-500/60 shadow-xs",
    dotClass: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]",
  },
];

const ORDER_STATUS_OPTIONS: StatusOption<OrderStatus>[] = [
  {
    value: "processing",
    label: "Processing",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 hover:border-purple-500/60 shadow-xs",
    dotClass: "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]",
  },
  {
    value: "confirmed",
    label: "Confirmed",
    badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 hover:border-indigo-500/60 shadow-xs",
    dotClass: "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]",
  },
  {
    value: "shipped",
    label: "Shipped",
    badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30 hover:border-sky-500/60 shadow-xs",
    dotClass: "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]",
  },
  {
    value: "delivered",
    label: "Delivered",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60 shadow-xs",
    dotClass: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:border-rose-500/60 shadow-xs",
    dotClass: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]",
  },
];

const ORDER_FILTER_OPTIONS: StatusOption<string>[] = [
  { value: "all", label: "All Order Statuses", badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700", dotClass: "bg-gray-400" },
  { value: "processing", label: "Processing", badgeClass: "bg-purple-500/10 text-purple-600 border-purple-500/30", dotClass: "bg-purple-500" },
  { value: "confirmed", label: "Confirmed", badgeClass: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30", dotClass: "bg-indigo-500" },
  { value: "shipped", label: "Shipped", badgeClass: "bg-sky-500/10 text-sky-600 border-sky-500/30", dotClass: "bg-sky-500" },
  { value: "delivered", label: "Delivered", badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30", dotClass: "bg-emerald-500" },
  { value: "cancelled", label: "Cancelled", badgeClass: "bg-rose-500/10 text-rose-600 border-rose-500/30", dotClass: "bg-rose-500" },
];

const PAYMENT_FILTER_OPTIONS: StatusOption<string>[] = [
  { value: "all", label: "All Payment Statuses", badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700", dotClass: "bg-gray-400" },
  { value: "paid", label: "Paid Only", badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30", dotClass: "bg-emerald-500" },
  { value: "pending", label: "Pending Only", badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/30", dotClass: "bg-amber-500" },
  { value: "failed", label: "Failed Only", badgeClass: "bg-rose-500/10 text-rose-600 border-rose-500/30", dotClass: "bg-rose-500" },
];

function CustomStatusSelect<T extends string>({
  value,
  options,
  onChange,
  className = "",
}: {
  value: T;
  options: StatusOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-2 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 ${
          selectedOption.badgeClass
        }`}
      >
        <span className={`w-2 h-2 rounded-full shrink-0 animate-pulse ${selectedOption.dotClass}`} />
        <span>{selectedOption.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 opacity-70 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 z-50 min-w-[155px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl p-1.5 shadow-2xl border border-gray-200/80 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-150">
          <div className="space-y-0.5">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 font-black"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dotClass}`} />
                    <span className="text-[10px] font-black">{opt.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [summary, setSummary] = useState({
    totalOrders: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    paidRevenue: 0,
  });

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (orderStatusFilter !== "all") params.append("orderStatus", orderStatusFilter);
      if (paymentStatusFilter !== "all") params.append("paymentStatus", paymentStatusFilter);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const json = await res.json();

      if (res.ok && json.success) {
        setOrders(json.data || []);
        if (json.summary) {
          setSummary(json.summary);
        }
      } else {
        toast.error(json.error || "Failed to load orders");
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [search, orderStatusFilter, paymentStatusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, orderStatus: newStatus }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`Order ${orderId} status updated to ${newStatus}`);
        setOrders((prev) =>
          prev.map((o) =>
            o.orderNumber === orderId || o._id === orderId
              ? { ...o, orderStatus: newStatus }
              : o
          )
        );
      } else {
        toast.error(json.error || "Failed to update order status");
      }
    } catch (err) {
      console.error("Order status update error:", err);
      toast.error("Failed to update order status");
    }
  };

  const handleUpdatePaymentStatus = async (
    orderId: string,
    newPaymentStatus: PaymentStatus
  ) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentStatus: newPaymentStatus }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`Order ${orderId} payment marked as ${newPaymentStatus}`);
        setOrders((prev) =>
          prev.map((o) =>
            o.orderNumber === orderId || o._id === orderId
              ? { ...o, paymentStatus: newPaymentStatus }
              : o
          )
        );
      } else {
        toast.error(json.error || "Failed to update payment status");
      }
    } catch (err) {
      console.error("Payment status update error:", err);
      toast.error("Failed to update payment status");
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const columns: ColumnDef<Order>[] = [
    {
      key: "orderNumber",
      header: "Order #",
      render: (ord) => (
        <span className="font-mono whitespace-pre font-black text-gray-900 dark:text-white text-xs bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700">
          {ord.orderNumber}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (ord) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 font-bold flex items-center justify-center text-xs shrink-0">
            {(ord.shippingAddress?.fullName || ord.userEmail).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 dark:text-white text-xs truncate max-w-[140px]">
              {ord.shippingAddress?.fullName || ord.userEmail}
            </p>
            <p className="text-[11px] text-gray-400 truncate max-w-[140px]">
              {ord.userEmail}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      render: (ord) => (
        <div className="flex items-center gap-2.5">
          {ord.items?.[0]?.image ? (
            <img
              src={ord.items[0].image}
              alt={ord.items[0].name}
              className="w-9 h-9 object-cover rounded-lg shrink-0 border border-gray-200 dark:border-gray-700 shadow-xs"
            />
          ) : (
            <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-400 shrink-0">
              IMG
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[130px]">
              {ord.items?.[0]?.name || "Garment Item"}
            </p>
            <span className="text-[10px] text-gray-400 font-semibold block">
              {ord.items?.length || 1} item(s) total
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "gateway",
      header: "Gateway",
      render: (ord) => (
        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
          {ord.paymentMethod}
        </span>
      ),
    },
    {
      key: "paymentStatus",
      header: "Payment Status",
      render: (ord) => (
        <CustomStatusSelect
          value={ord.paymentStatus}
          options={PAYMENT_STATUS_OPTIONS}
          onChange={(newStatus) =>
            handleUpdatePaymentStatus(ord.orderNumber, newStatus)
          }
        />
      ),
    },
    {
      key: "orderStatus",
      header: "Fulfillment Status",
      render: (ord) => (
        <CustomStatusSelect
          value={ord.orderStatus}
          options={ORDER_STATUS_OPTIONS}
          onChange={(newStatus) =>
            handleUpdateOrderStatus(ord.orderNumber, newStatus)
          }
        />
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (ord) => (
        <span className="text-xs text-gray-500 whitespace-pre dark:text-gray-400 font-medium">
          {formatDate(ord.createdAt)}
        </span>
      ),
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      render: (ord) => (
        <span className="font-black text-gray-900 dark:text-white text-sm">
          {formatCurrency(ord.total)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (ord) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setSelectedOrder(ord)}
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
            title="View Order Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setInvoiceModalOrder(ord)}
            className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/50 hover:bg-violet-100 dark:hover:bg-violet-900/60 text-violet-600 dark:text-violet-400 transition-colors cursor-pointer"
            title="Print Invoice"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const getOrderStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "shipped":
        return "bg-cyan-500/10 text-cyan-600 border-cyan-500/20";
      case "confirmed":
        return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
      case "processing":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "cancelled":
        return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      default:
        return "bg-surface-container-high text-secondary border-surface-container";
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-on-surface">
              Order Management
            </h1>
          </div>
          <p className="text-sm text-secondary mt-1">
            Track customer purchases, update fulfillment statuses, inspect invoices, and manage order lifecycles.
          </p>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-surface-container bg-surface-container-low p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-on-surface mt-3">
            {summary.totalOrders}
          </p>
          <span className="text-[10px] text-secondary font-medium mt-1">
            Total recorded checkouts
          </span>
        </div>

        <div className="rounded-2xl border border-surface-container bg-surface-container-low p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
              Paid Revenue
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-on-surface mt-3">
            {formatCurrency(summary.paidRevenue)}
          </p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1">
            Gross fulfilled sales
          </span>
        </div>

        <div className="rounded-2xl border border-surface-container bg-surface-container-low p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
              Processing
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-on-surface mt-3">
            {summary.processing}
          </p>
          <span className="text-[10px] text-amber-600 font-bold mt-1">
            Awaiting fulfillment
          </span>
        </div>

        <div className="rounded-2xl border border-surface-container bg-surface-container-low p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
              Shipped
            </span>
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-on-surface mt-3">
            {summary.shipped}
          </p>
          <span className="text-[10px] text-cyan-600 font-bold mt-1">
            In transit to customer
          </span>
        </div>

        <div className="rounded-2xl border border-surface-container bg-surface-container-low p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
              Delivered
            </span>
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-on-surface mt-3">
            {summary.delivered}
          </p>
          <span className="text-[10px] text-indigo-600 font-bold mt-1">
            Completed deliveries
          </span>
        </div>
      </div>

      {/* High-Grade Admin Data Table */}
      <DataTable
        title="Order Records List"
        description="Real-time checkout records, customer details & fulfillment status management."
        columns={columns}
        data={orders}
        keyExtractor={(ord) => ord.orderNumber || ord._id || ""}
        loading={loading}
        emptyMessage="No orders found matching search criteria."
        emptyIcon={<ShoppingCart className="h-10 w-10 mb-2 text-gray-400 opacity-50" />}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Search order #, customer name, email...",
        }}
        headerActions={
          <div className="flex flex-wrap items-center gap-2">
            <CustomStatusSelect
              value={orderStatusFilter}
              options={ORDER_FILTER_OPTIONS}
              onChange={(val) => setOrderStatusFilter(val)}
            />
            <CustomStatusSelect
              value={paymentStatusFilter}
              options={PAYMENT_FILTER_OPTIONS}
              onChange={(val) => setPaymentStatusFilter(val)}
            />
          </div>
        }
      />

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-surface border border-surface-container-high rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar text-on-surface">
            <div className="flex items-start justify-between border-b border-outline-variant/40 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                  <h3 className="font-mono font-black text-lg text-on-surface">
                    {selectedOrder.orderNumber}
                  </h3>
                  <button
                    onClick={() =>
                      copyToClipboard(selectedOrder.orderNumber, "Order ID")
                    }
                    className="p-1 hover:bg-surface-container-high rounded-md transition text-secondary hover:text-on-surface cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-secondary mt-0.5">
                  Placed on {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-secondary hover:text-on-surface transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Customer & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" /> Customer Info
                </span>
                <p className="text-sm font-black text-on-surface">
                  {selectedOrder.shippingAddress?.fullName || selectedOrder.userEmail}
                </p>
                <p className="text-xs text-secondary">{selectedOrder.userEmail}</p>
                {selectedOrder.shippingAddress?.phone && (
                  <p className="text-xs text-secondary">{selectedOrder.shippingAddress.phone}</p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Shipping Destination
                </span>
                <p className="text-xs font-bold text-on-surface">
                  {selectedOrder.shippingAddress?.address}
                </p>
                <p className="text-xs text-secondary">
                  {selectedOrder.shippingAddress?.city},{" "}
                  {selectedOrder.shippingAddress?.postalCode}
                </p>
                <p className="text-xs text-secondary font-bold uppercase">
                  {selectedOrder.shippingAddress?.country}
                </p>
              </div>
            </div>

            {/* Order Items Table */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-secondary mb-2">
                Purchased Garments ({selectedOrder.items?.length || 0})
              </h4>
              <div className="rounded-2xl border border-surface-container overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-surface-container-lowest text-secondary font-black border-b border-surface-container">
                    <tr>
                      <th className="py-2.5 px-3">Item</th>
                      <th className="py-2.5 px-3">Size</th>
                      <th className="py-2.5 px-3">Qty</th>
                      <th className="py-2.5 px-3 text-right">Price</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {selectedOrder.items?.map((item, i) => (
                      <tr key={i}>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-7 h-7 object-cover rounded-md shrink-0"
                              />
                            ) : null}
                            <span className="font-bold text-on-surface">
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-bold uppercase">
                          {item.size}
                        </td>
                        <td className="py-2.5 px-3 font-bold">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Cost Breakdown */}
            <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container space-y-2">
              <div className="flex justify-between text-xs text-secondary font-medium">
                <span>Subtotal</span>
                <span>{formatCurrency(selectedOrder.subtotal || selectedOrder.total)}</span>
              </div>
              <div className="flex justify-between text-xs text-secondary font-medium">
                <span>Shipping Fee</span>
                <span>
                  {selectedOrder.shipping === 0
                    ? "FREE"
                    : formatCurrency(selectedOrder.shipping || 0)}
                </span>
              </div>
              <div className="border-t border-outline-variant/40 pt-2 flex justify-between text-sm font-black text-on-surface">
                <span>Total Amount Paid</span>
                <span className="text-primary">
                  {formatCurrency(selectedOrder.total)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setInvoiceModalOrder(selectedOrder);
                }}
                className="px-4 py-2 rounded-full border border-surface-container-high text-xs font-bold flex items-center gap-1.5 hover:bg-surface-container-high transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Invoice
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-full bg-primary text-background text-xs font-bold hover:bg-primary-fixed hover:text-white transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Printable Modal */}
      {invoiceModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white print:static">
          <div className="print-invoice-modal relative w-full max-w-2xl bg-white text-black border border-gray-300 rounded-3xl p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 print:hidden">
              <span className="font-bold text-xs uppercase tracking-wider text-gray-500">
                Official Order Invoice
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-gray-800 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print / PDF
                </button>
                <button
                  onClick={() => setInvoiceModalOrder(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold hover:bg-gray-200 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="space-y-6 text-black font-sans">
              <div className="flex items-center justify-between border-b border-black pb-4">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-widest">
                    ZENVRO
                  </h2>
                  <p className="text-xs text-gray-500 font-bold uppercase">
                    Order Invoice & Receipt
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-mono font-black text-sm">
                    #{invoiceModalOrder.orderNumber}
                  </p>
                  <p className="text-gray-500">
                    {formatDate(invoiceModalOrder.createdAt)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs border-b border-gray-200 pb-4">
                <div>
                  <p className="font-bold uppercase text-gray-500">Customer</p>
                  <p className="font-bold text-sm">
                    {invoiceModalOrder.shippingAddress?.fullName ||
                      invoiceModalOrder.userEmail}
                  </p>
                  <p className="text-gray-600">{invoiceModalOrder.userEmail}</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-gray-500">Shipping Address</p>
                  <p>{invoiceModalOrder.shippingAddress?.address}</p>
                  <p>
                    {invoiceModalOrder.shippingAddress?.city},{" "}
                    {invoiceModalOrder.shippingAddress?.postalCode}
                  </p>
                  <p className="font-bold uppercase">
                    {invoiceModalOrder.shippingAddress?.country}
                  </p>
                </div>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-300 font-bold bg-gray-100">
                    <th className="py-2 px-2">Item Description</th>
                    <th className="py-2 px-2">Size</th>
                    <th className="py-2 px-2">Qty</th>
                    <th className="py-2 px-2 text-right">Unit Price</th>
                    <th className="py-2 px-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceModalOrder.items?.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-2 px-2 font-bold">{item.name}</td>
                      <td className="py-2 px-2 uppercase">{item.size}</td>
                      <td className="py-2 px-2">{item.quantity}</td>
                      <td className="py-2 px-2 text-right">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-2 px-2 text-right font-bold">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end pt-2">
                <div className="w-1/2 space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>
                      {formatCurrency(
                        invoiceModalOrder.subtotal || invoiceModalOrder.total
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>
                      {invoiceModalOrder.shipping === 0
                        ? "FREE"
                        : formatCurrency(invoiceModalOrder.shipping || 0)}
                    </span>
                  </div>
                  <div className="border-t border-black pt-2 flex justify-between font-black text-sm">
                    <span>Total Amount Paid</span>
                    <span>{formatCurrency(invoiceModalOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

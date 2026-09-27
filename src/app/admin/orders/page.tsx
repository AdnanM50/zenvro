"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { ShoppingCart, Eye, Printer, RotateCcw } from "lucide-react";
import type { Order, OrderStatus, PaymentStatus } from "@/types/order";
import DataTable, { ColumnDef } from "@/app/admin/_components/common/DataTable";

import {
  PAYMENT_STATUS_OPTIONS,
  ORDER_STATUS_OPTIONS,
  ORDER_FILTER_OPTIONS,
  PAYMENT_FILTER_OPTIONS,
} from "./_components/order-status.constants";
import CustomStatusSelect from "./_components/CustomStatusSelect";
import OrderStatsCards, { type OrderSummaryData } from "./_components/OrderStatsCards";
import OrderDetailModal from "./_components/OrderDetailModal";
import OrderInvoiceModal from "./_components/OrderInvoiceModal";
import CancelOrderReasonModal from "./_components/CancelOrderReasonModal";
import ConfirmDialog from "@/app/admin/_components/common/ConfirmDialog";
import ProcessRefundModal from "./_components/ProcessRefundModal";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [summary, setSummary] = useState<OrderSummaryData>({
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
  const [refundModalOrder, setRefundModalOrder] = useState<Order | null>(null);

  // Order Cancellation 2-Step Workflow State
  const [orderPendingCancel, setOrderPendingCancel] = useState<Order | null>(null);
  const [isCancelReasonModalOpen, setIsCancelReasonModalOpen] = useState(false);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

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
    newStatus: OrderStatus,
    reason?: string
  ) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          orderStatus: newStatus,
          ...(reason ? { cancellationReason: reason } : {}),
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        const readableStatus = newStatus.toUpperCase();
        toast.success(`Order ${orderId} marked as ${readableStatus} (Email notification sent)`);
        setOrders((prev) =>
          prev.map((o) =>
            o.orderNumber === orderId || o._id === orderId
              ? {
                  ...o,
                  orderStatus: newStatus,
                  ...(reason ? { cancellationReason: reason, cancelledAt: new Date().toISOString() } : {}),
                }
              : o
          )
        );
        fetchOrders();
      } else {
        toast.error(json.error || "Failed to update order status");
      }
    } catch (err) {
      console.error("Order status update error:", err);
      toast.error("Failed to update order status");
    }
  };

  const handleStatusSelectChange = (ord: Order, newStatus: OrderStatus) => {
    if (newStatus === "cancelled") {
      setOrderPendingCancel(ord);
      setCancelReason("");
      setIsCancelReasonModalOpen(true);
      return;
    }
    handleUpdateOrderStatus(ord.orderNumber, newStatus);
  };

  const handleConfirmCancellation = async () => {
    if (!orderPendingCancel) return;
    try {
      setIsCancelling(true);
      await handleUpdateOrderStatus(
        orderPendingCancel.orderNumber,
        "cancelled",
        cancelReason.trim()
      );
      setIsConfirmCancelOpen(false);
      setOrderPendingCancel(null);
      setCancelReason("");
    } finally {
      setIsCancelling(false);
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
            handleStatusSelectChange(ord, newStatus)
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
          {(ord.paymentStatus === "paid" || ord.paymentStatus === "partially_refunded") && (
            <button
              onClick={() => setRefundModalOrder(ord)}
              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
              title="Issue Refund"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

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

      {/* KPI Stats Cards Component */}
      <OrderStatsCards summary={summary} formatCurrency={formatCurrency} />

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

      {/* Order Detail Modal Component */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onPrintInvoice={(ord) => setInvoiceModalOrder(ord)}
        onRefundOrder={(ord) => setRefundModalOrder(ord)}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        copyToClipboard={copyToClipboard}
      />

      {/* Printable Order Invoice Modal Component */}
      <OrderInvoiceModal
        order={invoiceModalOrder}
        onClose={() => setInvoiceModalOrder(null)}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />

      {/* Step 1: Cancellation Reason Modal */}
      <CancelOrderReasonModal
        isOpen={isCancelReasonModalOpen}
        order={orderPendingCancel}
        onClose={() => {
          setIsCancelReasonModalOpen(false);
          setOrderPendingCancel(null);
          setCancelReason("");
        }}
        onProceed={(reason) => {
          setCancelReason(reason);
          setIsCancelReasonModalOpen(false);
          setIsConfirmCancelOpen(true);
        }}
      />

      {/* Step 2: High-Grade Delete/Cancel Confirmation Box */}
      <ConfirmDialog
        isOpen={isConfirmCancelOpen}
        onClose={() => {
          setIsConfirmCancelOpen(false);
          setOrderPendingCancel(null);
          setCancelReason("");
        }}
        onConfirm={handleConfirmCancellation}
        title={orderPendingCancel ? `Cancel Order #${orderPendingCancel.orderNumber}?` : "Cancel this order?"}
        description={`Are you sure you want to cancel order ${orderPendingCancel?.orderNumber}? Fulfillment status will be updated to CANCELLED and an official humble cancellation notice will be emailed to ${orderPendingCancel?.userEmail || "the customer"}.`}
        confirmLabel="Confirm Cancellation"
        confirmLoadingLabel="Cancelling Order..."
        cancelLabel="Keep Order"
        confirming={isCancelling}
      >
        {cancelReason && (
          <div className="text-left p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Reason to be emailed:
            </div>
            <p className="text-xs italic text-gray-700 dark:text-gray-300 leading-relaxed">
              &ldquo;{cancelReason}&rdquo;
            </p>
          </div>
        )}
      </ConfirmDialog>

      {/* Refund Processing Modal Component */}
      <ProcessRefundModal
        isOpen={!!refundModalOrder}
        order={refundModalOrder}
        onClose={() => setRefundModalOrder(null)}
        onSuccess={(updatedOrder) => {
          const refundedAmount =
            updatedOrder.paymentDetails?.refundedAmount || updatedOrder.total;
          toast.success(
            `Refund of ${formatCurrency(refundedAmount)} processed for Order #${updatedOrder.orderNumber}`
          );
          setOrders((prev) =>
            prev.map((o) =>
              o.orderNumber === updatedOrder.orderNumber || o._id === updatedOrder._id
                ? updatedOrder
                : o
            )
          );
          if (selectedOrder?.orderNumber === updatedOrder.orderNumber) {
            setSelectedOrder(updatedOrder);
          }
          fetchOrders();
        }}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}

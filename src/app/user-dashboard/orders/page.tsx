"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Order } from "@/types";

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ordersPerPage = 5;

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const json = await res.json();
          setOrders(json.data || json || []);
        } else if (res.status === 401) {
          setError("Please sign in to view your order history.");
        } else {
          setError("Failed to load orders.");
        }
      } catch (err) {
        console.error("Fetch orders error:", err);
        setError("Unable to connect to server.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" ||
      order.orderStatus?.toLowerCase() === statusFilter.toLowerCase();

    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      order.orderNumber.toLowerCase().includes(query) ||
      order.items?.some((item) => item.name.toLowerCase().includes(query));

    return matchesStatus && matchesQuery;
  });

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Filters */}
      <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold">My Order History</h1>
            <span className="bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 text-xs font-bold px-2.5 py-1 rounded-full">
              {filteredOrders.length} Found
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            View, track, and manage all your past and active orders.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            placeholder="Search order number or item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs focus:ring-2 focus:ring-violet-500 w-full sm:w-56"
          />
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {["all", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-colors shrink-0 ${
                  statusFilter === st
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 p-4 rounded-xl text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <Link href="/login" className="underline font-bold text-xs">
            Sign In
          </Link>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 bg-white dark:bg-gray-900 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-800"
            />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 p-12 rounded-2xl sm:rounded-[2.5rem] text-center border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-2xl">
            🛒
          </div>
          <div>
            <h2 className="text-lg font-bold">No orders found</h2>
            <p className="text-xs text-gray-400 max-w-sm mt-1">
              {searchQuery || statusFilter !== "all"
                ? "No orders match your search or status filter. Try clearing filters."
                : "You haven't placed any orders yet. Start exploring our store!"}
            </p>
          </div>
          <Link
            href="/products"
            className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-xs font-bold hover:scale-105 transition-transform mt-2 shadow-md"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {paginatedOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-4 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm sm:text-base">#{order.orderNumber}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        order.paymentStatus === "paid"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                      }`}
                    >
                      Payment: {order.paymentStatus}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        order.orderStatus === "delivered"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          : order.orderStatus === "shipped"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg shrink-0 border border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-400 shrink-0 font-bold">
                          IMG
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-400">
                          Qty: {item.quantity} {item.size ? `• Size: ${item.size}` : ""}
                        </p>
                        <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                          ${item.price?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-xs text-gray-400">
                    Payment Method:{" "}
                    <span className="font-semibold text-gray-700 dark:text-gray-300 uppercase">
                      {order.paymentMethod}
                    </span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Total Amount</span>
                      <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                        ${order.total?.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-xs font-bold hover:scale-105 transition-transform"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                ← Previous
              </button>
              <span className="text-xs text-gray-400 font-semibold">
                Page <span className="text-gray-900 dark:text-gray-100 font-bold">{currentPage}</span> of{" "}
                <span className="text-gray-900 dark:text-gray-100 font-bold">{totalPages}</span>
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-lg font-bold">Order #{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-gray-400">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Status</span>
                  <span className="font-bold capitalize text-sm">{selectedOrder.orderStatus}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold text-right">Payment</span>
                  <span className="font-bold capitalize text-sm text-emerald-600 dark:text-emerald-400">
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
                        )}
                        <div>
                          <p className="text-xs font-bold">{item.name}</p>
                          <p className="text-[10px] text-gray-400">
                            Qty: {item.quantity} × ${item.price?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.shippingAddress && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl text-xs space-y-1">
                  <h4 className="font-bold text-gray-400 uppercase text-[10px]">Shipping Address</h4>
                  <p className="font-bold">
                    {selectedOrder.shippingAddress.fullName || selectedOrder.userEmail}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {selectedOrder.shippingAddress.address}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{" "}
                    {selectedOrder.shippingAddress.postalCode}
                  </p>
                </div>
              )}

              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-1 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>${selectedOrder.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span>{selectedOrder.shipping === 0 ? "FREE" : `$${selectedOrder.shipping?.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-2 text-gray-900 dark:text-gray-100">
                  <span>Total</span>
                  <span>${selectedOrder.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 text-right">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-xs font-bold hover:scale-105 transition-transform"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

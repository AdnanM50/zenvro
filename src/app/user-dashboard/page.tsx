"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Order } from "@/types";

export default function UserDashboardOverviewPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [userName, setUserName] = useState<string>("User");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [ordersRes, wishlistRes, profileRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/wishlist"),
          fetch("/api/user/profile"),
        ]);

        if (ordersRes.ok) {
          const json = await ordersRes.json();
          setOrders(json.data || json || []);
        }

        if (wishlistRes.ok) {
          const json = await wishlistRes.json();
          const items = json.data || json;
          if (Array.isArray(items)) setWishlistCount(items.length);
        }

        if (profileRes.ok) {
          const json = await profileRes.json();
          const data = json.data || json;
          if (data?.name) setUserName(data.name);
        }
      } catch (err) {
        console.error("Dashboard overview load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const totalSpent = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalItems = orders.reduce(
    (acc, o) => acc + (o.items?.reduce((iAcc, item) => iAcc + item.quantity, 0) || 0),
    0
  );
  const activeOrders = orders.filter(
    (o) => o.orderStatus !== "delivered" && o.orderStatus !== "cancelled"
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-4 flex flex-col justify-center text-center lg:text-left items-center lg:items-start">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">
            Welcome back, {userName.split(" ")[0]}!
          </h1>
          <p className="text-gray-500 text-sm sm:text-base max-w-xs">
            Track your orders, manage your profile, and see your rewards.
          </p>
          <div className="mt-6 lg:mt-12 flex gap-8 sm:gap-12 justify-center lg:justify-start">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Active Orders</p>
              <p className="text-lg sm:text-xl font-bold">{activeOrders.length}</p>
            </div>
            <div className="border-l border-gray-200 dark:border-gray-800 pl-8">
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Total Orders</p>
              <p className="text-lg sm:text-xl font-bold">{orders.length}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 relative h-[260px] sm:h-[300px] flex items-end justify-center overflow-hidden w-full">
          <div
            className="absolute bottom-0 w-full max-w-[500px] h-[220px] sm:h-[250px] border-t border-gray-200 dark:border-gray-800"
            style={{
              background:
                "radial-gradient(circle at 50% 100%, rgba(139, 92, 246, 0.15) 0%, rgba(255, 255, 255, 0) 70%)",
              borderTopLeftRadius: "50% 100%",
              borderTopRightRadius: "50% 100%",
            }}
          >
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center w-full px-4">
              <p className="text-gray-500 text-xs sm:text-sm font-medium">Total Spent</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-1">
                ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>

            {/* Floating Card 1 */}
            <div className="absolute left-1 sm:-left-4 top-10 sm:top-20 bg-white dark:bg-gray-900 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg flex flex-col gap-0.5 sm:gap-1 w-28 sm:w-40 border border-gray-100 dark:border-gray-800 z-10">
              <p className="text-gray-400 text-[9px] sm:text-xs font-semibold">Total Orders</p>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-lg font-bold">{orders.length}</span>
                <span className="bg-emerald-100 text-emerald-600 text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
                  Placed
                </span>
              </div>
              <div className="absolute -right-1 -bottom-1 sm:-right-2 sm:-bottom-2 w-3 h-3 sm:w-4 sm:h-4 bg-violet-400 rounded-full border-2 border-white dark:border-gray-900 shadow-sm" />
            </div>

            {/* Floating Card 2 */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-2 sm:-top-4 bg-white dark:bg-gray-900 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg flex flex-col gap-0.5 sm:gap-1 w-28 sm:w-40 border border-gray-100 dark:border-gray-800 z-10">
              <p className="text-gray-400 text-[9px] sm:text-xs font-semibold">Items Purchased</p>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-lg font-bold">{totalItems}</span>
                <span className="bg-emerald-100 text-emerald-600 text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
                  Items
                </span>
              </div>
              <div className="absolute -right-1 -bottom-1 sm:-right-2 sm:-bottom-2 w-3 h-3 sm:w-4 sm:h-4 bg-violet-400 rounded-full border-2 border-white dark:border-gray-900 shadow-sm" />
            </div>

            {/* Floating Card 3 */}
            <div className="absolute right-1 sm:-right-4 top-14 sm:top-24 bg-white dark:bg-gray-900 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg flex flex-col gap-0.5 sm:gap-1 w-28 sm:w-40 border border-gray-100 dark:border-gray-800 z-10">
              <p className="text-gray-400 text-[9px] sm:text-xs font-semibold">Wishlist Items</p>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-lg font-bold">{wishlistCount}</span>
                <span className="bg-pink-100 text-pink-600 text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
                  Saved
                </span>
              </div>
              <div className="absolute -left-1 -bottom-1 sm:-left-2 sm:-bottom-2 w-3 h-3 sm:w-4 sm:h-4 bg-blue-400 rounded-full border-2 border-white dark:border-gray-900 shadow-sm" />
            </div>

            <svg className="absolute top-0 left-0 w-full h-full" fill="none" viewBox="0 0 500 250">
              <path d="M50,250 C50,110 450,110 450,250" stroke="#DDD" strokeDasharray="4 4" strokeWidth="1" />
              <circle cx="250" cy="80" fill="#8B5CF6" r="4" />
              <path d="M250,80 C320,80 430,130 450,250" stroke="#8B5CF6" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </section>

      {/* Bottom Activity Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 mb-4">
        {/* Recent Orders Overview */}
        <div className="col-span-1 md:col-span-2 lg:col-span-8 bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-base sm:text-lg">Recent Order Activity</h3>
              <p className="text-xs text-gray-400">Track your latest purchases</p>
            </div>
            <Link
              href="/user-dashboard/orders"
              className="text-xs text-violet-600 dark:text-violet-400 font-semibold hover:underline flex items-center gap-1"
            >
              View All Orders →
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-gray-400">Loading activity...</div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center gap-3">
              <p className="text-sm text-gray-400">You haven&apos;t placed any orders yet.</p>
              <Link
                href="/products"
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-xs font-bold hover:scale-105 transition-transform"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 3).map((order) => (
                <Link
                  key={order._id}
                  href="/user-dashboard/orders"
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-xs shrink-0">
                      📦
                    </div>
                    <div>
                      <p className="text-sm font-bold">#{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })} • {order.items?.length || 0} item(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-200 dark:border-gray-700">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        order.orderStatus === "delivered"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          : order.orderStatus === "shipped"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                    <span className="text-sm font-bold">${order.total?.toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Module Navigation Links */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-2">User Modules</h3>
            <p className="text-xs text-gray-400 mb-6">Quick shortcuts to your account modules.</p>
            <div className="space-y-3">
              <Link
                href="/user-dashboard/orders"
                className="w-full p-3 bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-left flex items-center justify-between transition-colors"
              >
                <span className="text-xs font-semibold">My Order History ({orders.length})</span>
                <span>→</span>
              </Link>
              <Link
                href="/user-dashboard/wishlist"
                className="w-full p-3 bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-left flex items-center justify-between transition-colors"
              >
                <span className="text-xs font-semibold">Saved Wishlist ({wishlistCount})</span>
                <span>→</span>
              </Link>
              <Link
                href="/user-dashboard/settings"
                className="w-full p-3 bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-left flex items-center justify-between transition-colors"
              >
                <span className="text-xs font-semibold">Profile & Password Settings</span>
                <span>→</span>
              </Link>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <span className="text-[10px] text-gray-400 font-medium">Shoplytix User Portal</span>
          </div>
        </div>
      </section>
    </div>
  );
}

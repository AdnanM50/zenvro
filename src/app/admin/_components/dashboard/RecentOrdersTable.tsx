"use client";

import React, { useState } from "react";
import { Edit2, Eye, Search, Filter } from "lucide-react";

const ORDERS = [
  {
    id: 1,
    customer: "Elena Smith",
    email: "elenasmith387@gmail.com",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
    product: "All-Purpose Cleaner",
    quantity: 3,
    amount: "$9.99",
    status: "In Progress",
    statusStyle: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-500/20",
    date: "03, Sep 2024",
  },
  {
    id: 2,
    customer: "Nelson Gold",
    email: "noahrussell556@gmail.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    product: "Kitchen Knife Set",
    quantity: 4,
    amount: "$49.99",
    status: "Pending",
    statusStyle: "bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 border border-pink-500/20",
    date: "26, Jul 2024",
  },
  {
    id: 3,
    customer: "Grace Mitchell",
    email: "gracemitchell79@gmail.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    product: "Velvet Throw Blanket",
    quantity: 2,
    amount: "$29.99",
    status: "Success",
    statusStyle: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20",
    date: "12, May 2024",
  },
  {
    id: 4,
    customer: "Spencer Robin",
    email: "leophillips124@gmail.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    product: "Aromatherapy Diffuser",
    quantity: 4,
    amount: "$19.99",
    status: "Success",
    statusStyle: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20",
    date: "15, Aug 2024",
  },
  {
    id: 5,
    customer: "Chloe Lewis",
    email: "chloelewis67@gmail.com",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80",
    product: "Insulated Water Bottle",
    quantity: 2,
    amount: "$14.99",
    status: "Pending",
    statusStyle: "bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 border border-pink-500/20",
    date: "11, Oct 2024",
  },
];

export default function RecentOrdersTable() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = ORDERS.filter(
    (order) =>
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            Customer Orders
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Real-time verified checkout transactions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search order..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full py-1.5 pl-8 pr-3 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white w-36 sm:w-44"
            />
          </div>
          <button className="p-1.5 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white border border-gray-200 dark:border-gray-700 transition-colors">
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
        <table className="w-full text-left text-xs min-w-[620px]">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-medium">
              <th className="pb-3 font-medium">Customer</th>
              <th className="pb-3 font-medium">Product</th>
              <th className="pb-3 font-medium text-center">Quantity</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium text-center">Status</th>
              <th className="pb-3 font-medium">Date Ordered</th>
              <th className="pb-3 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
            {filteredOrders.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors"
              >
                {/* Customer */}
                <td className="py-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={row.avatar}
                      alt={row.customer}
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200 dark:border-gray-700"
                    />
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">
                        {row.customer}
                      </div>
                      <div className="text-[11px] text-gray-400 dark:text-gray-500">
                        {row.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Product */}
                <td className="py-3 font-semibold text-gray-800 dark:text-gray-200">
                  {row.product}
                </td>

                {/* Quantity */}
                <td className="py-3 text-center font-bold text-gray-700 dark:text-gray-300">
                  {row.quantity}
                </td>

                {/* Amount */}
                <td className="py-3 font-bold text-gray-900 dark:text-white">
                  {row.amount}
                </td>

                {/* Status */}
                <td className="py-3 text-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold ${row.statusStyle}`}
                  >
                    {row.status}
                  </span>
                </td>

                {/* Date */}
                <td className="py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {row.date}
                </td>

                {/* Action */}
                <td className="py-3 text-center">
                  <button
                    aria-label="Edit order"
                    className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 inline-flex items-center justify-center border border-emerald-500/20 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import React from "react";

const PRODUCTS = [
  {
    id: 1,
    name: "SwiftBuds",
    price: "$39.99",
    status: "Success",
    statusStyle: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-500/20",
    avatar: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    name: "CozyCloud Pillow...",
    price: "$19.95",
    status: "Pending",
    statusStyle: "bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 border border-pink-500/20",
    avatar: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    name: "AquaGrip Bottle",
    price: "$9.99",
    status: "Failed",
    statusStyle: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-500/20",
    avatar: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: 4,
    name: "GlowLite Lamp",
    price: "$24.99",
    status: "Success",
    statusStyle: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-500/20",
    avatar: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: 5,
    name: "Bitvitamin",
    price: "$26.45",
    status: "Success",
    statusStyle: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-500/20",
    avatar: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: 6,
    name: "FitTrack",
    price: "$49.95",
    status: "Success",
    statusStyle: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-500/20",
    avatar: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=100&auto=format&fit=crop&q=80",
  },
];

export default function LatestPurchaseProducts() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">
          Latest Purchase Products
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-medium">
              <th className="pb-2.5 font-medium">Product</th>
              <th className="pb-2.5 font-medium text-center">Price</th>
              <th className="pb-2.5 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
            {PRODUCTS.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                <td className="py-2.5">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-7 h-7 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 shrink-0"
                    />
                    <span className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[90px] sm:max-w-[120px]">
                      {item.name}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 text-center font-bold text-gray-700 dark:text-gray-300">
                  {item.price}
                </td>
                <td className="py-2.5 text-right">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${item.statusStyle}`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

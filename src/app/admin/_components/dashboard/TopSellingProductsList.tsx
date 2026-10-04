"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const TOP_PRODUCTS = [
  {
    id: 1,
    name: "Chair with Cushion",
    category: "Furniture",
    price: "$124",
    sales: "260 Sales",
    image: "https://images.unsplash.com/photo-1580481077195-c3a821a58875?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    name: "Hand Bag",
    category: "Accessories",
    price: "$564",
    sales: "181 Sales",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    name: "Sneakers",
    category: "Sports",
    price: "$964",
    sales: "134 Sales",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: 4,
    name: "Ron Hoodie",
    category: "Fashion",
    price: "$769",
    sales: "127 Sales",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: 5,
    name: "Minimalist Desk Lamp",
    category: "Home Decor",
    price: "$89",
    sales: "114 Sales",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=120&auto=format&fit=crop&q=80",
  },
];

export default function TopSellingProductsList() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            Top-Selling Category
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Highest grossing items this month
          </p>
        </div>
        <Link
          href="/admin/products"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
        >
          View All <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-50 dark:divide-gray-800/80">
        {TOP_PRODUCTS.map((prod) => (
          <div
            key={prod.id}
            className="py-3 flex items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 rounded-xl px-2 -mx-2 transition-colors"
          >
            <div className="flex items-center gap-3">
              <img
                src={prod.image}
                alt={prod.name}
                className="w-11 h-11 rounded-xl object-cover bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shrink-0"
              />
              <div>
                <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                  {prod.name}
                </div>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                  {prod.category}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">
                {prod.price}
              </div>
              <div className="text-[11px] text-gray-400 dark:text-gray-500">
                {prod.sales}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

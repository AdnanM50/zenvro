"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

interface WishlistItemData {
  _id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  slug?: string;
}

export default function UserWishlistPage() {
  const { addItem } = useCart();
  const [wishlist, setWishlist] = useState<WishlistItemData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  async function fetchWishlist() {
    setLoading(true);
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const json = await res.json();
        const rawItems = json.data || json || [];
        const formatted: WishlistItemData[] = rawItems.map((item: any, idx: number) => {
          if (typeof item === "string") {
            return { _id: item, name: `Product ${idx + 1}`, price: 120 };
          }
          return {
            _id: item._id || item.id || `wish-${idx}`,
            name: item.name || item.title || "Product Item",
            price: item.price || 150,
            image: item.image || item.imageUrl,
            category: item.category,
            slug: item.slug,
          };
        });
        setWishlist(formatted);
      }
    } catch (err) {
      console.error("Fetch wishlist error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function removeFromWishlist(id: string) {
    try {
      const res = await fetch(`/api/wishlist?product=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setWishlist((prev) => prev.filter((item) => item._id !== id));
        setMessage("Item removed from wishlist.");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error("Remove from wishlist error:", err);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold">My Saved Wishlist</h1>
            <span className="bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 text-xs font-bold px-2.5 py-1 rounded-full">
              {wishlist.length} Saved
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Keep track of items you love and move them to cart anytime.
          </p>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 p-3 rounded-xl text-xs font-bold">
          {message}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-white dark:bg-gray-900 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-800" />
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 p-12 rounded-2xl sm:rounded-[2.5rem] text-center border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 bg-pink-50 dark:bg-pink-950 rounded-full flex items-center justify-center text-2xl text-pink-500">
            ♥
          </div>
          <div>
            <h2 className="text-lg font-bold">Your wishlist is empty</h2>
            <p className="text-xs text-gray-400 max-w-sm mt-1">
              Save items you like to your wishlist so you can easily find them later.
            </p>
          </div>
          <Link
            href="/products"
            className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-xs font-bold hover:scale-105 transition-transform mt-2 shadow-md"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between gap-4 group"
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <span className="text-gray-400 text-xs font-bold">PRODUCT IMAGE</span>
                )}
                <button
                  onClick={() => removeFromWishlist(item._id)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xs flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors text-xs font-bold shadow-sm"
                  title="Remove from wishlist"
                >
                  ✕
                </button>
              </div>

              <div>
                <h3 className="font-bold text-sm truncate">{item.name}</h3>
                <p className="text-xs font-bold text-violet-600 dark:text-violet-400 mt-0.5">
                  ${item.price?.toFixed(2)}
                </p>
              </div>

              <button
                onClick={() => {
                  addItem(
                    {
                      id: item._id,
                      slug: item.slug || item._id,
                      name: item.name,
                      category: item.category || "General",
                      year: "2026",
                      price: `$${item.price}`,
                      rating: "4.8",
                      reviewsCount: 12,
                      tagline: item.name,
                      description: item.name,
                      image: item.image || "",
                      images: [item.image || ""],
                      color: "Black",
                      material: "Cotton",
                      fit: "Regular",
                      sizes: ["S", "M", "L"],
                      details: [item.name],
                      reviews: [],
                      comments: [],
                    },
                    "M",
                    1
                  );
                  setMessage(`Added ${item.name} to cart!`);
                  setTimeout(() => setMessage(null), 3000);
                }}
                className="w-full py-2.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-xl hover:scale-102 transition-transform shadow-xs flex items-center justify-center gap-2"
              >
                <span>Add to Cart</span>
                <span>🛒</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

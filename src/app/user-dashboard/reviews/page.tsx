"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface PurchasedProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  purchaseCount: number;
  lastPurchasedAt: string;
  reviewCount: number;
  hasReviewed: boolean;
}

interface UserReview {
  _id: string;
  product: {
    _id?: string;
    name?: string;
    slug?: string;
    images?: string[];
  } | string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function UserReviewsPage() {
  const [purchasedProducts, setPurchasedProducts] = useState<PurchasedProduct[]>([]);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Review modal state
  const [selectedProduct, setSelectedProduct] = useState<PurchasedProduct | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/reviews");
      if (!res.ok) {
        throw new Error("Failed to fetch user review data");
      }
      const data = await res.json();
      if (data.success) {
        setPurchasedProducts(data.purchasedProducts || []);
        setReviews(data.reviews || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load reviews data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleOpenModal = (product: PurchasedProduct) => {
    setSelectedProduct(product);
    setRating(5);
    setTitle("");
    setComment("");
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!title.trim() || !comment.trim()) {
      setSubmitError("Please fill out both the title and comment fields.");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: selectedProduct.id || selectedProduct.slug,
          rating,
          title,
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to submit review");
      }

      setSubmitSuccess("Review submitted successfully! It will appear after approval.");
      setTimeout(() => {
        handleCloseModal();
        fetchUserData();
      }, 1500);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm font-medium">Loading your reviews and purchased items...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Reviews & Ratings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Share feedback on items you have purchased. You can only review products you have verified orders for.
          </p>
        </div>
        <div className="flex items-center gap-3 self-stretch sm:self-auto">
          <div className="flex-1 sm:flex-initial px-4 py-2 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900/60 rounded-2xl text-center">
            <span className="block text-xl font-bold text-violet-600 dark:text-violet-400">
              {purchasedProducts.length}
            </span>
            <span className="text-[11px] font-semibold uppercase text-violet-700 dark:text-violet-300">
              Purchased
            </span>
          </div>
          <div className="flex-1 sm:flex-initial px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl text-center">
            <span className="block text-xl font-bold text-amber-600 dark:text-amber-400">
              {reviews.length}
            </span>
            <span className="text-[11px] font-semibold uppercase text-amber-700 dark:text-amber-300">
              Reviews
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm rounded-2xl">
          {error}
        </div>
      )}

      {/* Section 1: Products Eligible for Review */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-600"></span>
            Products Ready to Review
          </h2>
          <span className="text-xs text-gray-400 font-medium">Verified Purchases Only</span>
        </div>

        {purchasedProducts.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-8 text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base">No Purchased Products Yet</h3>
            <p className="text-xs text-gray-500 max-w-md">
              You must purchase a product before you can leave a review. Browse our store and place an order to get started!
            </p>
            <Link
              href="/products"
              className="mt-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs rounded-full transition-colors shadow-md"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {purchasedProducts.map((prod) => (
              <div
                key={prod.id || prod.slug}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex flex-col justify-between gap-4 shadow-sm hover:border-violet-200 dark:hover:border-violet-900 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shrink-0 relative">
                    {prod.image ? (
                      <Image
                        src={prod.image}
                        alt={prod.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                      {prod.name}
                    </span>
                    <span className="text-xs text-violet-600 dark:text-violet-400 font-bold mt-0.5">
                      ${prod.price.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Verified Purchase ({prod.purchaseCount}x)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-[11px] text-gray-400">
                    Purchased {new Date(prod.lastPurchasedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleOpenModal(prod)}
                    className="px-3.5 py-1.5 bg-black text-white dark:bg-white dark:text-black hover:bg-violet-600 hover:text-white dark:hover:bg-violet-500 dark:hover:text-white text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                    Write Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Submitted Reviews History */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            My Submitted Reviews ({reviews.length})
          </h2>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 text-center text-gray-500 text-sm">
            You haven't submitted any reviews yet. Choose a purchased product above to write your first review!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((rev) => {
              const productName =
                typeof rev.product === "object" && rev.product?.name
                  ? rev.product.name
                  : "Product";
              const productImage =
                typeof rev.product === "object" && rev.product?.images?.[0]
                  ? rev.product.images[0]
                  : null;

              return (
                <div
                  key={rev._id}
                  className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 flex flex-col md:flex-row justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden shrink-0 relative">
                      {productImage ? (
                        <Image
                          src={productImage}
                          alt={productName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                          Item
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 dark:text-white text-sm">
                          {productName}
                        </span>
                        {rev.isVerifiedPurchase && (
                          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Verified Purchase
                          </span>
                        )}
                      </div>

                      {/* Rating Stars */}
                      <div className="flex items-center gap-1 my-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${
                              star <= rev.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-300 dark:text-gray-700"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        ))}
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">
                          {rev.rating}.0
                        </span>
                      </div>

                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                        {rev.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mt-0.5">
                        {rev.comment}
                      </p>
                    </div>
                  </div>

                  <div className="flex md:flex-col justify-between items-end gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 dark:border-gray-800">
                    <span className="text-[11px] text-gray-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                        rev.status === "approved" || rev.isApproved
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-200 dark:border-emerald-800"
                          : rev.status === "rejected"
                          ? "bg-red-50 dark:bg-red-950/40 text-red-600 border-red-200 dark:border-red-800"
                          : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      {rev.status === "approved" || rev.isApproved
                        ? "Approved"
                        : rev.status === "rejected"
                        ? "Rejected"
                        : "Pending Approval"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Review Submission Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Write Product Review
              </h3>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Target Product Summary */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-xl overflow-hidden shrink-0 relative">
                {selectedProduct.image ? (
                  <Image
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                  {selectedProduct.name}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Verified Purchase
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
              {/* Rating selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform focus:outline-hidden"
                    >
                      <svg
                        className={`w-8 h-8 ${
                          star <= rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-300 dark:text-gray-700"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-500 ml-2">
                    {rating} out of 5 stars
                  </span>
                </div>
              </div>

              {/* Title input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Review Headline
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Excellent quality, fast shipping!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                />
              </div>

              {/* Comment text area */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Detailed Review
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us what you liked or disliked about this product..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                />
              </div>

              {submitError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-xl">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-xl">
                  {submitSuccess}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  {submitting && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useCart, formatPrice } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  CreditCard,
  Lock,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowLeft,
  Truck,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { fadeUp } from "@/lib/animations";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast.error("Please sign in to proceed to checkout");
      router.push("/login?redirect=/checkout");
    }
  }, [user, isAuthLoading, router]);

  // Payment configuration from backend
  const [paymentConfig, setPaymentConfig] = useState<{
    stripe?: { isEnabled: boolean; isTestMode: boolean; publishableKey: string };
    cod?: { isEnabled: boolean };
  }>({});

  const [selectedMethod, setSelectedMethod] = useState<"stripe" | "cod">("stripe");
  const [loading, setLoading] = useState(false);

  // Customer & Shipping Form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("United States");
  const [phone, setPhone] = useState("");

  const shipping = subtotal === 0 || subtotal >= 300 ? 0 : 15;
  const total = subtotal + shipping;

  // Pre-fill user data when user changes
  useEffect(() => {
    if (user) {
      if (!email) setEmail(user.email);
      if (!fullName && user.name) setFullName(user.name);
    }
  }, [user, email, fullName]);

  // Fetch payment configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/payment/config");
        const json = await res.json();
        if (json.success && json.data) {
          setPaymentConfig(json.data);
          if (!json.data.stripe?.isEnabled && json.data.cod?.isEnabled) {
            setSelectedMethod("cod");
          }
        }
      } catch (err) {
        console.error("Failed to load payment config", err);
      }
    };
    fetchConfig();
  }, []);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Your bag is empty. Please add items before checking out.");
      router.push("/#products");
      return;
    }

    if (!fullName.trim() || !email.trim() || !address.trim() || !city.trim()) {
      toast.error("Please fill in all required shipping fields.");
      return;
    }

    try {
      setLoading(true);

      if (selectedMethod === "stripe") {
        // Create Stripe Hosted Checkout Session
        const res = await fetch("/api/checkout/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            shippingAddress: {
              fullName,
              email,
              address,
              city,
              postalCode: postalCode || "10001",
              country,
              phone,
            },
            currency: "usd",
          }),
        });

        const json = await res.json();
        if (!res.ok || !json.success || !json.data?.url) {
          throw new Error(json.error || "Failed to create Stripe checkout session");
        }

        toast.loading("Redirecting to Stripe secure checkout...");
        // Redirect directly to Stripe hosted checkout page
        window.location.href = json.data.url;
        return;
      } else {
        // Cash on Delivery direct order creation
        const processRes = await fetch("/api/checkout/process-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            shippingAddress: {
              fullName,
              email,
              address,
              city,
              postalCode: postalCode || "10001",
              country,
              phone,
            },
            paymentMethod: "cod",
          }),
        });

        const processJson = await processRes.json();
        if (!processRes.ok || !processJson.success) {
          throw new Error(processJson.error || "Failed to finalize order");
        }

        const order = processJson.data;
        clearCart();
        toast.success("Order placed successfully!");
        router.push(`/checkout/success?orderNumber=${order.orderNumber}`);
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast.error(err?.message || "Checkout failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="bg-surface text-on-surface min-h-screen pt-28 pb-16 px-5 md:px-10 lg:px-16">
      <div className="mx-auto max-w-[1400px]">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/#products"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary hover:text-on-surface transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Collection
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
            <Lock className="h-3.5 w-3.5" />
            <span>Encrypted Checkout</span>
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <p className="font-label text-xs font-black uppercase tracking-[0.25em] text-secondary">
            Velora Boutiques &bull; Express Checkout
          </p>
          <h1 className="font-headline text-3xl md:text-5xl font-black uppercase tracking-tight mt-1">
            Secure Checkout
          </h1>
        </div>

        {items.length === 0 ? (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-center py-20 border border-dashed border-outline-variant rounded-3xl p-8"
          >
            <CreditCard className="h-12 w-12 mx-auto text-secondary mb-4 opacity-50" />
            <h2 className="font-headline text-2xl font-bold mb-2">Your Bag is Empty</h2>
            <p className="text-secondary text-sm mb-6 max-w-sm mx-auto">
              You haven&apos;t added any luxury pieces to your cart yet. Explore our curated catalog.
            </p>
            <Link
              href="/#products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black font-label text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-md"
            >
              Explore Collection
            </Link>
          </motion.div>
        ) : (
          <form
            onSubmit={handlePlaceOrder}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
          >
            {/* Left Column: Shipping & Payment Method Selection */}
            <div className="lg:col-span-7 space-y-8">
              {/* Section 1: Customer Details & Shipping Address */}
              <div className="border border-outline-variant bg-background p-6 md:p-8 rounded-2xl shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-outline-variant pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <h2 className="font-headline text-xl font-bold">Shipping Destination</h2>
                  </div>
                  {user && (
                    <span className="text-xs text-secondary font-mono">
                      Logged in as <strong>{user.email}</strong>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label htmlFor="checkout-email" className="block text-xs font-bold uppercase tracking-wider text-secondary">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@luxury.com"
                      className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label htmlFor="checkout-full-name" className="block text-xs font-bold uppercase tracking-wider text-secondary">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="checkout-full-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nafi Bellingham"
                      className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label htmlFor="checkout-address" className="block text-xs font-bold uppercase tracking-wider text-secondary">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="checkout-address"
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="742 Evergreen Terrace, Suite 100"
                      className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="checkout-city" className="block text-xs font-bold uppercase tracking-wider text-secondary">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="checkout-city"
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="New York"
                      className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="checkout-postal-code" className="block text-xs font-bold uppercase tracking-wider text-secondary">
                      Postal / ZIP Code
                    </label>
                    <input
                      id="checkout-postal-code"
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="10001"
                      className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="checkout-country" className="block text-xs font-bold uppercase tracking-wider text-secondary">
                      Country
                    </label>
                    <input
                      id="checkout-country"
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="checkout-phone" className="block text-xs font-bold uppercase tracking-wider text-secondary">
                      Phone Number (Optional)
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Payment Gateway Selection */}
              <div className="border border-outline-variant bg-background p-6 md:p-8 rounded-2xl shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-outline-variant pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <h2 className="font-headline text-xl font-bold">Payment Method</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-600">Stripe Encrypted</span>
                  </div>
                </div>

                {/* Gateway Options Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Stripe Card Option */}
                  <div
                    onClick={() => setSelectedMethod("stripe")}
                    className={`cursor-pointer border-2 rounded-2xl p-4 transition-all flex flex-col justify-between ${
                      selectedMethod === "stripe"
                        ? "border-black dark:border-white bg-black/5 dark:bg-white/5 shadow-xs"
                        : "border-outline-variant hover:border-gray-400 opacity-80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 font-bold text-sm">
                        <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <span>Stripe Checkout</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedMethod === "stripe" ? "border-black dark:border-white" : "border-gray-400"
                        }`}
                      >
                        {selectedMethod === "stripe" && (
                          <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] text-secondary">Card &amp; Digital Wallets</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        {paymentConfig.stripe?.isTestMode ? "Test Mode" : "Live"}
                      </span>
                    </div>
                  </div>

                  {/* Cash on Delivery Option */}
                  <div
                    onClick={() => setSelectedMethod("cod")}
                    className={`cursor-pointer border-2 rounded-2xl p-4 transition-all flex flex-col justify-between ${
                      selectedMethod === "cod"
                        ? "border-black dark:border-white bg-black/5 dark:bg-white/5 shadow-xs"
                        : "border-outline-variant hover:border-gray-400 opacity-80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 font-bold text-sm">
                        <Truck className="h-5 w-5 text-emerald-600" />
                        <span>Cash on Delivery</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedMethod === "cod" ? "border-black dark:border-white" : "border-gray-400"
                        }`}
                      >
                        {selectedMethod === "cod" && (
                          <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-[11px] text-secondary">Pay upon package delivery</span>
                    </div>
                  </div>
                </div>

                {/* Stripe Hosted Checkout Information Banner */}
                {selectedMethod === "stripe" && (
                  <div className="p-6 rounded-2xl bg-surface-container border border-outline-variant space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5 border border-indigo-200 dark:border-indigo-800">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-on-surface">
                          Official Stripe Hosted Checkout
                        </h4>
                        <p className="text-xs text-secondary leading-relaxed">
                          When you click <strong>Pay with Stripe</strong>, you will be securely redirected to Stripe&apos;s encrypted checkout page to enter your payment card details.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-outline-variant flex flex-wrap items-center justify-between gap-3 text-[11px] text-secondary">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Visa, Mastercard, American Express, Apple Pay</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase bg-surface px-2.5 py-1 rounded-md border border-outline-variant">
                        <Lock className="h-3 w-3 text-emerald-600" /> 256-bit SSL
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary & Place Order Button */}
            <div className="lg:col-span-5 space-y-6">
              <div className="lg:sticky lg:top-32 border border-outline-variant bg-background p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
                <div>
                  <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
                    Review Selection
                  </p>
                  <h3 className="font-headline text-2xl font-bold mt-1">Order Summary</h3>
                </div>

                {/* Items List */}
                <div className="divide-y divide-outline-variant max-h-72 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.key} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-14 bg-surface-container rounded-lg overflow-hidden shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-sm leading-snug line-clamp-1">{item.name}</div>
                          <div className="text-xs text-secondary mt-0.5">
                            Size {item.size} &bull; Qty {item.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-sm shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-outline-variant pt-4 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between text-secondary">
                    <span>Subtotal</span>
                    <span className="font-bold text-on-surface">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-secondary">
                    <span>Shipping</span>
                    <span className="font-bold text-on-surface">
                      {shipping === 0 ? (
                        <span className="text-emerald-600 font-bold">Free</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  <div className="border-t border-outline-variant pt-3 flex items-end justify-between">
                    <span className="font-label text-xs font-black uppercase tracking-wider">Total</span>
                    <span className="font-headline text-3xl font-black">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Place Order CTA Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-black text-white dark:bg-white dark:text-black py-4 px-6 rounded-xl font-label text-xs font-black uppercase tracking-[0.2em] hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {selectedMethod === "stripe" ? (
                    <ExternalLink className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  {loading
                    ? "Redirecting to Stripe..."
                    : selectedMethod === "stripe"
                    ? `Pay ${formatPrice(total)} with Stripe`
                    : `Place Order with COD (${formatPrice(total)})`}
                </button>

                <p className="text-center text-[10px] text-secondary uppercase font-bold tracking-wider">
                  Guaranteed safe &amp; secure checkout &bull; Instant Confirmation
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

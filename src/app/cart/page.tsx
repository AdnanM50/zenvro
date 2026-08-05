"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useCart, formatPrice } from "@/contexts/CartContext";
import {
  EASE_LUXURY,
  VIEWPORT_CONFIG,
  fadeUp,
  fadeIn,
  staggerContainer,
  staggerItem,
} from "@/lib/animations";
import { products } from "@/lib/products";

const FREE_SHIPPING_THRESHOLD = 300;
const SHIPPING_COST = 15;

export default function CartPage() {
  const { items, subtotal, count, updateQuantity, removeItem, clearCart } = useCart();

  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;
  const remainingForFree = FREE_SHIPPING_THRESHOLD - subtotal;

  const suggested = products
    .filter((p) => !items.some((i) => i.slug === p.slug))
    .slice(0, 3);

  const handleCheckout = () => {
    toast("Checkout is coming soon — watch this space.");
  };

  return (
    <main className="bg-surface text-on-surface overflow-hidden">
      {/* ─── Header ─── */}
      <section className="pt-28 md:pt-36 pb-8 px-5 md:px-10 lg:px-16">
        <div className="mx-auto max-w-[1400px]">
          <motion.p
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={0.05}
            className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary"
          >
            {"// Your selection"}
          </motion.p>

          <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.1}
              className="font-headline text-5xl font-black leading-[0.9] tracking-tight md:text-7xl lg:text-8xl"
            >
              the bag
            </motion.h1>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.15}
              className="flex items-center gap-4 pb-1"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5c00]" />
              <p className="font-label text-xs font-black uppercase tracking-[0.2em] text-secondary">
                {count} {count === 1 ? "piece" : "pieces"}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Marquee divider ─── */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        custom={0.2}
        className="border-y border-outline-variant py-3 overflow-hidden bg-background"
      >
        <div className="marquee">
          <div className="marquee-content flex items-center gap-6 font-label text-xs font-black uppercase tracking-[0.3em] text-secondary">
            <span>Selected for you</span>
            <span aria-hidden="true" className="material-symbols-outlined text-sm">local_shipping</span>
            <span>Free shipping over $300</span>
            <span aria-hidden="true" className="material-symbols-outlined text-sm">verified</span>
            <span>Authentic velour</span>
            <span aria-hidden="true" className="material-symbols-outlined text-sm">sync</span>
            <span>Easy returns</span>
            <span aria-hidden="true">Selected for you</span>
            <span aria-hidden="true" className="material-symbols-outlined text-sm">local_shipping</span>
            <span aria-hidden="true">Free shipping over $300</span>
            <span aria-hidden="true" className="material-symbols-outlined text-sm">verified</span>
            <span aria-hidden="true">Authentic velour</span>
            <span aria-hidden="true" className="material-symbols-outlined text-sm">sync</span>
            <span aria-hidden="true">Easy returns</span>
          </div>
        </div>
      </motion.div>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          {/* ─── Items + Summary ─── */}
          <section className="px-5 md:px-10 lg:px-16 py-14">
            <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
              {/* Items List */}
              <div className="lg:col-span-7">
                <div className="hidden grid-cols-12 gap-4 border-b border-outline-variant pb-3 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-secondary md:grid">
                  <span className="col-span-1" />
                  <span className="col-span-6">Product</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-2 text-right">Total</span>
                  <span className="col-span-1" />
                </div>

                <motion.div
                  variants={staggerContainer(0.08, 0.1)}
                  initial="hidden"
                  animate="visible"
                  className="divide-y divide-outline-variant border-b border-outline-variant"
                >
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.article
                        key={item.key}
                        variants={staggerItem}
                        layout
                        exit={{ opacity: 0, x: -40, height: 0, marginTop: 0, transition: { duration: 0.35, ease: EASE_LUXURY } }}
                        className="grid grid-cols-12 items-center gap-4 py-6"
                      >
                        {/* Image */}
                        <div className="col-span-3 md:col-span-1">
                          <Link href={`/products/${item.slug}`} className="block">
                            <div className="aspect-4/5 geometric-clip-product bg-surface-container overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </Link>
                        </div>

                        {/* Name / size */}
                        <div className="col-span-6 md:col-span-6">
                          <Link href={`/products/${item.slug}`} className="group inline-block">
                            <h3 className="text-base font-black tracking-tight group-hover:underline md:text-lg">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="mt-1 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
                            {item.category} / {item.year}
                          </p>
                          <p className="mt-2 inline-flex items-center gap-2 border border-outline-variant px-2.5 py-1 text-[11px] font-black uppercase tracking-widest">
                            Size {item.size}
                          </p>
                        </div>

                        {/* Quantity */}
                        <div className="col-span-3 md:col-span-2 flex items-center justify-center md:justify-center">
                          <div className="flex items-center border border-outline-variant">
                            <button
                              onClick={() => updateQuantity(item.key, item.quantity - 1)}
                              className="flex h-9 w-8 items-center justify-center text-sm font-black transition hover:bg-black hover:text-white"
                              aria-label={`Decrease quantity of ${item.name}`}
                            >
                              <span className="material-symbols-outlined text-[16px]">remove</span>
                            </button>
                            <span className="flex h-9 w-9 items-center justify-center text-sm font-black">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.key, item.quantity + 1)}
                              className="flex h-9 w-8 items-center justify-center text-sm font-black transition hover:bg-black hover:text-white"
                              aria-label={`Increase quantity of ${item.name}`}
                            >
                              <span className="material-symbols-outlined text-[16px]">add</span>
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="col-span-2 md:col-span-2 text-right">
                          <p className="text-base font-black md:text-lg">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="mt-1 text-[11px] font-bold text-secondary">
                              {formatPrice(item.price)} each
                            </p>
                          )}
                        </div>

                        {/* Remove */}
                        <div className="col-span-1 flex justify-end">
                          <button
                            onClick={() => removeItem(item.key)}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant transition hover:border-black hover:bg-black hover:text-white"
                            aria-label={`Remove ${item.name}`}
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      </motion.article>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Footer actions */}
                <div className="flex flex-col items-start justify-between gap-4 pt-6 sm:flex-row sm:items-center">
                  <Link
                    href="/#products"
                    className="inline-flex items-center gap-2 font-label text-[11px] font-black uppercase tracking-[0.18em] transition hover:opacity-60"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Continue shopping
                  </Link>
                  <button
                    onClick={clearCart}
                    className="inline-flex items-center gap-2 font-label text-[11px] font-black uppercase tracking-[0.18em] text-secondary transition hover:text-[#ff5c00]"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    Clear bag
                  </button>
                </div>
              </div>

              {/* ─── Order Summary ─── */}
              <motion.aside
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.15}
                className="lg:col-span-5"
              >
                <div className="lg:sticky lg:top-32 border border-outline-variant bg-background p-6 md:p-8">
                  <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
                    Order Summary
                  </p>
                  <h2 className="mt-3 font-headline text-3xl font-black tracking-tight md:text-4xl">
                    the total edit
                  </h2>

                  {remainingForFree > 0 && (
                    <div className="mt-6 border border-outline-variant p-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
                          Free shipping
                        </p>
                        <p className="text-xs font-black">
                          {formatPrice(remainingForFree)} away
                        </p>
                      </div>
                      <div className="mt-3 h-1 w-full bg-surface-container">
                        <div
                          className="h-full bg-[#ff5c00] transition-all duration-500"
                          style={{
                            width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-6 space-y-3 border-y border-outline-variant py-6">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-secondary">Subtotal</span>
                      <span className="text-sm font-black">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-secondary">Shipping</span>
                      <span className="text-sm font-black">
                        {shipping === 0 ? (
                          <span className="inline-flex items-center gap-1.5 text-[#ff5c00]">
                            Free
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                          </span>
                        ) : (
                          formatPrice(shipping)
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-4 pt-6">
                    <span className="font-label text-[10px] font-black uppercase tracking-[0.22em] text-secondary">
                      Total
                    </span>
                    <span className="font-headline text-4xl font-black tracking-tight md:text-5xl">
                      {formatPrice(total)}
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout}
                    className="mt-8 flex h-14 w-full items-center justify-center gap-3 bg-black px-6 font-label text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-lg dark:bg-white dark:text-black"
                  >
                    Proceed to checkout
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </motion.button>

                  <p className="mt-4 text-center font-label text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
                    Taxes calculated at checkout
                  </p>

                  <div className="mt-6 grid grid-cols-3 gap-3 border-t border-outline-variant pt-6">
                    {[
                      { icon: "local_shipping", label: "Fast delivery" },
                      { icon: "autorenew", label: "30-day returns" },
                      { icon: "verified_user", label: "Secure checkout" },
                    ].map(({ icon, label }) => (
                      <div key={label} className="flex flex-col items-center gap-2 text-center">
                        <span className="material-symbols-outlined text-[20px] text-primary-fixed">
                          {icon}
                        </span>
                        <p className="font-label text-[9px] font-bold uppercase tracking-[0.12em] text-secondary">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.aside>
            </div>
          </section>

          {/* ─── Suggested products ─── */}
          {suggested.length > 0 && (
            <section className="border-t border-outline-variant px-5 py-14 md:px-10 lg:px-16">
              <div className="mx-auto max-w-[1400px]">
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={VIEWPORT_CONFIG}
                  className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"
                >
                  <div>
                    <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
                      Complete the rotation
                    </p>
                    <h2 className="mt-3 font-headline text-4xl font-black tracking-tight md:text-5xl">
                      you might also like
                    </h2>
                  </div>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 font-label text-xs font-black uppercase tracking-[0.18em] transition hover:opacity-60"
                  >
                    View all
                    <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
                  </Link>
                </motion.div>

                <motion.div
                  variants={staggerContainer(0.1, 0)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={VIEWPORT_CONFIG}
                  className="grid grid-cols-1 gap-5 md:grid-cols-3"
                >
                  {suggested.map((product) => (
                    <motion.article key={product.slug} variants={staggerItem}>
                      <Link
                        href={`/products/${product.slug}`}
                        className="group block border border-outline-variant bg-background"
                      >
                        <div className="aspect-[4/5] overflow-hidden bg-surface-container">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-4 p-4">
                          <div>
                            <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
                              {product.category}
                            </p>
                            <h3 className="mt-2 text-xl font-black tracking-tight">
                              {product.name}
                            </h3>
                          </div>
                          <p className="text-lg font-black">{product.price}</p>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </motion.div>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

function EmptyCart() {
  return (
    <section className="relative px-5 md:px-10 lg:px-16 py-24 md:py-32">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mx-auto flex max-w-[1400px] flex-col items-center text-center"
      >
        <motion.span
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: EASE_LUXURY, delay: 0.1 }}
          className="flex h-20 w-20 items-center justify-center rounded-full border border-outline-variant bg-background text-primary-fixed"
        >
          <span className="material-symbols-outlined text-4xl">shopping_bag</span>
        </motion.span>

        <p className="mt-10 font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
          {"// Nothing here yet"}
        </p>
        <h2 className="mt-4 font-headline text-5xl font-black leading-[0.9] tracking-tight md:text-7xl">
          your bag
          <br />
          is empty
        </h2>
        <p className="mt-6 max-w-[420px] text-sm leading-7 text-secondary md:text-base">
          Fresh cuts, quiet fabrics, and limited drops — the good stuff is waiting
          in the collection.
        </p>

        <Link
          href="/#products"
          className="mt-10 inline-flex h-14 items-center gap-3 bg-black px-8 font-label text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-lg transition hover:gap-4 dark:bg-white dark:text-black"
        >
          Start shopping
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </motion.div>
    </section>
  );
}

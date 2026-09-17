'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { lenisStore } from "@/lib/lenis";

const sectionLinks = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/about" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Featured Product", href: "/#products" },
  { label: "Collections", href: "/collections" },
];

const pageLinks = [
  { label: "All Products", href: "/products" },
  { label: "Cart", href: "/cart" },
  { label: "Sign In", href: "/login" },
  { label: "Create Account", href: "/signup" },
];

const Navbar = () => {
  const { user } = useAuth();
  const { count } = useCart();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const surfaceNavRoutes = ["/products", "/cart"];
  const navBackground = surfaceNavRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
    ? "bg-surface"
    : "bg-background";

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscroll = body.style.overscrollBehavior;

    if (isMenuOpen) {
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      body.style.overscrollBehavior = "none";
      lenisStore.instance?.stop();
    } else {
      lenisStore.instance?.start();
    }

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousBodyOverscroll;
      lenisStore.instance?.start();
    };
  }, [isMenuOpen]);

  const handleMenuLinkClick = (
    href: string,
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    if (pathname === "/" && href.startsWith("/#")) {
      event.preventDefault();
      const target = document.querySelector(href.replace("/", ""));
      setIsMenuOpen(false);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setIsMenuOpen(false);
  };

  return (
    <>
      <header className={`fixed bottom-4 left-4 right-4 z-50 flex h-14 items-center justify-between px-4 rounded-full border border-outline-variant/40 shadow-2xl backdrop-blur-xl bg-background/90 text-foreground transition-all duration-300 md:static md:bottom-auto md:left-0 md:right-0 md:z-50 md:h-24 md:rounded-none md:border-none md:shadow-none md:backdrop-blur-none md:px-8 ${navBackground}`}>
        <div className="flex items-center pointer-events-auto">
          <button
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="group relative h-9 w-9 md:h-10 md:w-10 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
          >
            <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
            <span className="relative block h-4 w-6">
              <motion.span
                className="absolute left-0 top-0 h-0.5 w-6 bg-current"
                animate={isMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25 }}
              />
              <motion.span
                className="absolute left-0 top-[7px] h-0.5 w-6 bg-current"
                animate={isMenuOpen ? { opacity: 0, x: -8 } : { opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="absolute left-0 bottom-0 h-0.5 w-6 bg-current"
                animate={isMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25 }}
              />
            </span>
          </button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto">
          <Link href="/" onClick={() => setIsMenuOpen(false)}>
            <h1 className="text-lg md:text-2xl font-black tracking-tight text-foreground italic">VELOUR</h1>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          <button className="flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center hover:scale-105 transition-transform cursor-pointer">
            <span className="material-symbols-outlined text-lg sm:text-xl">search</span>
          </button>
          {count > 0 && (
            <Link
              href="/cart"
              onClick={() => setIsMenuOpen(false)}
              className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">shopping_bag</span>
              <span className="absolute -top-1 -right-1 sm:top-0 sm:right-0 min-w-4 h-4 px-1 rounded-full bg-[#ff5c00] text-white text-[10px] font-bold flex items-center justify-center">
                {count}
              </span>
            </Link>
          )}
          {user ? (
            <Link
              href={user.role === "admin" ? "/admin" : "/user-dashboard"}
              onClick={() => setIsMenuOpen(false)}
              className="flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center bg-foreground text-background rounded-full shadow-sm hover:scale-105 transition-transform cursor-pointer"
            >
              <span className="text-[10px] font-bold font-mono">{user.email?.charAt(0).toUpperCase()}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center hover:scale-105 transition-transform cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">person</span>
            </Link>
          )}
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.section
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed inset-0 z-40 overflow-y-auto overscroll-contain pb-24 pt-6 md:top-24 md:pt-10 ${navBackground} text-foreground`}
            data-lenis-prevent
          >
            <div className="flex min-h-full flex-col justify-between px-6 pb-8 pt-8 md:px-12 md:pb-12 md:pt-10 lg:px-16">
              <div className="grid gap-12 md:grid-cols-12 md:items-start">
                <nav className="md:col-span-8" aria-label="Main menu">
                  <p className="font-label text-[10px] font-black uppercase tracking-[0.28em] text-secondary">
                    {"// Navigate"}
                  </p>
                  <div className="mt-6 flex flex-col">
                    {sectionLinks.map((item, index) => (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 + index * 0.06, duration: 0.45 }}
                      >
                        <Link
                          href={item.href}
                          onClick={(event) => handleMenuLinkClick(item.href, event)}
                          className="group block border-t border-outline-variant py-3 font-headline text-4xl font-black leading-none tracking-tight transition hover:text-primary-fixed sm:text-5xl md:py-4 md:text-7xl lg:text-8xl"
                        >
                          <span className="inline-block transition-transform duration-300 group-hover:translate-x-3">
                            {item.label}
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </nav>

                <div className="md:col-span-4 md:pt-9">
                  <p className="font-label text-[10px] font-black uppercase tracking-[0.28em] text-secondary">
                    {"// Pages"}
                  </p>
                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1">
                    {pageLinks.map((item, index) => (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.22 + index * 0.05, duration: 0.35 }}
                      >
                        <Link
                          href={item.href}
                          onClick={(event) => handleMenuLinkClick(item.href, event)}
                          className="flex min-h-12 items-center justify-between border border-outline-variant px-4 font-label text-[11px] font-black uppercase tracking-[0.18em] transition hover:border-primary-fixed hover:bg-primary-fixed hover:text-white"
                        >
                          {item.label}
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </Link>
                      </motion.div>
                    ))}
                    {user && (
                      <Link
                        href={user.role === "admin" ? "/admin" : "/user-dashboard"}
                        onClick={(event) => handleMenuLinkClick(user.role === "admin" ? "/admin" : "/user-dashboard", event)}
                        className="flex min-h-12 items-center justify-between border border-outline-variant px-4 font-label text-[11px] font-black uppercase tracking-[0.18em] transition hover:border-primary-fixed hover:bg-primary-fixed hover:text-white"
                      >
                        Dashboard
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-3 border-t border-outline-variant pt-5 font-label text-[10px] font-bold uppercase tracking-[0.2em] text-secondary sm:flex-row sm:items-center sm:justify-between">
                <span>VELOUR / International Fashion</span>
                <span>Collection 2026</span>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [userOrdersCount, setUserOrdersCount] = useState<number>(0);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [userName, setUserName] = useState<string>("Customer");

  useEffect(() => {
    // Fetch orders count for navigation badge
    fetch("/api/orders")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const data = json?.data || json;
        if (Array.isArray(data)) setUserOrdersCount(data.length);
      })
      .catch(() => {});

    // Fetch wishlist count for navigation badge
    fetch("/api/wishlist")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const data = json?.data || json;
        if (Array.isArray(data)) setWishlistCount(data.length);
      })
      .catch(() => {});

    // Fetch user profile for header
    fetch("/api/user/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const data = json?.data || json;
        if (data?.name) setUserName(data.name);
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { href: "/user-dashboard", icon: "home", label: "Dashboard" },
    { href: "/user-dashboard/orders", icon: "orders", label: "Orders", badge: userOrdersCount },
    { href: "/user-dashboard/wishlist", icon: "heart", label: "Wishlist", badge: wishlistCount },
    { href: "/user-dashboard/reviews", icon: "star", label: "My Reviews" },
    { href: "/user-dashboard/settings", icon: "settings", label: "Settings" },
  ];

  return (
    <div className="flex flex-col md:flex-row w-full p-3 sm:p-4 md:p-6 gap-4 sm:gap-6 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen overflow-x-hidden">
      {/* Shared Navigation Sidebar */}
      <aside className="fixed bottom-3 left-3 right-3 md:sticky md:top-6 z-50 md:z-40 h-auto md:h-[calc(100vh-3rem)] w-auto md:w-20 md:hover:w-64 bg-white/90 dark:bg-gray-900/90 md:bg-white md:dark:bg-gray-900 backdrop-blur-md md:backdrop-blur-none border border-gray-200 dark:border-gray-800 rounded-full md:rounded-3xl flex flex-row md:flex-col items-center justify-between p-2 md:py-6 shadow-xl md:shadow-xs transition-all duration-300 ease-in-out shrink-0 group">
        <div className="flex flex-row md:flex-col items-center gap-2 md:gap-8 w-full justify-between md:justify-start">
          <Link
            href="/"
            className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-full md:rounded-xl flex items-center justify-center font-bold text-lg md:text-xl shrink-0 shadow-sm hover:scale-105 transition-transform"
          >
            S
          </Link>
          <nav className="flex flex-row md:flex-col gap-1 md:gap-4 overflow-x-auto md:overflow-visible py-1 no-scrollbar w-full justify-around md:justify-start">
            {navItems.map((item) => {
              const isActive =
                item.href === "/user-dashboard"
                  ? pathname === "/user-dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-10 h-10 md:w-12 md:h-12 md:group-hover:w-full flex items-center justify-center md:justify-start md:px-3 rounded-full transition-all duration-300 shrink-0 relative ${
                    isActive
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-md"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500"
                  }`}
                  title={item.label}
                >
                  <NavIcon name={item.icon} />
                  <span className="hidden md:group-hover:inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-3 font-medium whitespace-nowrap text-sm">
                    {item.label}
                  </span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 md:top-1 md:right-2 w-4 h-4 bg-violet-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="hidden md:flex flex-col items-center gap-2 shrink-0">
          <ThemeToggle variant="toggle" />
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col gap-6 overflow-y-auto min-w-0 pb-20 md:pb-0">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-transparent pt-1">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <span className="text-gray-400 font-medium text-lg sm:text-base">
              Shoplytix / {pathname.split("/").pop()?.toUpperCase() || "DASHBOARD"}
            </span>
            <div className="md:hidden">
              <ThemeToggle variant="toggle" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full shadow-sm focus:ring-2 focus:ring-violet-500 text-sm"
                placeholder="Search..."
                type="text"
              />
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <div className="flex items-center gap-2">
                <Link
                  href="/user-dashboard/orders"
                  className="p-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full shadow-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 relative"
                  title="My Orders"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </Link>
              </div>
              <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-gray-200 dark:border-gray-800">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold leading-tight truncate max-w-[120px]">
                    {userName}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-400">Customer</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}

function NavIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    home: (
      <path
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    ),
    orders: (
      <path
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    ),
    heart: (
      <path
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    ),
    star: (
      <path
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    ),
    settings: (
      <path
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    ),
  };
  return (
    <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {icons[name] || icons.home}
    </svg>
  );
}

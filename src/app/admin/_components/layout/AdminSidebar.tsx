"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Box,
  Boxes,
  ChevronDown,
  ChevronLeft,
  CreditCard,
  FileText,
  Home,
  Images,
  LogOut,
  Megaphone,
  MoreHorizontal,
  MessageSquare,
  Quote,
  Search,
  Settings,
  ShoppingCart,
  Star,
  TicketPercent,
  User,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

type NavItemType = {
  label: string;
  icon?: LucideIcon;
  href?: string;
  active?: boolean;
  badge?: number;
  children?: NavItemType[];
};

const navItems: NavItemType[] = [
  { label: "Dashboard", icon: Home, href: "/admin" },
  { label: "Profile", icon: User, href: "/admin/profile" },
  {
    label: "Products",
    icon: Box,
    children: [
      { label: "Products", href: "/admin/products" },
      { label: "Categories", href: "/admin/categories" },
      { label: "Brands", href: "/admin/brands" },
      { label: "Collections", href: "/admin/collections" },
      { label: "Tags", href: "/admin/tags" },
      { label: "Attributes", href: "/admin/attributes" },
      { label: "Variants", href: "/admin/variants" },
    ],
  },
  { label: "Orders", icon: ShoppingCart, href: "/admin/orders" },
  { label: "Customers", icon: Users, href: "#" },
  { label: "Users", icon: Users, href: "/admin/users" },
  { label: "Reviews", icon: Star, href: "/admin/reviews" },
  { label: "Testimonials", icon: Quote, href: "/admin/testimonials" },
  { label: "Contact", icon: MessageSquare, href: "/admin/contact" },
  { label: "Coupons", icon: TicketPercent, href: "/admin/coupons" },
  { label: "Inventory", icon: Boxes, href: "/admin/inventory" },
  {
    label: "Marketing",
    icon: Megaphone,
    children: [
      { label: "Overview", href: "/admin/marketing" },
      { label: "Home Sections", href: "/admin/marketing/home-sections" },
      { label: "Popup Banners", href: "/admin/marketing/popups" },
      { label: "Flash Sales", href: "/admin/marketing/flash-sales" },
    ],
  },
  { label: "CMS", icon: FileText, href: "/admin/cms/pages" },
  {
    label: "SEO",
    icon: Search,
    children: [
      { label: "Global SEO", href: "/admin/seo/settings" },
      { label: "Redirects", href: "/admin/seo/redirects" },
      { label: "Robots.txt", href: "/admin/seo/robots" },
      { label: "Sitemap", href: "/admin/seo/sitemap" },
      { label: "Analytics", href: "/admin/seo/analytics" },
    ],
  },
  { label: "Reports", icon: BarChart3, href: "/admin/reports" },
  { label: "Media Library", icon: Images, href: "/admin/gallery" },
  {
    label: "Payments",
    icon: CreditCard,
    children: [
      { label: "Payment History", href: "/admin/payment-history" },
      { label: "Payment Methods", href: "/admin/payment-methods" },
    ],
  },
  { label: "Settings", icon: Settings, href: "#" },
];

const NavItem = ({
  item,
  depth = 0,
  isCollapsed = false,
  isCollapsing = false,
}: {
  item: NavItemType;
  depth?: number;
  isCollapsed?: boolean;
  isCollapsing?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;
  const showChildren = isOpen && !isCollapsing;

  if (isCollapsed) {
    return (
      <li className="relative group flex justify-center py-0.5">
        <Link
          href={item.href || "#"}
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ease-in-out relative
            ${
              item.active
                ? "bg-black text-white shadow-md shadow-black/20 dark:bg-white dark:text-black"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/80"
            }
          `}
        >
          {Icon && <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />}
          {item.badge && (
            <span className="absolute -top-1 -right-1 text-[9px] w-4 h-4 flex items-center justify-center rounded-full bg-orange-500 text-white font-bold">
              {item.badge}
            </span>
          )}
        </Link>

        {/* Smooth Hover Flyout for Collapsed Sidebar */}
        <div className="absolute left-full top-0 ml-3 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto -translate-x-1 group-hover:translate-x-0 transition-all duration-200 ease-out z-50 min-w-[190px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl p-2 py-2.5">
          <div className="px-3 py-1 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 mb-1 pb-1.5 flex items-center justify-between">
            <span>{item.label}</span>
            {item.badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500 text-white">
                {item.badge}
              </span>
            )}
          </div>
          {hasChildren ? (
            <ul className="space-y-0.5">
              {item.children!.map((child) => (
                <li key={child.label}>
                  <Link
                    href={child.href || "#"}
                    className="block px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-150"
                  >
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Link
              href={item.href || "#"}
              className="block px-3 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              Open {item.label}
            </Link>
          )}
        </div>
      </li>
    );
  }

  return (
    <li className="space-y-0.5">
      <Link
        href={item.href || "#"}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={`
          flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ease-in-out
          ${
            item.active
              ? "bg-black text-white shadow-lg shadow-black/20 dark:bg-white dark:text-black"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60"
          }
        `}
        style={{ paddingLeft: depth > 0 ? `${depth * 1.5 + 0.875}rem` : undefined }}
      >
        {Icon && <Icon className="h-4 w-5 shrink-0" strokeWidth={2.2} />}
        <span
          className={`font-medium text-sm flex-1 truncate transition-all duration-300 ease-in-out ${
            isCollapsing ? "max-w-0 opacity-0 -translate-x-1" : "max-w-[150px] opacity-100 translate-x-0"
          }`}
        >
          {item.label}
        </span>
        {item.badge && (
          <span
            className={`text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-semibold transition-all duration-300 ease-in-out ${
              isCollapsing ? "scale-75 opacity-0" : "scale-100 opacity-100"
            } ${
              item.active
                ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                : "bg-orange-500 text-white"
            }`}
          >
            {item.badge}
          </span>
        )}
        {hasChildren && (
          <ChevronDown
            className={`h-3.5 w-3.5 opacity-70 ml-1 transition-transform duration-300 ease-in-out ${
              showChildren ? "rotate-180" : ""
            } ${
              isCollapsing ? "scale-75 opacity-0" : "scale-100 opacity-70"
            }`}
          />
        )}
      </Link>
      {hasChildren && (
        <div
          className={`grid transition-[grid-template-rows,opacity,transform] duration-300 ease-out ${
            showChildren
              ? "grid-rows-[1fr] opacity-100 translate-y-0"
              : "grid-rows-[0fr] opacity-0 -translate-y-1"
          }`}
        >
          <div className="overflow-hidden">
            <ul className="mt-0.5 space-y-0.5">
              {item.children!.map((child) => (
                <NavItem
                  key={child.label}
                  item={child}
                  depth={depth + 1}
                  isCollapsed={isCollapsed}
                  isCollapsing={isCollapsing}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
};

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function AdminSidebar({
  open,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isCollapseSettled, setIsCollapseSettled] = useState(isCollapsed);
  const renderCollapsedRail = isCollapsed && isCollapseSettled;
  const isCollapsing = isCollapsed && !isCollapseSettled;

  useEffect(() => {
    if (!isCollapsed) return;

    const timeout = window.setTimeout(() => setIsCollapseSettled(true), 280);
    return () => window.clearTimeout(timeout);
  }, [isCollapsed]);

  const handleToggleCollapse = () => {
    setIsCollapseSettled(false);
    onToggleCollapse?.();
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const displayName = user?.name || "Noah Bellingham";
  const displayEmail = user?.email || "admin@gmail.com";
  const userInitial = displayName[0]?.toUpperCase() || "A";

  return (
    <aside
      data-lenis-prevent
      className={`
        fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800
        flex flex-col justify-between relative
        transition-all duration-300 ease-in-out
        lg:static lg:translate-x-0 lg:h-full lg:shrink-0
        ${open ? "translate-x-0" : "-translate-x-full"}
        ${isCollapsed ? "w-72 lg:w-[70px] p-3" : "w-72 lg:w-64 p-5 lg:p-6"}
      `}
    >
      {/* Floating Border Toggle Button placed exact at user's marked position */}
      {onToggleCollapse && (
        <button
          type="button"
          className="hidden lg:flex items-center justify-center w-6 h-6 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white shadow-md hover:scale-110 active:scale-95 transition-all duration-300 ease-in-out absolute -right-3 top-[72px] z-30 cursor-pointer"
          onClick={handleToggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={`h-3.5 w-3.5 transition-transform duration-300 ease-in-out ${
              isCollapsed ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
      )}

      {/* Sticky Brand Header (Sticky at top) */}
      <div
        className={`shrink-0 z-20 bg-white dark:bg-gray-950 pb-4 border-b border-gray-100 dark:border-gray-800/80 mb-3 flex items-center ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
            V
          </div>
          {!renderCollapsedRail && (
            <div
              className={`flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
                isCollapsed ? "max-w-0 opacity-0 -translate-x-1" : "max-w-[160px] opacity-100 translate-x-0"
              }`}
            >
              <span className="font-extrabold text-sm tracking-wider uppercase text-gray-900 dark:text-white leading-none whitespace-nowrap">
                VELORA
              </span>
              <span className="text-[10px] text-gray-400 font-medium mt-0.5 whitespace-nowrap">
                Admin Panel
              </span>
            </div>
          )}
        </Link>

        {/* Mobile close button */}
        <button
          className="lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Scrollable Navigation Menu */}
      <div className="overflow-y-auto flex-1 min-h-0 -mr-2 pr-2" data-lenis-prevent>
        <div className="mb-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.label}
                item={item}
                isCollapsed={renderCollapsedRail}
                isCollapsing={isCollapsing}
              />
            ))}
            <li>
              {renderCollapsedRail ? (
                <div className="relative group flex justify-center py-0.5">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 ease-in-out cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5 shrink-0" strokeWidth={2} />
                  </button>
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 ease-out z-50 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap">
                    Logout
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 px-3.5 py-2.5 rounded-xl transition-all duration-200 ease-in-out mt-2 cursor-pointer"
                >
                  <LogOut className="h-4 w-5 shrink-0" strokeWidth={2.2} />
                  <span
                    className={`font-medium text-sm truncate transition-all duration-300 ease-in-out ${
                      isCollapsing ? "max-w-0 opacity-0 -translate-x-1" : "max-w-[150px] opacity-100 translate-x-0"
                    }`}
                  >
                    Logout
                  </span>
                </button>
              )}
            </li>
          </ul>
        </div>
      </div>

      {/* Sticky Bottom User Profile */}
      <div className="shrink-0 pt-3 border-t border-gray-100 dark:border-gray-800 mt-2">
        {renderCollapsedRail ? (
          <div className="relative group flex justify-center">
            <Link
              href="/admin/profile"
              className="w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold flex items-center justify-center text-sm shadow-xs transition-transform duration-200 ease-in-out hover:scale-105"
            >
              {userInitial}
            </Link>
            <div className="absolute left-full bottom-0 ml-3 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto -translate-x-1 group-hover:translate-x-0 transition-all duration-200 ease-out z-50 min-w-[170px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl p-3">
              <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {displayName}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate mb-2">
                {displayEmail}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left text-xs font-medium text-red-600 dark:text-red-400 hover:underline pt-1.5 border-t border-gray-100 dark:border-gray-800"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <Link
            href="/admin/profile"
            className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-900/60 p-2 rounded-xl transition-all duration-200 ease-in-out"
          >
            <div className="w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
              {userInitial}
            </div>
            <div
              className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${
                isCollapsing ? "max-w-0 opacity-0 -translate-x-1" : "max-w-[160px] opacity-100 translate-x-0"
              }`}
            >
              <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {displayName}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
                <span className="truncate">{displayEmail}</span>
              </div>
            </div>
            <MoreHorizontal
              className={`h-5 w-5 text-gray-400 shrink-0 transition-all duration-300 ease-in-out ${
                isCollapsing ? "scale-75 opacity-0" : "scale-100 opacity-100"
              }`}
            />
          </Link>
        )}
      </div>
    </aside>
  );
}

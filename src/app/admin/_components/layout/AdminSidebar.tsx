"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Box,
  Boxes,
  ChevronDown,
  FileText,
  Home,
  Images,
  Lock,
  LogOut,
  Megaphone,
  MoreHorizontal,
  MoreVertical,
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
  { label: "Orders", icon: ShoppingCart, href: "#" },
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
  { label: "Reports", icon: BarChart3, href: "#" },
  { label: "Media Library", icon: Images, href: "/admin/gallery" },
  { label: "Settings", icon: Settings, href: "#" },
];

const NavItem = ({ item, depth = 0 }: { item: NavItemType; depth?: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

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
          flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150
          ${
            item.active
              ? "bg-black text-white shadow-lg shadow-black/20"
              : "text-gray-600 hover:bg-gray-50"
          }
        `}
        style={{ paddingLeft: depth > 0 ? `${depth * 1.5 + 0.875}rem` : undefined }}
      >
        {Icon && <Icon className="h-4 w-5 shrink-0" strokeWidth={2.2} />}
        <span className="font-medium text-sm flex-1">{item.label}</span>
        {item.badge && (
          <span
            className={`text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-semibold ${
              item.active
                ? "bg-white/20 text-white"
                : "bg-orange-500 text-white"
            }`}
          >
            {item.badge}
          </span>
        )}
        {hasChildren && (
          <ChevronDown
            className={`h-3.5 w-3.5 opacity-70 ml-1 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </Link>
      {hasChildren && (
        <div
          className={`grid transition-[grid-template-rows,opacity,transform] duration-300 ease-out ${
            isOpen
              ? "grid-rows-[1fr] opacity-100 translate-y-0"
              : "grid-rows-[0fr] opacity-0 -translate-y-1"
          }`}
        >
          <div className="overflow-hidden">
            <ul className="mt-0.5 space-y-0.5">
              {item.children!.map((child) => (
                <NavItem key={child.label} item={child} depth={depth + 1} />
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
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const [menuOpen, setMenuOpen] = useState(true);
  const { user, logout } = useAuth();
  const router = useRouter();

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
        fixed inset-y-0 left-0 z-50 w-72 h-full bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800
        flex flex-col justify-between p-5
        transform transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 lg:w-64 lg:h-full lg:p-6 lg:shrink-0
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div className="overflow-y-auto flex-1 min-h-0 -mr-2 pr-2" data-lenis-prevent>
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
              V
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-sm tracking-wider uppercase text-gray-900 dark:text-white leading-none">
                VELORA
              </span>
              <span className="text-[10px] text-gray-400 font-medium mt-0.5">
                Admin Panel
              </span>
            </div>
          </Link>
          <button
            className="lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Greeting */}
        <div className="mb-6 pb-4 border-b border-gray-100 dark:border-gray-800/80">
          <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-0.5">
            Store Overview
          </div>
          <h1 className="text-lg font-bold leading-tight text-gray-900 dark:text-white">
            Welcome, {displayName.split(" ")[0]} <span role="img" aria-label="wave">&#128075;</span>
          </h1>
        </div>

        {/* Menu Section */}
        <div className="mb-6 lg:mb-8">
          <button
            className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 tracking-wider mb-3 flex justify-between items-center w-full"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            MENU
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-300 ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`grid transition-[grid-template-rows,opacity,transform] duration-300 ease-out ${
              menuOpen
                ? "grid-rows-[1fr] opacity-100 translate-y-0"
                : "grid-rows-[0fr] opacity-0 -translate-y-1"
            }`}
          >
            <div className="overflow-hidden">
              <ul className="space-y-0.5">
                {navItems.map((item) => (
                  <NavItem key={item.label} item={item} />
                ))}
                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 px-3.5 py-2.5 rounded-xl transition-colors mt-2 cursor-pointer"
                  >
                    <LogOut className="h-4 w-5 shrink-0" strokeWidth={2.2} />
                    <span className="font-medium text-sm">Logout</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* User Profile Bottom */}
      <Link
        href="/admin/profile"
        className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-5 shrink-0 hover:bg-gray-50 dark:hover:bg-gray-900/60 p-2 rounded-xl transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
          {userInitial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
            {displayName}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
            <span className="truncate">{displayEmail}</span>
          </div>
        </div>
        <MoreHorizontal className="h-5 w-5 text-gray-400 shrink-0" />
      </Link>
    </aside>
  );
}

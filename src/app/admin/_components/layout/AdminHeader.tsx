"use client";

import ThemeToggle from '@/components/ui/ThemeToggle';
import AdminNotificationMenu from './AdminNotificationMenu';

interface AdminHeaderProps {
  onOpenSidebar: () => void;
}

export default function AdminHeader({ onOpenSidebar }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 shrink-0 flex items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800/80">
      {/* Mobile hamburger & Search Area */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white p-2 -ml-2 shrink-0 cursor-pointer"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
        >
          <i className="fas fa-bars text-lg" />
        </button>

        {/* Search Input */}
        <div className="relative flex-1">
          <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full py-2 pl-10 pr-10 sm:pr-12 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 transition-shadow"
            placeholder="Search here..."
            type="text"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-2 text-xs text-gray-400">
            <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[10px] font-medium">&#8984;S</span>
            <button aria-label="Filter" className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <i className="fas fa-sliders-h" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Actions: Theme Toggle & Real-time Notification Module */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <ThemeToggle variant="buttons" />
        <AdminNotificationMenu />
      </div>
    </header>
  );
}

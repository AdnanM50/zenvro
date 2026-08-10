"use client";

import { useState } from "react";
import AdminSidebar from "@/app/admin/_components/layout/AdminSidebar";
import AdminHeader from "@/app/admin/_components/layout/AdminHeader";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-full bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200 overflow-hidden">
      <div
        className="max-w-[1440px] mx-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden flex h-full border-x border-gray-200 dark:border-gray-800 shadow-sm relative"
      >
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <AdminHeader onOpenSidebar={() => setSidebarOpen(true)} />

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 " data-lenis-prevent>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

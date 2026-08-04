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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div
        className="max-w-[1440px] mx-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden flex min-h-[calc(100vh-2rem)] lg:min-h-[900px] border-x border-gray-200 dark:border-gray-800 shadow-sm"
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
        <main className="flex-1 flex flex-col min-w-0 min-h-[calc(100vh-2rem)] lg:min-h-0">
          <AdminHeader onOpenSidebar={() => setSidebarOpen(true)} />

          {/* Page Content */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

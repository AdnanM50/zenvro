"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAF9] p-3 sm:p-4 lg:p-5">
      <div
        className="max-w-[1440px] mx-auto bg-white rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden flex min-h-[calc(100vh-2rem)] lg:min-h-[900px]"
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

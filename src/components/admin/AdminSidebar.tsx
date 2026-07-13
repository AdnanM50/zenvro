"use client";

import { useState } from "react";

const mainNavItems = [
  { label: "Dashboard", icon: "fas fa-home", href: "#", active: true },
  { label: "Products", icon: "fas fa-box", href: "#", badge: 4 },
  { label: "Orders & Invoices", icon: "fas fa-file-invoice", href: "#", badge: 6 },
  { label: "Sales Analytics", icon: "fas fa-chart-line", href: "#" },
  { label: "Customer Insights", icon: "fas fa-lightbulb", href: "#" },
  { label: "Reports", icon: "fas fa-file-alt", href: "#", badge: 2 },
];

const otherNavItems = [
  { label: "Settings", icon: "fas fa-cog", href: "#" },
  { label: "Team Members", icon: "fas fa-users", href: "#", badge: 3 },
  { label: "Help Center", icon: "fas fa-question-circle", href: "#" },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const [menuOpen, setMenuOpen] = useState(true);
  const [othersOpen, setOthersOpen] = useState(true);

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100
        flex flex-col justify-between p-5
        transform transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 lg:w-64 lg:p-6 lg:shrink-0
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div className="overflow-y-auto flex-1 -mr-2 pr-2">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 lg:mb-10">
          <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
            V
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-base lg:text-lg flex items-center gap-2">
              <span className="truncate">Teknova Store</span>
              <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-gray-500 flex items-center gap-1">
              <i className="fas fa-lock text-[10px]" /> Private
            </div>
          </div>
          <button
            className="lg:hidden text-gray-400 hover:text-gray-600 p-1 -mr-1"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <i className="fas fa-times text-lg" />
          </button>
          <i className="fas fa-ellipsis-v text-gray-400 ml-auto cursor-pointer hidden lg:block" />
        </div>

        {/* Greeting */}
        <div className="mb-6 lg:mb-8">
          <div className="text-[11px] text-gray-400 mb-1">
            Teknova Store &gt; Dashboard
          </div>
          <h1 className="text-xl lg:text-2xl font-bold leading-tight">
            Welcome Back,<br />
            Noah Bellingham <span role="img" aria-label="wave">&#128075;</span>
          </h1>
        </div>

        {/* Menu Section 1 */}
        <div className="mb-6 lg:mb-8">
          <button
            className="text-[11px] font-semibold text-gray-400 tracking-wider mb-3 flex justify-between items-center w-full"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            MENU
            <i className={`fas fa-chevron-${menuOpen ? "up" : "down"} transition-transform`} />
          </button>
          {menuOpen && (
            <ul className="space-y-0.5">
              {mainNavItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150
                      ${
                        item.active
                          ? "bg-black text-white shadow-lg shadow-black/20"
                          : "text-gray-600 hover:bg-gray-50"
                      }
                    `}
                  >
                    <i className={`${item.icon} w-5 text-center text-sm`} />
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`ml-auto text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-semibold ${
                          item.active
                            ? "bg-white/20 text-white"
                            : "bg-orange-500 text-white"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Menu Section 2 */}
        <div>
          <button
            className="text-[11px] font-semibold text-gray-400 tracking-wider mb-3 flex justify-between items-center w-full"
            onClick={() => setOthersOpen(!othersOpen)}
          >
            OTHERS
            <i className={`fas fa-chevron-${othersOpen ? "up" : "down"} transition-transform`} />
          </button>
          {othersOpen && (
            <ul className="space-y-0.5">
              {otherNavItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 px-3.5 py-2.5 rounded-xl transition-colors"
                  >
                    <i className={`${item.icon} w-5 text-center text-sm`} />
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-orange-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#"
                  className="flex items-center gap-3 text-gray-600 hover:bg-red-50 hover:text-red-600 px-3.5 py-2.5 rounded-xl transition-colors mt-1"
                >
                  <i className="fas fa-sign-out-alt w-5 text-center text-sm" />
                  <span className="font-medium text-sm">Logout</span>
                </a>
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* User Profile Bottom */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-5 shrink-0">
        <img
          alt="User Avatar"
          className="w-10 h-10 rounded-full shrink-0 object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDa1xDcspgxj2FSQ74NfSLrT4HWcBvcD72IIYy2JfXutd5H0GOkbZ-WDA0bCGuNv14qVNYAipF4ZCCl_tkZFqBRh1u7cYVdRGYvUjizlygZp87cWIGTnXG_IclEAyEFNxUCIjXBKmDMnOTHzM03KxxupLbFchUzNU1u3wfC30jyeBqFbJQHUvJfzoWOHHO-q_HVOfU3nNvj9UZBkBJxOzyNF8PzqD5BUMIH0FBb4ppEpX1ouEBoCXSqxg"
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-gray-900 truncate">
            Noah Bellingham
          </div>
          <div className="text-[11px] text-gray-500 flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
            <span className="truncate">noah@gmail.com</span>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 cursor-pointer shrink-0 p-1" aria-label="More options">
          <i className="fas fa-ellipsis-h" />
        </button>
      </div>
    </aside>
  );
}

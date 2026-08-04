"use client";

import ThemeToggle from "@/components/ui/ThemeToggle";

export default function UserDashboardPage() {
  return (
    <div className="flex w-full p-4 gap-4 overflow-y-auto bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen">
      {/* Sidebar */}
      <aside className="group w-20 hover:w-64 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl flex flex-col items-center py-6 shadow-xs justify-between z-50 transition-all duration-300 ease-in-out">
        <div className="flex flex-col items-center gap-8 w-full px-4">
          <div className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center font-bold text-xl shrink-0">
            S
          </div>
          <nav className="flex flex-col gap-6 w-full">
            {[
              { icon: "home", label: "Dashboard", active: true },
              { icon: "analytics", label: "Analytics" },
              { icon: "customers", label: "Customers" },
              { icon: "orders", label: "Orders" },
              { icon: "inventory", label: "Inventory" },
              { icon: "settings", label: "Settings" },
            ].map((item) => (
              <button
                key={item.label}
                className={`w-12 group-hover:w-full h-12 flex items-center justify-start pl-3 group-hover:pl-5 rounded-full transition-all duration-300 ${
                  item.active
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-lg"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500"
                }`}
              >
                <NavIcon name={item.icon} />
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-4 font-medium whitespace-nowrap text-sm">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
        </div>
        <div className="flex flex-col items-center gap-2">
          <ThemeToggle variant="toggle" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-6 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center bg-transparent pt-2">
          <div className="flex items-center gap-4">
            <span className="text-gray-400 font-medium">Shoplytix</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-white border-none rounded-full shadow-sm focus:ring-2 focus:ring-violet-500"
                placeholder="Search..."
                type="text"
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:bg-gray-50">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </button>
              <button className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:bg-gray-50">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                  <path
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l">
                <img
                  alt="Ethan Carter"
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCG2eoqwj6oj53OyKIk8mUEclYCboSZtP6Hb48TcaNpl1T9HmC2L4TczLnUTAe6ChlHC6M898oY1uNzMzi65S3Z_JhVT2EqtqumaWhhuvci_iA6DxIMvfKTgYK4ZAsux19wWZ3FgIoTHGsiOViOjS8oYITfqF8G4EbOzPbRjxNF1yzh9s6hv7e83ips2LM6HPfIF1BGBMJcwi8DEZA9ohbmDAWsTxf53Hkz82hVR3MEPiFjrte4jsqM4w"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold leading-tight">
                    Ethan Carter
                  </span>
                  <span className="text-xs text-gray-400">Owner</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="grid grid-cols-12 gap-6">
          <div className="col-span-4 flex flex-col justify-center">
            <h1 className="text-4xl font-bold mb-4">
              Welcome back, Ethan!
            </h1>
            <p className="text-gray-500 max-w-xs">
              Track your orders, manage your profile, and see your rewards.
            </p>
            <div className="mt-12 flex gap-12">
              <div>
                <p className="text-gray-400 text-sm mb-1">Active Orders</p>
                <p className="text-xl font-bold">2</p>
              </div>
              <div className="border-l pl-8">
                <p className="text-gray-400 text-sm mb-1">Loyalty Points</p>
                <p className="text-xl font-bold">1,250</p>
              </div>
            </div>
          </div>
          <div className="col-span-8 relative h-[300px] flex items-end justify-center overflow-hidden">
            <div
              className="absolute bottom-0 w-[500px] h-[250px] border-t border-gray-200"
              style={{
                background:
                  "radial-gradient(circle at 50% 100%, rgba(139, 92, 246, 0.1) 0%, rgba(255, 255, 255, 0) 70%)",
                borderTopLeftRadius: "50% 100%",
                borderTopRightRadius: "50% 100%",
              }}
            >
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
                <p className="text-gray-500 text-sm font-medium">
                  Reward Progress
                </p>
                <h2 className="text-5xl font-bold mt-1">$46,354.00</h2>
              </div>

              {/* Floating Card 1 */}
              <div className="absolute -left-10 top-20 bg-white p-4 rounded-2xl shadow-lg flex flex-col gap-1 w-40">
                <p className="text-gray-400 text-xs font-semibold">
                  Total Savings
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">$450.00</span>
                  <span className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    Saved
                  </span>
                </div>
                <div className="absolute -right-2 -bottom-2 w-4 h-4 bg-violet-400 rounded-full border-2 border-white shadow-sm" />
              </div>

              {/* Floating Card 2 */}
              <div className="absolute left-32 -top-4 bg-white p-4 rounded-2xl shadow-lg flex flex-col gap-1 w-40">
                <p className="text-gray-400 text-xs font-semibold">
                  Total Purchased
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">42</span>
                  <span className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    Items
                  </span>
                </div>
                <div className="absolute -right-2 -bottom-2 w-4 h-4 bg-violet-400 rounded-full border-2 border-white shadow-sm" />
              </div>

              {/* Floating Card 3 */}
              <div className="absolute -right-10 top-24 bg-white p-4 rounded-2xl shadow-lg flex flex-col gap-1 w-40">
                <p className="text-gray-400 text-xs font-semibold">
                  Conversion Rate
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">3.8%</span>
                  <span className="bg-rose-100 text-rose-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    ↘-0.4%
                  </span>
                </div>
                <div className="absolute -left-2 -bottom-2 w-4 h-4 bg-blue-400 rounded-full border-2 border-white shadow-sm" />
              </div>

              {/* Arch SVG */}
              <svg
                className="absolute top-0 left-0 w-full h-full"
                fill="none"
                viewBox="0 0 500 250"
              >
                <path
                  d="M50,250 C50,110 450,110 450,250"
                  stroke="#DDD"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <circle cx="250" cy="80" fill="#8B5CF6" r="4" />
                <path
                  d="M250,80 C320,80 430,130 450,250"
                  stroke="#8B5CF6"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </section>

        {/* Bottom Grid */}
        <section className="grid grid-cols-12 gap-6 mb-4">
          {/* Spending History */}
          <div className="col-span-4 bg-white p-6 rounded-[2.5rem] shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Spending History</h3>
              <button className="bg-gray-50 text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-2">
                Monthly{" "}
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M19 9l-7 7-7-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>
            <div className="flex items-end justify-between h-40 gap-2 px-2">
              {[
                { h: "h-8", active: false, label: "Jan" },
                { h: "h-28", active: true, label: "Feb" },
                { h: "h-16", active: false, label: "Mar" },
                { h: "h-24", active: false, label: "Apr" },
                { h: "h-20", active: true, label: "May" },
                { h: "h-22", active: false, label: "Jun" },
              ].map((bar) => (
                <div
                  key={bar.label}
                  className="flex flex-col items-center flex-1 gap-2"
                >
                  <div
                    className={`w-full rounded-lg flex-1 ${
                      bar.active ? "bg-violet-300" : "bg-gray-50"
                    }`}
                    style={{ height: bar.h === "h-22" ? "5.5rem" : undefined }}
                  />
                  <span className="text-[10px] text-gray-400 font-bold uppercase">
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Favorite Categories */}
          <div className="col-span-4 bg-white p-6 rounded-[2.5rem] shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Favorite Categories</h3>
              <button className="text-gray-400">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              {[
                { name: "Electronics", pct: 85, active: true },
                { name: "Fashion", pct: 60 },
                { name: "Home", pct: 45 },
                { name: "Beauty", pct: 20 },
              ].map((cat) => (
                <div key={cat.name} className="flex items-center gap-4">
                  <span className="w-24 text-xs font-semibold text-gray-500">
                    {cat.name}
                  </span>
                  <div className="flex-1 bg-gray-50 h-4 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        cat.active
                          ? "bg-gradient-to-r from-violet-200 to-violet-400"
                          : "bg-gray-200"
                      }`}
                      style={{ width: `${cat.pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold w-10">{cat.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Purchases */}
          <div className="col-span-4 bg-white p-6 rounded-[2.5rem] shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Recent Purchases</h3>
              <button className="text-gray-400">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              {[
                {
                  name: "Wireless Headphones",
                  amount: "1,240",
                  bg: "bg-indigo-100",
                  fill: "text-indigo-600",
                  icon: (
                    <path
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  ),
                },
                {
                  name: "Smart Watch",
                  amount: "1,100",
                  bg: "bg-blue-100",
                  fill: "text-blue-600",
                  icon: (
                    <path
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  ),
                },
                {
                  name: "Bluetooth Speaker",
                  amount: "650",
                  bg: "bg-cyan-100",
                  fill: "text-cyan-600",
                  icon: (
                    <path
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  ),
                },
              ].map((product) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-1 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 ${product.bg} rounded-lg flex items-center justify-center`}
                    >
                      <svg
                        className={`w-6 h-6 ${product.fill}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {product.icon}
                      </svg>
                    </div>
                    <span className="text-sm font-semibold">
                      {product.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold">{product.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
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
    analytics: (
      <path
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    ),
    customers: (
      <path
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
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
    inventory: (
      <path
        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
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
  }
  return (
    <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {icons[name] || icons.home}
    </svg>
  )
}

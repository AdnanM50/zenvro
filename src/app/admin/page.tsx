export default function AdminDashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 flex-1">
      {/* Left Column (Span 2 on desktop) */}
      <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
        {/* Profit Overview Chart */}
        <div className="bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 text-gray-900 dark:text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-soft relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-green-100 dark:bg-green-950/40 rounded-full blur-3xl opacity-50 -mr-20 -mt-20" />

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 sm:mb-6 relative z-10">
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 mb-2 text-gray-900 dark:text-white">
                <i className="fas fa-chart-bar text-gray-400" /> Total Profit
                Overview
              </h2>
              <div className="text-2xl sm:text-4xl font-black mb-1 text-gray-900 dark:text-white">$ 110,450</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <span className="text-green-500 font-semibold inline-flex items-center gap-1">
                  <i className="fas fa-arrow-up text-[10px]" /> $10,250
                </span>{" "}
                Compare to last month
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-2 border border-gray-100 dark:border-gray-700">
                Month <i className="fas fa-chevron-down text-[10px]" />
              </button>
              <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                <i className="fas fa-sliders-h text-sm" />
              </button>
              <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                <i className="fas fa-ellipsis-h text-sm" />
              </button>
            </div>
          </div>

          {/* Chart Area */}
          <div className="h-56 sm:h-64 lg:h-80 relative z-10 mt-6 sm:mt-10">
            {/* Y Axis */}
            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] sm:text-xs text-gray-400">
              <span>120K</span>
              <span>90K</span>
              <span>60K</span>
              <span>30K</span>
              <span>0K</span>
            </div>

            {/* Bars */}
            <div className="ml-8 sm:ml-10 h-full flex items-end justify-between pb-8 pt-4 px-1 sm:px-2">
              {[
                { h: "40%", pct: "+8%", color: "bg-green-500" },
                { h: "25%", pct: "-5%", color: "bg-red-500" },
                { h: "60%", pct: "+3%", color: "bg-green-500" },
                {
                  h: "85%",
                  pct: "+12%",
                  color: "bg-green-500",
                  active: true,
                },
                { h: "35%", pct: "-10%", color: "bg-red-500" },
                { h: "70%", pct: "+5%", color: "bg-green-500" },
                { h: "90%", pct: "+3%", color: "bg-green-500" },
              ].map((bar, i) => (
                  <div
                    key={i}
                    className={`w-8 sm:w-12 lg:w-16 rounded-t-xl sm:rounded-t-2xl relative ${
                      bar.active
                        ? "bg-gradient-to-b from-gray-900 to-gray-800 shadow-glow"
                        : "bg-gray-100"
                    }`}
                    style={{ height: bar.h }}
                  >
                    {bar.active && (
                      <>
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-50 rounded-t-xl sm:rounded-t-2xl mix-blend-overlay" />
                        {/* Tooltip */}
                        <div className="absolute -top-28 left-1/2 -translate-x-1/2 bg-[#1A1D21] text-white p-3 rounded-xl w-40 text-xs shadow-2xl z-30 hidden sm:block">
                          <div className="font-semibold mb-2">May 2025</div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />{" "}
                              Highest
                            </span>
                            <span className="font-medium">$ 7,500</span>
                          </div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />{" "}
                              Lowest
                            </span>
                            <span className="font-medium">$ 2,450</span>
                          </div>
                          <div className="flex justify-between items-center text-gray-400 border-t border-gray-700 mt-1 pt-1">
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />{" "}
                              Average
                            </span>
                            <span>$ 3,680</span>
                          </div>
                        </div>
                      </>
                    )}
                    <div
                      className={`absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[8px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full z-20 ${bar.color}`}
                    >
                      {bar.pct}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* X Axis Labels */}
            <div className="absolute bottom-0 left-8 sm:left-10 right-0 flex justify-between text-[10px] sm:text-xs text-gray-400 font-medium px-1 sm:px-4">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
            </div>
          </div>

          {/* Legend */}
          <div className="hidden md:flex absolute top-6 sm:top-8 right-6 sm:right-32 gap-3 lg:gap-4 text-[10px] sm:text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full" /> Highest
              Day
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-orange-500 rounded-full" /> Lowest
              Day
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full" /> Average
            </span>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-soft flex-1">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <i className="fas fa-history text-gray-400" /> Recent Transaction
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  className="bg-gray-50 border border-gray-100 rounded-full py-2 pl-9 pr-4 text-sm w-40 sm:w-48 focus:outline-none"
                  placeholder="Search..."
                  type="text"
                />
              </div>
              <button className="bg-gray-50 border border-gray-100 px-3 py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 text-gray-700">
                All Category <i className="fas fa-chevron-down text-[10px]" />
              </button>
              <button className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-500">
                <i className="fas fa-sliders-h" />
              </button>
              <button className="bg-black text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-2 hover:bg-gray-800">
                <i className="fas fa-download" /> <span className="hidden xs:inline">Export</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-medium">
                    <div className="flex items-center gap-2">
                      <input
                        className="rounded border-gray-300 text-black focus:ring-black"
                        type="checkbox"
                      />{" "}
                      Order ID
                    </div>
                  </th>
                  <th className="pb-3 font-medium">Product Name</th>
                  <th className="pb-3 font-medium">Date & Time</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Price</th>
                  <th className="pb-3 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {[
                  {
                    id: "TK-98421",
                    icon: "\uD83C\uDFA7",
                    name: "NovaEar Pro ANC",
                    desc: "Black, 32h Battery",
                    date: "19 Nov 2025, 10:32",
                    customer: "Ethan Clarke",
                    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsXZQ03B0oAzJz7OXD2_pkp_A0WJ1w6bY1Y6gLljLQK9KW5PQrVd4s8t1HDiDvnaktoSuz-ImejpCNyS_3SLM5CsaJM969c_L3Aws3vCHVVwhfSq89zVrZ2h9K5RiCP0pAzIT6h3IUQjW40aunje3MapVYrJAbaxUvFkg_v_QA9g36O2NPvRKrkcgYQkDwSmHw0OFa3naage8j6y_AlZ4EwMgrsRdkYxmeM1eIfJoivxrW_fHC3iCqxQ",
                    price: "$79.00",
                    status: "Completed",
                    statusClass: "bg-green-100 text-green-800",
                  },
                  {
                    id: "TK-98422",
                    icon: "\u231A",
                    name: "TekWatch Pulse",
                    desc: "44mm, Silver",
                    date: "19 Nov 2025, 11:05",
                    customer: "Ava Mitchell",
                    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0t3M-IkwXtcv48cTdJRYC8V6AmREtrQwyp00ribHSerTkl_fDUGAzTtuQyjhzocsO8NbOQ-y4TQcn7cYOPLaNmAhzxtfMMYEzgc2BaTOuMrw1QMMlqhWUdNywcWWFMXW15esaWxsAr4pUivMej17Gm9ohevOizpS9EkZP-q06M3UwiVQvtRlFAq64FPtPMdHmSbXfBqq-DgPLj3KZX7hH-DdVfebZDlVJhlm4b5tJ17jfe5wP_rHGJA",
                    price: "$159.00",
                    status: "Cancelled",
                    statusClass: "bg-red-100 text-red-800",
                    checked: true,
                  },
                  {
                    id: "TK-98423",
                    icon: "\uD83D\uDDB1\uFE0F",
                    name: "AeroPods Lite",
                    desc: "White, 20h Battery",
                    date: "19 Nov 2025, 11:44",
                    customer: "Liam Parker",
                    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBd74njrtbU8cmTh1ICqs2NSfBvYDtM6XNZX6lHXH_teyOBhsxhDf1qDKPvFkt_rTdfTZn9oq2F93l4sOs8OsDD5hzEaQnzN-qpDerzOqAf-xOa1JXECknwGPkz63Tt2OQSpdvsp2kkLgEDzyY2H2Y-oU7VLt-MQ-1nx_9PEmCHwTlAG_7IXV_Y3ATRLNaMDV1Dl3QZGgiNVB37Zhvq36_HdiVFLmXRwNDoeYXp6pgPH6vxcYoVxyKrOw",
                    price: "$55.00",
                    status: "Pending",
                    statusClass: "bg-blue-100 text-blue-800",
                  },
                ].map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <input
                          className="rounded border-gray-300"
                          type="checkbox"
                          defaultChecked={row.checked}
                        />{" "}
                        {row.id}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-lg shrink-0">
                          {row.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {row.name}
                          </div>
                          <div className="text-[10px] text-gray-500 truncate">
                            {row.desc}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-gray-500 whitespace-nowrap text-xs sm:text-sm">
                      {row.date}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <img
                          className="w-6 h-6 rounded-full shrink-0"
                          src={row.img}
                          alt={row.customer}
                        />
                        <span className="truncate text-xs sm:text-sm">{row.customer}</span>
                      </div>
                    </td>
                    <td className="py-3 font-medium">{row.price}</td>
                    <td className="py-3 text-center">
                      <span
                        className={`${row.statusClass} px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column (Span 1) */}
      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Sales Performance */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-soft">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <i className="fas fa-chart-pie text-gray-400" /> Sales
              Performance
            </h2>
            <button className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center border border-gray-100 text-gray-500">
              <i className="fas fa-ellipsis-h text-xs" />
            </button>
          </div>

          {/* Gauge Chart */}
          <div className="relative h-32 sm:h-40 flex items-end justify-center mb-4 sm:mb-6">
            <svg
              className="w-full max-w-[160px] sm:max-w-[200px] overflow-visible"
              viewBox="0 0 100 50"
            >
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#E5E7EB"
                strokeLinecap="round"
                strokeWidth="12"
              />
              <path
                d="M 10 50 A 40 40 0 0 1 78 20"
                fill="none"
                stroke="#10B981"
                strokeDasharray="100"
                strokeDashoffset="0"
                strokeLinecap="round"
                strokeWidth="12"
              />
              <line stroke="white" strokeWidth="2" x1="50" x2="15" y1="50" y2="25" />
              <line stroke="white" strokeWidth="2" x1="50" x2="35" y1="50" y2="10" />
              <line stroke="white" strokeWidth="2" x1="50" x2="65" y1="50" y2="10" />
              <line stroke="white" strokeWidth="2" x1="50" x2="85" y1="50" y2="25" />
            </svg>
            <div className="absolute bottom-0 text-center bg-white pt-2 px-4">
              <div className="text-3xl sm:text-4xl font-black">80%</div>
              <div className="text-[10px] sm:text-xs text-gray-500 font-medium">
                Sales Goal
              </div>
            </div>
          </div>

          <div className="flex justify-between border-t border-gray-100 pt-4 sm:pt-6 mb-4">
            <div>
              <div className="text-[10px] sm:text-xs text-gray-500 mb-1 flex items-center gap-2">
                Sales Number{" "}
                <span className="bg-green-100 text-green-600 text-[10px] px-1.5 rounded">
                  +6%
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold">1,660</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] sm:text-xs text-gray-500 mb-1 flex items-center justify-end gap-2">
                Total Revenue{" "}
                <span className="bg-red-100 text-red-600 text-[10px] px-1.5 rounded">
                  -2%
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold">$ 92,120</div>
            </div>
          </div>

          {/* Alert Banner */}
          <div className="bg-gray-900 text-white rounded-xl sm:rounded-2xl p-3 flex items-center gap-3 shadow-lg">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
              <i className="fas fa-bell text-sm" />
            </div>
            <div className="text-xs sm:text-sm font-medium flex-1 truncate">
              Your daily customer has increased
            </div>
            <button className="text-gray-400 hover:text-white shrink-0">
              <i className="fas fa-times" />
            </button>
          </div>
        </div>

        {/* Top Market */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-soft">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <i className="fas fa-globe text-gray-400" /> Top Market
            </h2>
            <button className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center border border-gray-100 text-gray-500">
              <i className="fas fa-ellipsis-h text-xs" />
            </button>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {[
              {
                flag: (
                  <div className="w-6 h-4 bg-red-500 rounded-sm overflow-hidden flex flex-col shrink-0">
                    <div className="h-1/2 bg-red-600" />
                    <div className="h-1/2 bg-white" />
                  </div>
                ),
                country: "Indonesia",
                amount: "$82,100",
                pct: "40%",
              },
              {
                flag: (
                  <div className="w-6 h-4 rounded-sm overflow-hidden flex flex-col shrink-0">
                    <div className="h-1/3 bg-black" />
                    <div className="h-1/3 bg-red-600" />
                    <div className="h-1/3 bg-yellow-400" />
                  </div>
                ),
                country: "German",
                amount: "$24,500",
                pct: "25%",
              },
              {
                flag: (
                  <div className="w-6 h-4 rounded-sm overflow-hidden flex shrink-0">
                    <div className="w-1/3 bg-green-600" />
                    <div className="w-1/3 bg-white" />
                    <div className="w-1/3 bg-red-600" />
                  </div>
                ),
                country: "Italy",
                amount: "$15,500",
                pct: "10%",
              },
            ].map((market) => (
              <div
                key={market.country}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-xl sm:rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  {market.flag}
                  <span className="font-medium text-xs sm:text-sm">
                    {market.country}
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="font-bold text-xs sm:text-sm">{market.amount}</span>
                  <span className="bg-green-100 text-green-600 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
                    {market.pct}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Product */}
        <div className="bg-gradient-to-br from-green-50 to-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-soft relative overflow-hidden flex-1">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNjY2MiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9zdmc+')] opacity-50" />
          <div className="flex justify-between items-center mb-4 sm:mb-6 relative z-10">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <i className="fas fa-box-open text-gray-400" /> Top Product
            </h2>
            <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 text-gray-500 shadow-sm">
              <i className="fas fa-ellipsis-h text-xs" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 relative z-10">
            <div className="bg-gray-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white shadow-xl flex flex-col justify-between">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 backdrop-blur-sm border border-white/10">
                <i className="fas fa-headphones-alt text-base sm:text-xl" />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm mb-1">AeroPods Lite</div>
                <div className="text-[9px] sm:text-[10px] text-gray-400 flex justify-between items-center">
                  10K sales <span className="text-green-400">+17%</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-50 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 border border-gray-100 text-base sm:text-xl">
                {"\uD83D\uDCBE"}
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm mb-1">HyperDrive SSD</div>
                <div className="text-[9px] sm:text-[10px] text-gray-500 flex justify-between items-center">
                  7K sales <span className="text-green-500">+8%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

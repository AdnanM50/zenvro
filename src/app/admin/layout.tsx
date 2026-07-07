export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#F8FAF9] p-4">
      <div
        className="max-w-[1440px] mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden flex"
        style={{ minHeight: "900px" }}
      >
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-100 flex flex-col justify-between p-6 shrink-0">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xl">
                V
              </div>
              <div>
                <div className="font-bold text-lg flex items-center gap-2">
                  Teknova Store
                  <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                    PRO
                  </span>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <i className="fas fa-lock text-[10px]"></i> Private
                </div>
              </div>
              <i className="fas fa-ellipsis-v text-gray-400 ml-auto cursor-pointer" />
            </div>

            {/* Greeting */}
            <div className="mb-8">
              <div className="text-xs text-gray-400 mb-1">
                Teknova Store &gt; Dashboard
              </div>
              <h1 className="text-2xl font-bold leading-tight">
                Welcome Back,<br />
                Noah Bellingham 👋
              </h1>
            </div>

            {/* Menu Section 1 */}
            <div className="mb-8">
              <div className="text-xs font-semibold text-gray-400 tracking-wider mb-4 flex justify-between items-center">
                MENU <i className="fas fa-chevron-up" />
              </div>
              <ul className="space-y-1">
                <li>
                  <a
                    href="#"
                    className="flex items-center gap-3 bg-black text-white px-4 py-3 rounded-xl shadow-lg shadow-black/20"
                  >
                    <i className="fas fa-home w-5 text-center" />
                    <span className="font-medium">Dashboard</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-xl transition-colors"
                  >
                    <i className="fas fa-box w-5 text-center" />
                    <span className="font-medium">Products</span>
                    <span className="ml-auto bg-orange-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                      4
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-xl transition-colors"
                  >
                    <i className="fas fa-file-invoice w-5 text-center" />
                    <span className="font-medium">Orders & Invoices</span>
                    <span className="ml-auto bg-orange-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                      6
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-xl transition-colors"
                  >
                    <i className="fas fa-chart-line w-5 text-center" />
                    <span className="font-medium">Sales Analytics</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-xl transition-colors"
                  >
                    <i className="fas fa-lightbulb w-5 text-center" />
                    <span className="font-medium">Customer Insights</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-xl transition-colors"
                  >
                    <i className="fas fa-file-alt w-5 text-center" />
                    <span className="font-medium">Reports</span>
                    <span className="ml-auto bg-orange-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                      2
                    </span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Menu Section 2 */}
            <div>
              <div className="text-xs font-semibold text-gray-400 tracking-wider mb-4 flex justify-between items-center">
                OTHERS <i className="fas fa-chevron-up" />
              </div>
              <ul className="space-y-1">
                <li>
                  <a
                    href="#"
                    className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-xl transition-colors"
                  >
                    <i className="fas fa-cog w-5 text-center" />
                    <span className="font-medium">Settings</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-xl transition-colors"
                  >
                    <i className="fas fa-users w-5 text-center" />
                    <span className="font-medium">Team Members</span>
                    <span className="ml-auto bg-orange-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                      3
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-xl transition-colors"
                  >
                    <i className="fas fa-question-circle w-5 text-center" />
                    <span className="font-medium">Help Center</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-xl transition-colors mt-2"
                  >
                    <i className="fas fa-sign-out-alt w-5 text-center" />
                    <span className="font-medium">Logout</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* User Profile Bottom */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-6">
            <img
              alt="User Avatar"
              className="w-10 h-10 rounded-full shrink-0"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDa1xDcspgxj2FSQ74NfSLrT4HWcBvcD72IIYy2JfXutd5H0GOkbZ-WDA0bCGuNv14qVNYAipF4ZCCl_tkZFqBRh1u7cYVdRGYvUjizlygZp87cWIGTnXG_IclEAyEFNxUCIjXBKmDMnOTHzM03KxxupLbFchUzNU1u3wfC30jyeBqFbJQHUvJfzoWOHHO-q_HVOfU3nNvj9UZBkBJxOzyNF8PzqD5BUMIH0FBb4ppEpX1ouEBoCXSqxg"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-900 truncate">
                Noah Bellingham
              </div>
              <div className="text-[10px] text-gray-500 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />{" "}
                noah@gmail.com
              </div>
            </div>
            <i className="fas fa-ellipsis-h text-gray-400 cursor-pointer shrink-0" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-gray-50/50 flex flex-col gap-6 min-w-0">
          {/* Topbar */}
          <header className="flex justify-between items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="relative w-96 max-w-full">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full bg-white border border-gray-200 rounded-full py-2.5 pl-11 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="Search here..."
                type="text"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs text-gray-400">
                <span className="bg-gray-100 px-1.5 py-0.5 rounded">⌘S</span>
                <i className="fas fa-sliders-h cursor-pointer hover:text-gray-600" />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex gap-3 text-gray-500 bg-white p-1.5 rounded-full border border-gray-100 shadow-sm">
                <button className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                  <i className="fas fa-sun" />
                </button>
                <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                  <i className="fas fa-moon" />
                </button>
                <div className="w-px h-6 bg-gray-200 my-auto mx-1" />
                <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center relative">
                  <i className="far fa-bell" />
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <img
                    alt="Team 1"
                    className="w-8 h-8 rounded-full border-2 border-white"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQti54a2ouNDjPsYialyRaERzBbAe5IX9boQQmZAKR4HQn8QmEFn0_a_ndk4WrxZ_gKWDblZdNEi2Kly_aj5YsD6FtbMxcusMJY1elqtTXcnw5V2K9vGJdnrCLR_o4-NkJbBYY871PY_lqevxtlh09_fcYwP8nUPdEup_ukN1WpjlpMJavso-i3RPo-NqfMgdTDs4yDv5HgBSEmYPSxBwccZ3oZWYL2RrbYYIZ_42KOrpIgQMsDbulhQ"
                  />
                  <img
                    alt="Team 2"
                    className="w-8 h-8 rounded-full border-2 border-white"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQVqv_CfWdgqtVF49Ozewem3HKHlEPn2KRH1Y2AiJkzoxBL_qkN7OZMxN5WH4EzGlhRw9riI65pzDxPLuLliJyc3KCRmpR-ByNkxUkgK11oVpstoCHQryHYAH3f5UNmZh6DjA9Q8ixT9J7SAvVoPbPRDzzy88tJp3Hekv4bg-SqL58_IxX2ufvgUHm5yazAJ82c3RT7aLADXo-Qf4BK2bKkn9vZmylOahY9KCrIZSYTCaq3iB2zpqfAQ"
                  />
                  <img
                    alt="Team 3"
                    className="w-8 h-8 rounded-full border-2 border-white"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4LHmvIV04ouG1MMTOiAK1RZ2f_6mSwRLpPDAATkUqtmoPH3DClfCqx1LN6l4jkqr8Ftn6qNyy0m4uXIu3g7C6zpO7agZm_bO0xfAC0COz8mF4qi5UHOZUDaVlCAEAwGNIYgcfkFyPBMAjFrCyLum6y8oo2pb98XWiDyFDYpdeauepEZomg3EyFlez51_cDpCWiOR_X523jqmFxUHiD7X9DuG6wnc-sr88yAJCxbMyrDDO5-7e-6mXTA"
                  />
                </div>
                <span className="text-sm font-medium text-gray-600">+6</span>
                <button className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors">
                  <i className="fas fa-user-plus" /> Invite
                </button>
              </div>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}

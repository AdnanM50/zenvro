interface AdminHeaderProps {
  onOpenSidebar: () => void;
}

export default function AdminHeader({ onOpenSidebar }: AdminHeaderProps) {
  return (
    <header className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 lg:p-8 pb-0 lg:pb-0">
      {/* Mobile hamburger */}
      <button
        className="lg:hidden text-gray-600 hover:text-black p-2 -ml-2 shrink-0"
        onClick={onOpenSidebar}
        aria-label="Open sidebar"
      >
        <i className="fas fa-bars text-lg" />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-lg">
        <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          className="w-full bg-white border border-gray-200 rounded-full py-2.5 pl-10 pr-10 sm:pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-shadow"
          placeholder="Search here..."
          type="text"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-2 text-xs text-gray-400">
          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-medium">&#8984;S</span>
          <button aria-label="Filter" className="hover:text-gray-600 transition-colors">
            <i className="fas fa-sliders-h" />
          </button>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Theme & Notification */}
        <div className="hidden sm:flex gap-2 text-gray-500 bg-white p-1.5 rounded-full border border-gray-100 shadow-sm">
          <button className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center" aria-label="Light mode">
            <i className="fas fa-sun text-xs" />
          </button>
          <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center" aria-label="Dark mode">
            <i className="fas fa-moon text-xs" />
          </button>
          <div className="w-px h-5 bg-gray-200 my-auto" />
          <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center relative" aria-label="Notifications">
            <i className="far fa-bell text-sm" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </button>
        </div>

        {/* Notification only (mobile) */}
        <button
          className="sm:hidden w-9 h-9 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center relative"
          aria-label="Notifications"
        >
          <i className="far fa-bell text-sm text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </button>

        {/* Team + Invite */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex -space-x-2">
            <img
              alt="Team member"
              className="w-8 h-8 rounded-full border-2 border-white object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQti54a2ouNDjPsYialyRaERzBbAe5IX9boQQmZAKR4HQn8QmEFn0_a_ndk4WrxZ_gKWDblZdNEi2Kly_aj5YsD6FtbMxcusMJY1elqtTXcnw5V2K9vGJdnrCLR_o4-NkJbBYY871PY_lqevxtlh09_fcYwP8nUPdEup_ukN1WpjlpMJavso-i3RPo-NqfMgdTDs4yDv5HgBSEmYPSxBwccZ3oZWYL2RrbYYIZ_42KOrpIgQMsDbulhQ"
            />
            <img
              alt="Team member"
              className="w-8 h-8 rounded-full border-2 border-white object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQVqv_CfWdgqtVF49Ozewem3HKHlEPn2KRH1Y2AiJkzoxBL_qkN7OZMxN5WH4EzGlhRw9riI65pzDxPLuLliJyc3KCRmpR-ByNkxUkgK11oVpstoCHQryHYAH3f5UNmZh6DjA9Q8ixT9J7SAvVoPbPRDzzy88tJp3Hekv4bg-SqL58_IxX2ufvgUHm5yazAJ82c3RT7aLADXo-Qf4BK2bKkn9vZmylOahY9KCrIZSYTCaq3iB2zpqfAQ"
            />
            <img
              alt="Team member"
              className="w-8 h-8 rounded-full border-2 border-white object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4LHmvIV04ouG1MMTOiAK1RZ2f_6mSwRLpPDAATkUqtmoPH3DClfCqx1LN6l4jkqr8Ftn6qNyy0m4uXIu3g7C6zpO7agZm_bO0xfAC0COz8mF4qi5UHOZUDaVlCAEAwGNIYgcfkFyPBMAjFrCyLum6y8oo2pb98XWiDyFDYpdeauepEZomg3EyFlez51_cDpCWiOR_X523jqmFxUHiD7X9DuG6wnc-sr88yAJCxbMyrDDO5-7e-6mXTA"
            />
          </div>
          <span className="text-sm font-medium text-gray-600">+6</span>
          <button className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors">
            <i className="fas fa-user-plus text-xs" /> Invite
          </button>
        </div>

        {/* Mobile avatar */}
        <img
          alt="User Avatar"
          className="w-9 h-9 rounded-full md:hidden object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDa1xDcspgxj2FSQ74NfSLrT4HWcBvcD72IIYy2JfXutd5H0GOkbZ-WDA0bCGuNv14qVNYAipF4ZCCl_tkZFqBRh1u7cYVdRGYvUjizlygZp87cWIGTnXG_IclEAyEFNxUCIjXBKmDMnOTHzM03KxxupLbFchUzNU1u3wfC30jyeBqFbJQHUvJfzoWOHHO-q_HVOfU3nNvj9UZBkBJxOzyNF8PzqD5BUMIH0FBb4ppEpX1ouEBoCXSqxg"
        />
      </div>
    </header>
  );
}

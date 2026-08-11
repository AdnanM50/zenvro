'use client';

import Link from 'next/link';
import { Megaphone, Zap, LayoutGrid, ArrowRight } from 'lucide-react';
import { useApiGet, createQueryKeys } from '@/hooks';
import {
  getPopupBanners,
} from '@/services/popup.service';
import {
  getFlashSales,
} from '@/services/flash-sale.service';
import {
  getHomeSections,
} from '@/services/home-section.service';

const popupKeys = createQueryKeys('admin-popup-banners');
const flashSaleKeys = createQueryKeys('admin-flash-sales');
const homeSectionKeys = createQueryKeys('admin-home-sections');

interface ModuleCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  count: number | undefined;
  accent: string;
}

function ModuleCard({ title, description, href, icon, count, accent }: ModuleCardProps) {
  return (
    <Link
      href={href}
      className="group bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${accent}`}>
          {icon}
        </div>
        <span className="text-3xl font-black text-gray-900 dark:text-white">
          {count === undefined ? '—' : count}
        </span>
      </div>
      <div>
        <div className="font-bold text-gray-900 dark:text-white">{title}</div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{description}</p>
      </div>
      <div className="inline-flex items-center gap-1 text-xs font-semibold text-gray-900 dark:text-white group-hover:gap-2 transition-all">
        Manage <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </Link>
  );
}

export default function MarketingDashboard() {
  const { data: popupResponse } = useApiGet({
    queryKey: popupKeys.list({ page: 1, limit: 1 }),
    queryFn: () => getPopupBanners({ page: 1, limit: 1 }),
  });
  const { data: flashSaleResponse } = useApiGet({
    queryKey: flashSaleKeys.list({ page: 1, limit: 1 }),
    queryFn: () => getFlashSales({ page: 1, limit: 1 }),
  });
  const { data: homeSectionResponse } = useApiGet({
    queryKey: homeSectionKeys.list({ page: 1, limit: 1 }),
    queryFn: () => getHomeSections({ page: 1, limit: 1 }),
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-fuchsia-50 via-white to-amber-50 dark:from-fuchsia-950/30 dark:via-gray-900 dark:to-amber-950/30 p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Marketing</h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-xl">
          Create popup banners, flash sales and home page sections. Pick 1-2 sections to feature on the
          home page so your storefront always looks clean.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ModuleCard
          title="Home Sections"
          description="Choose the sections (featured products, promo banners, flash sales) shown on the home page and set their order."
          href="/admin/marketing/home-sections"
          icon={<LayoutGrid className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />}
          count={homeSectionResponse?.meta?.total}
          accent="bg-cyan-50 dark:bg-cyan-950/40 border-cyan-100 dark:border-cyan-900"
        />
        <ModuleCard
          title="Popup Banners"
          description="Announce promotions with a scheduled popup that includes an image, description and call-to-action button."
          href="/admin/marketing/popups"
          icon={<Megaphone className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />}
          count={popupResponse?.meta?.total}
          accent="bg-fuchsia-50 dark:bg-fuchsia-950/40 border-fuchsia-100 dark:border-fuchsia-900"
        />
        <ModuleCard
          title="Flash Sales"
          description="Run timed discounts on selected products with optional home page placement."
          href="/admin/marketing/flash-sales"
          icon={<Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
          count={flashSaleResponse?.meta?.total}
          accent="bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900"
        />
      </div>
    </div>
  );
}

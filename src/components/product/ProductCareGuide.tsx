"use client";

import type { Product } from "@/lib/products";

type ProductCareGuideProps = {
  product: Product;
};

export default function ProductCareGuide({ product }: ProductCareGuideProps) {
  return (
    <div className="border-t border-outline-variant/60 pt-6 space-y-4">
      <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-secondary mb-2">
        Garment, Wear & Care Guide
      </p>

      <div className="space-y-3">
        {/* Wear & Styling */}
        <details className="group border border-outline-variant/60 bg-background p-4 rounded-sm transition" open>
          <summary className="flex cursor-pointer items-center justify-between font-label text-[10px] font-black uppercase tracking-[0.18em] text-on-surface">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">checkroom</span>
              Wear & Styling Notes
            </span>
            <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-open:rotate-180">expand_more</span>
          </summary>
          <div className="mt-3 pt-3 border-t border-outline-variant/40 text-xs leading-6 text-secondary space-y-1.5">
            <p>• <strong>Silhouette:</strong> Designed for an elevated, relaxed drape suitable for multi-season layering.</p>
            <p>• <strong>Styling Advice:</strong> Pair with tailored trousers or heavy-weight denim for a refined, modern architectural look.</p>
            <p>• <strong>Occasion:</strong> Ideal for urban daily wear, evening transitions, and travel.</p>
          </div>
        </details>

        {/* Fabric & Composition */}
        <details className="group border border-outline-variant/60 bg-background p-4 rounded-sm transition">
          <summary className="flex cursor-pointer items-center justify-between font-label text-[10px] font-black uppercase tracking-[0.18em] text-on-surface">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">texture</span>
              Fabric & Composition
            </span>
            <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-open:rotate-180">expand_more</span>
          </summary>
          <div className="mt-3 pt-3 border-t border-outline-variant/40 text-xs leading-6 text-secondary space-y-1.5">
            <p>• <strong>Material:</strong> {product.material || "High-density cotton & technical weave"}.</p>
            <p>• <strong>Hardware & Lining:</strong> Custom hardware with soft breathable inner lining for maximum comfort.</p>
            <p>• <strong>Finish:</strong> Matte-coated finish with water-repellent properties.</p>
          </div>
        </details>

        {/* Maintenance & Care */}
        <details className="group border border-outline-variant/60 bg-background p-4 rounded-sm transition">
          <summary className="flex cursor-pointer items-center justify-between font-label text-[10px] font-black uppercase tracking-[0.18em] text-on-surface">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">dry_cleaning</span>
              Care & Maintenance
            </span>
            <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-open:rotate-180">expand_more</span>
          </summary>
          <div className="mt-3 pt-3 border-t border-outline-variant/40 text-xs leading-6 text-secondary space-y-1.5">
            <p>• Professional dry clean recommended for optimal texture preservation.</p>
            <p>• Store on wide wooden hanger in a cool, dry garment bag.</p>
            <p>• Do not tumble dry. Do not bleach. Cool iron on reverse if needed.</p>
          </div>
        </details>
      </div>
    </div>
  );
}

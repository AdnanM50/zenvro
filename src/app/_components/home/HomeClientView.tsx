"use client";

import React from "react";
import type { Page, PageSection, Testimonial } from "@/types";
import { usePublicPage } from "@/hooks";
import HomeHero from "@/app/_components/home/HomeHero";
import HomeAbout from "@/app/_components/home/HomeAbout";
import HomeTestimonial from "@/app/_components/home/HomeTestimonial";
import HomeFlashSale from "@/app/_components/home/HomeFlashSale";
import FlashPopupModal from "@/components/FlashPopupModal";

interface HomeClientViewProps {
  initialPage?: Page | null;
  initialTestimonials?: Testimonial[] | null;
}

export default function HomeClientView({ initialPage, initialTestimonials }: HomeClientViewProps) {
  const { data, isError } = usePublicPage({ slug: "home", initialPage });
  const page = data?.data ?? null;

  const activeSections = (page?.sections || []).filter((sec) => sec.isActive);

  // Fallback section getters if section order array is empty
  const heroSec = activeSections.find((s) => s.type === "homeHero");
  const aboutSec = activeSections.find((s) => s.type === "homeAbout");
  const testimonialSec = activeSections.find((s) => s.type === "homeTestimonial");

  const renderSection = (sec: PageSection) => {
    switch (sec.type) {
      case "homeHero":
        return <HomeHero key={sec.id} section={sec} />;
      case "homeAbout":
        return <HomeAbout key={sec.id} section={sec} />;
      case "homeTestimonial":
        return <HomeTestimonial key={sec.id} section={sec} initialTestimonials={initialTestimonials} />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Network / Error Notice (Graceful degrade) */}
      {isError && !page && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 px-4 py-2.5 text-xs text-center font-medium">
          Note: Currently displaying standard cached view due to network connection.
        </div>
      )}

      {/* Hero Section */}
      {activeSections.length > 0 ? (
        activeSections.map((sec) => renderSection(sec))
      ) : (
        <>
          <HomeHero section={heroSec} />
          {/* Live Flash Sale Section */}
          <HomeFlashSale />
          <HomeAbout section={aboutSec} />
          <HomeTestimonial section={testimonialSec} initialTestimonials={initialTestimonials} />
        </>
      )}

      {/* Smart Popup Banner Modal */}
      <FlashPopupModal />
    </>
  );
}

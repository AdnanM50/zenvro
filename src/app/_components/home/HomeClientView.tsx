"use client";

import React from "react";
import type { Page, PageSection, Testimonial } from "@/types";
import { usePublicPage } from "@/hooks";
import HomeHero from "@/app/_components/home/HomeHero";
import HomeAbout from "@/app/_components/home/HomeAbout";
import HomeTestimonial from "@/app/_components/home/HomeTestimonial";
import HomeFlashSale from "@/app/_components/home/HomeFlashSale";
import Achievement from "@/components/Achievement";
import Collections from "@/components/Collections";
import FlashPopupModal from "@/components/FlashPopupModal";

interface HomeClientViewProps {
  initialPage?: Page | null;
  initialTestimonials?: Testimonial[] | null;
  productsElement?: React.ReactNode;
}

export default function HomeClientView({ initialPage, initialTestimonials, productsElement }: HomeClientViewProps) {
  const { data, isError } = usePublicPage({ slug: "home", initialPage });
  const page = data?.data ?? null;

  const activeSections = (page?.sections || []).filter((sec) => sec.isActive);

  // Fallback section getters if section order array is empty
  const heroSec = activeSections.find((s) => s.type === "homeHero");
  const aboutSec = activeSections.find((s) => s.type === "homeAbout");
  const achievementSec = activeSections.find((s) => s.type === "homeAchievement");
  const testimonialSec = activeSections.find((s) => s.type === "homeTestimonial");
  const collectionsSec = activeSections.find((s) => s.type === "homeCollections");

  const renderSection = (sec: PageSection) => {
    switch (sec.type) {
      case "homeHero":
        return <HomeHero key={sec.id} section={sec} />;
      case "homeAbout":
        return <HomeAbout key={sec.id} section={sec} />;
      case "homeAchievement":
        return <Achievement key={sec.id} section={sec} />;
      case "homeTestimonial":
        return <HomeTestimonial key={sec.id} section={sec} initialTestimonials={initialTestimonials} />;
      case "homeCollections":
        return <Collections key={sec.id} section={sec} />;
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

      {/* Dynamic Sections */}
      {activeSections.length > 0 ? (
        <>
          {activeSections.map((sec) => (
            <React.Fragment key={sec.id}>
              {sec.type === "homeCollections" && productsElement}
              {renderSection(sec)}
            </React.Fragment>
          ))}
          {!activeSections.some((s) => s.type === "homeCollections") && productsElement}
        </>
      ) : (
        <>
          <HomeHero section={heroSec} />
          {/* Live Flash Sale Section */}
          <HomeFlashSale />
          <HomeAbout section={aboutSec} />
          <Achievement section={achievementSec} />
          <HomeTestimonial section={testimonialSec} initialTestimonials={initialTestimonials} />
          {productsElement}
          <Collections section={collectionsSec} />
        </>
      )}

      {/* Smart Popup Banner Modal */}
      <FlashPopupModal />
    </>
  );
}

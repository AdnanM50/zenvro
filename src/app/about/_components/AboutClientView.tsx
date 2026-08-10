"use client";

import React, { useEffect, useState } from "react";
import type { Page, PageSection } from "@/types";
import AboutHero from "@/app/about/_components/AboutHero";
import AboutStory from "@/app/about/_components/AboutStory";
import AboutValues from "@/app/about/_components/AboutValues";
import AboutStats from "@/app/about/_components/AboutStats";
import AboutFaq from "@/app/about/_components/AboutFaq";

interface AboutClientViewProps {
  initialPage?: Page | null;
}

export default function AboutClientView({ initialPage }: AboutClientViewProps) {
  const [page, setPage] = useState<Page | null>(initialPage || null);
  const [loading, setLoading] = useState<boolean>(!initialPage);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    // If no initialPage was hydrated from Server Component, fetch from API on client
    if (!initialPage) {
      let isMounted = true;
      fetch("/api/cms/pages/about-us")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load page content");
          return res.json();
        })
        .then((data) => {
          if (isMounted) {
            if (data?.data) {
              setPage(data.data);
            }
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error("Client fetch about page error:", err);
          if (isMounted) {
            setError(true);
            setLoading(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [initialPage]);

  const activeSections = (page?.sections || []).filter((sec) => sec.isActive);

  // Fallback section getters if section order array is empty
  const heroSec = activeSections.find((s) => s.type === "hero");
  const storySec = activeSections.find((s) => s.type === "missionVision");
  const valuesSec = activeSections.find((s) => s.type === "featuresGrid");
  const statsSec = activeSections.find((s) => s.type === "stats");
  const faqSec = activeSections.find((s) => s.type === "faq");

  const renderSection = (sec: PageSection) => {
    switch (sec.type) {
      case "hero":
        return <AboutHero key={sec.id} section={sec} />;
      case "missionVision":
        return <AboutStory key={sec.id} section={sec} />;
      case "featuresGrid":
        return <AboutValues key={sec.id} section={sec} />;
      case "stats":
        return <AboutStats key={sec.id} section={sec} />;
      case "faq":
        return <AboutFaq key={sec.id} section={sec} />;
      default:
        return null;
    }
  };

  return (
    <main className="bg-background text-on-surface overflow-hidden min-h-screen">
      {/* Network / Error Notice (Graceful degrade) */}
      {error && !page && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 px-4 py-2.5 text-xs text-center font-medium">
          Note: Currently displaying standard cached view due to network connection.
        </div>
      )}

      {/* Render active CMS sections in exact order */}
      {activeSections.length > 0 ? (
        activeSections.map((sec) => renderSection(sec))
      ) : (
        <>
          <AboutHero section={heroSec} />
          <AboutStory section={storySec} />
          <AboutValues section={valuesSec} />
          <AboutStats section={statsSec} />
          <AboutFaq section={faqSec} />
        </>
      )}
    </main>
  );
}

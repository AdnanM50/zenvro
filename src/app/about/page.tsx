"use client";

import AboutHero from "@/app/about/_components/AboutHero";
import AboutStory from "@/app/about/_components/AboutStory";
import AboutValues from "@/app/about/_components/AboutValues";
import AboutStats from "@/app/about/_components/AboutStats";
import AboutFaq from "@/app/about/_components/AboutFaq";

export default function AboutPage() {
  return (
    <main className="bg-background text-on-surface overflow-hidden">
      <AboutHero />
      <AboutStory />
      <AboutValues />
      <AboutStats />
      <AboutFaq />
    </main>
  );
}

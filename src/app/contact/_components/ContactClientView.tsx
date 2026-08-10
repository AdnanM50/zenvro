"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useCreateContactMessage, usePublicPage } from "@/hooks";
import {
  fadeUp,
  fadeIn,
  fadeLeft,
  fadeRight,
  staggerContainer,
  staggerItem,
  wordContainer,
  wordReveal,
  VIEWPORT_CONFIG,
} from "@/lib/animations";
import type { Page } from "@/types";
import AboutFaq from "@/app/about/_components/AboutFaq";
import TickerBar from "@/components/about/TickerBar";

const CONTACT_MARQUEE = [
  "SAY HELLO",
  "WE REPLY FAST",
  "ATELIER DIRECT",
  "WORLDWIDE SHIPPING",
  "HUMAN SUPPORT",
  "NO ROBOTS",
  "CRAFTED ANSWERS",
];

// ─── Staggered Word Reveal Heading ────────────────────────────────────
function RevealHeading({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n");
  return (
    <motion.h1
      className={className}
      variants={wordContainer(0.06)}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_CONFIG}
    >
      {lines.map((line, lineIdx) => (
        <span key={lineIdx} className="block overflow-hidden pb-0.5">
          {line.split(" ").map((word, wordIdx) => (
            <motion.span
              key={`${lineIdx}-${wordIdx}`}
              variants={wordReveal}
              className="inline-block mr-[0.3em]"
              style={{ perspective: 400 }}
            >
              {word}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.h1>
  );
}

// ─── Form Field ───────────────────────────────────────────────────────
type FormFieldProps = {
  label: string;
  name: string;
  type?: string;
  textarea?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

function FormField({ label, name, type = "text", textarea = false, value, onChange, placeholder }: FormFieldProps) {
  const fieldClasses =
    "w-full bg-transparent border-b border-outline-variant py-3.5 font-body text-sm text-on-surface placeholder:text-outline outline-none transition-colors focus:border-primary-fixed";
  return (
    <div>
      <label
        htmlFor={name}
        className="font-label text-[11px] font-black uppercase tracking-[0.22em] text-secondary"
      >
        {label}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          rows={5}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`${fieldClasses} mt-2 resize-none`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`${fieldClasses} mt-2`}
        />
      )}
    </div>
  );
}

interface ContactClientViewProps {
  initialPage?: Page | null;
}

// ─── Page ─────────────────────────────────────────────────────────────
export default function ContactClientView({ initialPage }: ContactClientViewProps) {
  const { data, isError } = usePublicPage({ slug: "contact-us", initialPage });
  const page = data?.data ?? null;

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const createMessageMutation = useCreateContactMessage();
  const submitting = createMessageMutation.isPending;

  const activeSections = (page?.sections || [])
    .filter((sec) => sec.isActive)
    .sort((a, b) => a.order - b.order);

  const contactInfoSec = activeSections.find((sec) => sec.type === "contactInfo");
  const faqSec = activeSections.find((sec) => sec.type === "faq");

  const info = contactInfoSec?.data || {};
  const showForm = info.showContactForm !== false;

  const infoCards = [
    {
      icon: "mail",
      label: "Email",
      value: [String(info.email || "").trim()],
      href: info.email ? `mailto:${info.email}` : undefined,
    },
    {
      icon: "call",
      label: "Call us",
      value: [String(info.phone || "").trim()],
      href: info.phone ? `tel:${String(info.phone).replace(/[^+\d]/g, "")}` : undefined,
    },
    {
      icon: "location_on",
      label: "Location",
      value: String(info.address || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      href: undefined,
    },
    {
      icon: "schedule",
      label: "Open time",
      value: [String(info.workingHours || "").trim()],
      href: undefined,
    },
  ].filter((card) => card.value.some(Boolean));

  const heroTitle = contactInfoSec?.title || "Say hello,\nwe listen";
  const heroIntro =
    contactInfoSec?.subtitle || "Have a question or need assistance? Drop us a line — a real human replies within one working day.";

  const setField = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }
    createMessageMutation.mutate(
      {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      },
      {
        onSuccess: () => {
          setForm({ name: "", email: "", subject: "", message: "" });
        },
      }
    );
  };

  return (
    <main className="bg-background text-on-surface overflow-hidden min-h-screen">
      {/* Network / Error Notice (Graceful degrade) */}
      {isError && !page && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 px-4 py-2.5 text-xs text-center font-medium">
          Note: Currently displaying standard cached view due to network connection.
        </div>
      )}

      {/* HERO */}
      <section className="relative flex min-h-[50svh] flex-col px-6 md:px-12 lg:px-16 pt-24 md:pt-32 pb-12">
        <motion.div
          className="flex items-start justify-between"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          custom={0.05}
        >
          <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
            {`// ${page?.title || "Contact Velour"}`}
          </p>
          <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary hidden md:block">
            ATELIER — DIRECT LINE
          </p>
          <p className="font-headline text-2xl md:text-3xl font-black tracking-tighter text-primary-fixed">
            (VOL.01)
          </p>
        </motion.div>

        <div className="mt-12 md:mt-16 grid flex-1 grid-cols-1 items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <RevealHeading
              text={heroTitle}
              className="font-headline text-[clamp(3rem,10vw,8.5rem)] font-black tracking-[-0.03em] leading-[0.88] uppercase"
            />
          </div>
          <motion.div
            className="lg:col-span-4 flex flex-col items-start gap-8 lg:items-end"
            variants={fadeRight}
            initial="hidden"
            animate="visible"
            custom={0.3}
          >
            <p className="max-w-[280px] font-body text-sm leading-relaxed text-secondary lg:text-right">
              {heroIntro}
            </p>
            <div className="flex items-center gap-3 font-label text-[11px] font-black uppercase tracking-[0.2em] text-secondary">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-fixed opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary-fixed" />
              </span>
              We reply fast
            </div>
          </motion.div>
        </div>
      </section>

      {/* MARQUEE TICKER BAR */}
      <TickerBar items={CONTACT_MARQUEE} />

      {/* INFO + FORM */}
      {infoCards.length > 0 && (
        <section className="relative px-6 md:px-12 lg:px-16 py-16 md:py-24">
          <div className="mx-auto max-w-[1440px] grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
            {/* Info cards */}
            <motion.div
              className={showForm ? "lg:col-span-5" : "lg:col-span-7"}
              variants={staggerContainer(0.12, 0.05)}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_CONFIG}
            >
              <motion.div variants={fadeUp} custom={0.05}>
                <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
                  {"// Direct lines"}
                </p>
              </motion.div>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {infoCards.map((infoCard, index) => (
                  <motion.article
                    key={infoCard.label}
                    variants={staggerItem}
                    className="group flex min-h-[190px] flex-col justify-between border border-outline-variant bg-surface p-7 transition-colors duration-500 hover:bg-primary hover:text-white"
                  >
                    <div className="flex items-start justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container transition-colors duration-500 group-hover:bg-white/15">
                        <span className="material-symbols-outlined text-2xl text-primary-fixed transition-colors duration-500 group-hover:text-white">
                          {infoCard.icon}
                        </span>
                      </span>
                      <span className="font-mono text-[10px] text-secondary transition-colors duration-500 group-hover:text-white/60">
                        INFO_0{index + 1}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-headline text-base font-black tracking-tight uppercase">
                        {infoCard.label}
                      </h3>
                      <div className="mt-2 space-y-0.5">
                        {infoCard.value.map((line) =>
                          infoCard.href ? (
                            <a
                              key={line}
                              href={infoCard.href}
                              className="block font-body text-sm text-secondary transition-colors duration-500 group-hover:text-white/80 hover:text-primary-fixed group-hover:hover:text-white"
                            >
                              {line}
                            </a>
                          ) : (
                            <p
                              key={line}
                              className="font-body text-sm text-secondary transition-colors duration-500 group-hover:text-white/80"
                            >
                              {line}
                            </p>
                          )
                        )}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>

              <motion.div
                className="mt-10 hidden items-end gap-4 lg:flex"
                variants={fadeUp}
                custom={0.15}
              >
                <span className="font-label text-xs font-mono text-secondary">PROJECT_CONTACT_V01</span>
                <div className="flex gap-2">
                  <span className="w-8 h-1 bg-primary rounded-full" />
                  <span className="w-4 h-1 bg-outline-variant rounded-full" />
                  <span className="w-4 h-1 bg-outline-variant rounded-full" />
                </div>
              </motion.div>
            </motion.div>

            {/* Form */}
            {showForm && (
              <motion.div
                className="lg:col-span-7"
                variants={fadeLeft}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_CONFIG}
                custom={0.15}
              >
                <div className="border border-outline-variant bg-surface p-8 md:p-12">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
                      {"// Send a message"}
                    </p>
                    <span className="font-headline text-2xl font-black tracking-tighter text-primary-fixed">
                      (FORM_01)
                    </span>
                  </div>

                  <form onSubmit={handleSubmit} className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
                    <FormField
                      label="Your name"
                      name="name"
                      value={form.name}
                      onChange={setField("name")}
                      placeholder="Jane Doe"
                    />
                    <FormField
                      label="Email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={setField("email")}
                      placeholder="jane@example.com"
                    />
                    <div className="sm:col-span-2">
                      <FormField
                        label="Subject"
                        name="subject"
                        value={form.subject}
                        onChange={setField("subject")}
                        placeholder="Sizing on the SS/26 jacket"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <FormField
                        label="Message"
                        name="message"
                        textarea
                        value={form.message}
                        onChange={setField("message")}
                        placeholder="Tell us what you need..."
                      />
                    </div>

                    <div className="sm:col-span-2 flex flex-col items-start justify-between gap-6 pt-2 md:flex-row md:items-center">
                      <p className="max-w-[300px] font-body text-xs leading-relaxed text-secondary">
                        By sending a message you agree to our privacy policy. We never share your details.
                      </p>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="group inline-flex items-center gap-4 rounded-full bg-primary text-white px-8 py-4 font-label text-xs font-bold tracking-widest transition-colors hover:bg-primary-fixed disabled:pointer-events-none disabled:opacity-60"
                      >
                        {submitting ? "Sending..." : "Send message"}
                        <span className="material-symbols-outlined text-[16px] transition-transform duration-300 group-hover:translate-x-1">
                          arrow_forward
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* ATELIER VISIT BANNER */}
      <section className="border-t border-outline-variant bg-surface py-16 md:py-24 px-6 md:px-12 lg:px-16">
        <div className="mx-auto max-w-[1440px] flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2 className="font-headline text-3xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-tight">
              PREFER THE ATELIER VISIT?
            </h2>
          </div>
          <div className="flex flex-col items-start md:items-end gap-4">
            <p className="max-w-[340px] font-body text-sm leading-relaxed text-secondary md:text-right">
              Appointments only — book a fitting and try the current drop in person at our studio.
            </p>
            <a
              href="https://maps.google.com/?q=5567+Washington+Ave"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-label text-xs font-black uppercase tracking-[0.2em] text-primary-fixed hover:underline"
            >
              <span className="material-symbols-outlined text-lg">location_on</span>
              5567 WASHINGTON AVE, AMERICA
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      {faqSec && <AboutFaq section={faqSec} />}
    </main>
  );
}

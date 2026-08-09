// ─── Shared Imagery ──────────────────────────────────────────────────
export const IMG = {
  jacket: "https://lh3.googleusercontent.com/aida-public/AB6AXuAN8FAzZ6Z98nZ8sYGleNSAKoti9_iF3fu8z7I65Bw3HONXl-SUhJFYxpU2jhhzXvfS9KTh-dHu4EE8Y2dcvTOb06mudpwFstqK7Iivzugrvbf-uf2_72GnEVFBZEkoflE7ChpGtu1ql9yTVkx2L25xQ62yFuKTcVw0oYF85SEBPSiWSpCN1Rigaj21UKn4GdayMsDE64POVE4d_jGtny91Wtv11ljhddqyuDDKA497rJFWHbwFER3RnmpWT3aF108NvbpfXEUdehWf",
  model: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmkJcw9YoYQsZHRiFf7H7KH3xRZyb_aYU4C7r3tffqaHqoyVKcPPLYoPhXRd7ZwQSlMieJrx5hQnmZvISItWIBj_f2EOhOXv7u3CxTN7jAQQpje6qCmuyPzquibOLEFvxPAcaezFSUmiXrVBqFcEjh0SI6u-PxB-62T34PWhO-wWIpHy_olj_K373paLFRyhzhjmm78s5jspSnyUstR6AOOKbiGXN-stQM3JqaIXTfnHDqacTyuDx-B6D0zH-11r0mb2nK5A07a8ve",
  back: "https://lh3.googleusercontent.com/aida-public/AB6AXuDSUs8fzjaFq_UgiWHvEzssIE8LZz9u9S90I27yrJOmb8d9gRWmzjPxDqM7DXIlkP5iVLDm18Jil46QbiF_nWze1U6u45vN3tyoOfZeruHZhlvjTGDwSMZkTAdI3Zn7pdcPEntaCKxCTnZDDy3aY_3Vsx0ezQCPj1USMTLR7BDWozA0Usj2EpH4L7aGRTq4d-02iWLb3HUpBLgbuIQEhPOM-5JCNVA16Eze95sfztoWgSUCVbhGV_3DERa3OJo2wHqZVKc61zKD7UCq",
  editorial: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1RoW5cBcoqT10u7JT7K7anHFGjv3NTjr8_mysaiCsk27iFErOxdP6goslnhBKFrJAC_iy8B-WQiIX7V9Tfq3ZQQ0DbKX0r3VZWRvRL8rx9a5vZ6yrB9wQOagG01U8I61_Y8LQ3h4X_uq6u5aA3yI1A8TPHK0I6FEbFTGhj8IPMtbCubZDYHng1tq9dl0pwI8nDdjwgiNLq4eIJQQwAMDg4xcvoJK2t1TVCM5VYhXT2E4qhkIg7Sq7cXGPMSQGBTsIMkBZr007K2R_",
};

// ─── Section 03: Values ──────────────────────────────────────────────
export type Value = {
  icon: string;
  title: string;
  copy: string;
  tag: string;
};

export const VALUES: Value[] = [
  {
    icon: "auto_awesome",
    title: "Material Obsession",
    copy: "Premiere fabrics sourced from heritage mills — wool, silk, and technical weaves chosen to age beautifully.",
    tag: "CRAFT_01",
  },
  {
    icon: "recycling",
    title: "Sustainable First",
    copy: "Deadstock fabrics, recycled hardware, and zero-waste pattern cutting across every single collection.",
    tag: "CRAFT_02",
  },
  {
    icon: "handshake",
    title: "Hand-Finished",
    copy: "Every piece passes through our atelier for a final hand inspection — because detail is the difference.",
    tag: "CRAFT_03",
  },
  {
    icon: "inventory_2",
    title: "Limited Drops",
    copy: "We produce in small, numbered runs. When a drop sells out, it stays out — no mass reproduction.",
    tag: "CRAFT_04",
  },
  {
    icon: "schedule",
    title: "Timeless Cuts",
    copy: "Silhouettes engineered to outlive trends. Designed for the years ahead, not just the season.",
    tag: "CRAFT_05",
  },
  {
    icon: "public",
    title: "Global Fit",
    copy: "Patterns graded across international sizing so our pieces fit every body, in every city we ship to.",
    tag: "CRAFT_06",
  },
];

// ─── Section 02: Timeline ────────────────────────────────────────────
export type TimelineItem = {
  year: string;
  title: string;
  copy: string;
};

export const TIMELINE: TimelineItem[] = [
  {
    year: "2018",
    title: "The First Atelier",
    copy: "VELOUR is founded in a 40m² studio with one sewing table and a belief that luxury should never feel out of reach.",
  },
  {
    year: "2020",
    title: "The Sustainable Shift",
    copy: "We overhaul our supply chain — deadstock fabrics and recycled hardware become the non-negotiable core of every piece.",
  },
  {
    year: "2022",
    title: "The Archive Drops",
    copy: "Our limited numbered-run format debuts. Four drops sell out in under an hour, and a community is born.",
  },
  {
    year: "2024",
    title: "Global Expansion",
    copy: "VELOUR ships to twelve countries. Editorial lookbooks replace campaign shoots, and the aesthetic finds its voice.",
  },
  {
    year: "2026",
    title: "SS/26 & Beyond",
    copy: "The current season — our most ambitious yet. Accessories, silhouettes, and collaborations still to come.",
  },
];

// ─── Stats ───────────────────────────────────────────────────────────
export type Stat = {
  value: number;
  suffix: string;
  label: string;
};

export const STATS: Stat[] = [
  { value: 8, suffix: "", label: "Years of craft" },
  { value: 45, suffix: "", label: "Signature collections" },
  { value: 280, suffix: "K", label: "Community members" },
  { value: 12, suffix: "", label: "Countries served" },
];

// ─── FAQ ─────────────────────────────────────────────────────────────
export type Faq = {
  q: string;
  a: string;
};

export const FAQS: Faq[] = [
  {
    q: "Where does VELOUR ship, and how fast?",
    a: "We ship worldwide to 12+ countries. Every order includes express tracking, and in most regions pieces arrive within 3–7 working days. Duties and taxes are calculated at checkout, so there are no surprises at the door.",
  },
  {
    q: "How do limited drops work?",
    a: "Every collection is produced as a small, numbered run. When a drop sells out, it stays out — we never mass-produce or quietly restock. If you want a piece, the drop window is your moment.",
  },
  {
    q: "What makes VELOUR sustainable?",
    a: "Sustainability is our starting point, not a label. We use deadstock and upcycled fabrics, recycled hardware, and zero-waste pattern cutting. Our atelier runs on short production runs, which means nothing is made to landfill.",
  },
  {
    q: "What is your return and exchange policy?",
    a: "You have 30 days from delivery to return any unworn piece in its original condition, with tags attached. Exchanges for a different size are free — and the return label is always on us.",
  },
  {
    q: "How should I care for my pieces?",
    a: "Most pieces wash cold and hang dry beautifully. Premium wools and silks carry a care label with specific instructions, and our technical weaves are made to shrug off the everyday.",
  },
  {
    q: "Will sold-out items ever come back?",
    a: "Never in the same form. Sold-out silhouettes sometimes return in a new season with a new fabric and a new color story — but each release stays true to the limited-run spirit.",
  },
];

// ─── Marquee Ticker ──────────────────────────────────────────────────
export const MARQUEE_ITEMS = [
  "CRAFTED STORIES",
  "PREMIUM MATERIALS",
  "TIMELESS CUTS",
  "URBAN INFLUENCE",
  "SUSTAINABLE FIRST",
  "LIMITED DROPS",
  "HAND-FINISHED",
];

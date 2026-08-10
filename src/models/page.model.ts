import { generateObjectId } from '@/lib/id';
import { slugify } from '@/lib/slugify';
import { getDb } from '@/lib/db';
import type {
  Page,
  PageSection,
  PageSEO,
  CreatePagePayload,
  UpdatePagePayload,
  PageListParams,
} from '@/types/page';

const COLLECTION = 'pages';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function col(): Promise<any> {
  const db = await getDb();
  return db.collection(COLLECTION);
}

export { slugify };

export const defaultSeo = (title: string): PageSEO => ({
  metaTitle: `${title} | Zenvro Store`,
  metaDescription: `Read our ${title.toLowerCase()} information, policies and details on Zenvro Store.`,
  metaKeywords: `${title.toLowerCase()}, zenvro, store, policies`,
  ogImage: '',
  canonicalUrl: `https://zenvro.com/${slugify(title)}`,
});

export const defaultPagesList: Array<CreatePagePayload> = [
  {
    title: 'Home Page',
    slug: 'home',
    status: 'published',
    seo: {
      metaTitle: 'VELOUR | Independent Fashion House',
      metaDescription: 'Explore curated collections, exclusive drops, and everyday essentials all thoughtfully designed in one stylish shopping destination.',
      metaKeywords: 'velour, fashion, urban fashion, streetwear, limited drops, sustainable fashion, luxury streetwear',
      ogImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAN8FAzZ6Z98nZ8sYGleNSAKoti9_iF3fu8z7I65Bw3HONXl-SUhJFYxpU2jhhzXvfS9KTh-dHu4EE8Y2dcvTOb06mudpwFstqK7Iivzugrvbf-uf2_72GnEVFBZEkoflE7ChpGtu1ql9yTVkx2L25xQ62yFuKTcVw0oYF85SEBPSiWSpCN1Rigaj21UKn4GdayMsDE64POVE4d_jGtny91Wtv11ljhddqyuDDKA497rJFWHbwFER3RnmpWT3aF108NvbpfXEUdehWf',
      canonicalUrl: 'https://zenvro.com/',
    },
    sections: [
      {
        id: 'home-hero',
        type: 'homeHero',
        title: 'Home Hero',
        subtitle: 'Explore curated collections, exclusive drops, and everyday essentials all thoughtfully designed in one stylish shopping destination.',
        isActive: true,
        order: 1,
        data: {
          leftTitle: 'where\n- style',
          tag: '// FASHION',
          newText: '/ New',
          newSubtext: 'Collection 2026',
          rightTag: '// STYLED FOR\nLIFE.',
          rightTitle: 'lives\n- now',
          modelImage: '/hero/model-Photoroom.png',
          avatar1: '/hero/avatar1.png',
          avatar2: '/hero/avatar2.png',
          peopleCount: '280K',
          peopleLabel: 'PEOPLE WE INSPIRE',
          marquee: 'T STYLING + CRAFTED STORIES + PREMIUM MATERIALS + PREMIUM FABRICS + TIMELESS CUTS + URBAN INFLUENCE',
        },
      },
      {
        id: 'home-about',
        type: 'homeAbout',
        title: 'All - about\nmoments\n©26',
        subtitle: 'Where Elegance Meets Sustainability Luxury Made Accessible',
        isActive: true,
        order: 2,
        data: {
          ctaLabel: 'LEARN MORE',
          ctaLink: '/about',
          smallImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAN8FAzZ6Z98nZ8sYGleNSAKoti9_iF3fu8z7I65Bw3HONXl-SUhJFYxpU2jhhzXvfS9KTh-dHu4EE8Y2dcvTOb06mudpwFstqK7Iivzugrvbf-uf2_72GnEVFBZEkoflE7ChpGtu1ql9yTVkx2L25xQ62yFuKTcVw0oYF85SEBPSiWSpCN1Rigaj21UKn4GdayMsDE64POVE4d_jGtny91Wtv11ljhddqyuDDKA497rJFWHbwFER3RnmpWT3aF108NvbpfXEUdehWf',
          smallImageLabel: 'New Drop',
          smallImagePrice: '($120)',
          centerImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmkJcw9YoYQsZHRiFf7H7KH3xRZyb_aYU4C7r3tffqaHqoyVKcPPLYoPhXRd7ZwQSlMieJrx5hQnmZvISItWIBj_f2EOhOXv7u3CxTN7jAQQpje6qCmuyPzquibOLEFvxPAcaezFSUmiXrVBqFcEjh0SI6u-PxB-62T34PWhO-wWIpHy_olj_K373paLFRyhzhjmm78s5jspSnyUstR6AOOKbiGXN-stQM3JqaIXTfnHDqacTyuDx-B6D0zH-11r0mb2nK5A07a8ve',
          copyright: '©International - going distance 2026',
          rightTitle: 'Design\nPhilosophy',
          rightCopy: 'Blending avant-garde aesthetics with everyday utility, our pieces are crafted for those who define their own path. Every stitch tells a story of innovation.',
          rightImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSUs8fzjaFq_UgiWHvEzssIE8LZz9u9S90I27yrJOmb8d9gRWmzjPxDqM7DXIlkP5iVLDm18Jil46QbiF_nWze1U6u45vN3tyoOfZeruHZhlvjTGDwSMZkTAdI3Zn7pdcPEntaCKxCTnZDDy3aY_3Vsx0ezQCPj1USMTLR7BDWozA0Usj2EpH4L7aGRTq4d-02iWLb3HUpBLgbuIQEhPOM-5JCNVA16Eze95sfztoWgSUCVbhGV_3DERa3OJo2wHqZVKc61zKD7UCq',
          rightCopyright: '©International - just do it 2026',
          projectCode: 'PROJECT_V01',
          projectPercent: '(45%)',
        },
      },
      {
        id: 'home-testimonial',
        type: 'homeTestimonial',
        title: 'Testimonial',
        subtitle: 'See What Our Customers Are Saying',
        isActive: true,
        order: 3,
        data: {
          headerIndex: '01/8',
          tag: '[Testimonial]',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDn86UomaXCYKGME9gdwpyjHvfq2QMkZYhlDZQzwXii2NJ3QutwTXQln53Kv_G431CcLy9zi8lL-znmVkSvPZxjBfFo-aOnii8DFdgO-DOYz7BiZ9n-OUAs4VZBuPuJbeGHmo1eKxmwkLdaVJdvHN7d9Rev5g9Z_oMTlaIljZzxiS77OAXok8rHgTvlmvntOER1bqZsk9yruNKXIsgo0dTG9xefrrp3Z_f95Np6z2-XLodRzf_snomxfiw2h45UgrrfYVnaoVtY6BmG',
          authorName: '[Emma Williams]',
          authorRole: 'Fashion Stylist',
          quote: 'Everything is absolutely perfect! From the fabric quality to the flawless fit every piece feels premium. This brand has completely transformed my wardrobe.',
          rating: 5,
          reviewsCount: '49',
          footerText: 'See What Our Customers Are Saying',
        },
      },
    ],
  },
  {
    title: 'About Us',
    slug: 'about-us',
    status: 'published',
    seo: {
      metaTitle: 'The Story of Velour | Eight Years of Urban & Streetwear Craftsmanship',
      metaDescription: 'Discover the story behind VELOUR. Eight years in the making—crafting premium urban fashion, sustainable outerwear, limited drops, and tailored fits for trendsetters worldwide.',
      metaKeywords: 'velour, urban fashion, streetwear, story of velour, sustainable fashion, outer wear, archive drops, tailored fit, hand finished apparel',
      ogImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmkJcw9YoYQsZHRiFf7H7KH3xRZyb_aYU4C7r3tffqaHqoyVKcPPLYoPhXRd7ZwQSlMieJrx5hQnmZvISItWIBj_f2EOhOXv7u3CxTN7jAQQpje6qCmuyPzquibOLEFvxPAcaezFSUmiXrVBqFcEjh0SI6u-PxB-62T34PWhO-wWIpHy_olj_K373paLFRyhzhjmm78s5jspSnyUstR6AOOKbiGXN-stQM3JqaIXTfnHDqacTyuDx-B6D0zH-11r0mb2nK5A07a8ve',
      canonicalUrl: 'https://zenvro.com/about-us',
    },
    sections: [
      {
        id: 'hero-about',
        type: 'hero',
        title: 'The story\nof VELOUR',
        subtitle: 'Crafted in small runs. Worn for a lifetime. VELOUR is an independent fashion house chasing the perfect collision of comfort and design.',
        isActive: true,
        order: 1,
        data: {
          tag: '// About Velour',
          estText: 'Est. MMXVIII',
          volText: '(VOL.01)',
          sideText: 'Where elegance meets sustainability',
          ctaLabel: 'Scroll to begin',
          ctaLink: '#story',
          bgImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAN8FAzZ6Z98nZ8sYGleNSAKoti9_iF3fu8z7I65Bw3HONXl-SUhJFYxpU2jhhzXvfS9KTh-dHu4EE8Y2dcvTOb06mudpwFstqK7Iivzugrvbf-uf2_72GnEVFBZEkoflE7ChpGtu1ql9yTVkx2L25xQ62yFuKTcVw0oYF85SEBPSiWSpCN1Rigaj21UKn4GdayMsDE64POVE4d_jGtny91Wtv11ljhddqyuDDKA497rJFWHbwFER3RnmpWT3aF108NvbpfXEUdehWf',
          image1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAN8FAzZ6Z98nZ8sYGleNSAKoti9_iF3fu8z7I65Bw3HONXl-SUhJFYxpU2jhhzXvfS9KTh-dHu4EE8Y2dcvTOb06mudpwFstqK7Iivzugrvbf-uf2_72GnEVFBZEkoflE7ChpGtu1ql9yTVkx2L25xQ62yFuKTcVw0oYF85SEBPSiWSpCN1Rigaj21UKn4GdayMsDE64POVE4d_jGtny91Wtv11ljhddqyuDDKA497rJFWHbwFER3RnmpWT3aF108NvbpfXEUdehWf',
          image2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmkJcw9YoYQsZHRiFf7H7KH3xRZyb_aYU4C7r3tffqaHqoyVKcPPLYoPhXRd7ZwQSlMieJrx5hQnmZvISItWIBj_f2EOhOXv7u3CxTN7jAQQpje6qCmuyPzquibOLEFvxPAcaezFSUmiXrVBqFcEjh0SI6u-PxB-62T34PWhO-wWIpHy_olj_K373paLFRyhzhjmm78s5jspSnyUstR6AOOKbiGXN-stQM3JqaIXTfnHDqacTyuDx-B6D0zH-11r0mb2nK5A07a8ve',
          image3: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSUs8fzjaFq_UgiWHvEzssIE8LZz9u9S90I27yrJOmb8d9gRWmzjPxDqM7DXIlkP5iVLDm18Jil46QbiF_nWze1U6u45vN3tyoOfZeruHZhlvjTGDwSMZkTAdI3Zn7pdcPEntaCKxCTnZDDy3aY_3Vsx0ezQCPj1USMTLR7BDWozA0Usj2EpH4L7aGRTq4d-02iWLb3HUpBLgbuIQEhPOM-5JCNVA16Eze95sfztoWgSUCVbhGV_3DERa3OJo2wHqZVKc61zKD7UCq',
          copyrightText: '©International - going distance 2026',
          seasonTag: '(SS/26)',
        },
      },
      {
        id: 'story-about',
        type: 'missionVision',
        title: 'Eight years\nin the making',
        subtitle: 'What began as a single sewing table in a tiny studio is now a house with one obsession: clothes that feel like they were made for you, and made to last. No seasons to chase. No trends to obey. Just craft, cut, and intention.',
        isActive: true,
        order: 2,
        data: {
          tag: '// Our Story',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1RoW5cBcoqT10u7JT7K7anHFGjv3NTjr8_mysaiCsk27iFErOxdP6goslnhBKFrJAC_iy8B-WQiIX7V9Tfq3ZQQ0DbKX0r3VZWRvRL8rx9a5vZ6yrB9wQOagG01U8I61_Y8LQ3h4X_uq6u5aA3yI1A8TPHK0I6FEbFTGhj8IPMtbCubZDYHng1tq9dl0pwI8nDdjwgiNLq4eIJQQwAMDg4xcvoJK2t1TVCM5VYhXT2E4qhkIg7Sq7cXGPMSQGBTsIMkBZr007K2R_',
          metaCode: 'PROJECT_STORY_V02',
          items: [
            { year: '2018', title: 'The First Atelier', copy: 'VELOUR is founded in a 40m² studio with one sewing table and a belief that luxury should never feel out of reach.' },
            { year: '2020', title: 'The Sustainable Shift', copy: 'We overhaul our supply chain — deadstock fabrics and recycled hardware become the non-negotiable core of every piece.' },
            { year: '2022', title: 'The Archive Drops', copy: 'Our limited numbered-run format debuts. Four drops sell out in under an hour, and a community is born.' },
            { year: '2024', title: 'Global Expansion', copy: 'VELOUR ships to twelve countries. Editorial lookbooks replace campaign shoots, and the aesthetic finds its voice.' },
            { year: '2026', title: 'SS/26 & Beyond', copy: 'The current season — our most ambitious yet. Accessories, silhouettes, and collaborations still to come.' },
          ],
        },
      },
      {
        id: 'values-about',
        type: 'featuresGrid',
        title: 'What we\nstand for',
        subtitle: 'Six principles, non-negotiable. They shape every cut, every fabric, and every piece we let out the door.',
        isActive: true,
        order: 3,
        data: {
          tag: '// The Craft',
          items: [
            { icon: 'auto_awesome', title: 'Material Obsession', copy: 'Premiere fabrics sourced from heritage mills — wool, silk, and technical weaves chosen to age beautifully.', tag: 'CRAFT_01' },
            { icon: 'recycling', title: 'Sustainable First', copy: 'Deadstock fabrics, recycled hardware, and zero-waste pattern cutting across every single collection.', tag: 'CRAFT_02' },
            { icon: 'handshake', title: 'Hand-Finished', copy: 'Every piece passes through our atelier for a final hand inspection — because detail is the difference.', tag: 'CRAFT_03' },
            { icon: 'inventory_2', title: 'Limited Drops', copy: 'We produce in small, numbered runs. When a drop sells out, it stays out — no mass reproduction.', tag: 'CRAFT_04' },
            { icon: 'schedule', title: 'Timeless Cuts', copy: 'Silhouettes engineered to outlive trends. Designed for the years ahead, not just the season.', tag: 'CRAFT_05' },
            { icon: 'public', title: 'Global Fit', copy: 'Patterns graded across international sizing so our pieces fit every body, in every city we ship to.', tag: 'CRAFT_06' },
          ],
        },
      },
      {
        id: 'stats-about',
        type: 'stats',
        title: 'Become part\nof the story',
        subtitle: 'Every drop is a small chapter. Join the community and be first to the next one.',
        isActive: true,
        order: 4,
        data: {
          items: [
            { value: 8, suffix: '', label: 'Years of craft' },
            { value: 45, suffix: '', label: 'Signature collections' },
            { value: 280, suffix: 'K', label: 'Community members' },
            { value: 12, suffix: '', label: 'Countries served' },
          ],
          ctaLabel: 'Explore the edit',
          ctaLink: '/products',
        },
      },
      {
        id: 'faq-about',
        type: 'faq',
        title: 'Questions,\nanswered',
        subtitle: 'Everything you need to know before your first drop. Still curious? Our team replies within one working day.',
        isActive: true,
        order: 5,
        data: {
          tag: '// FAQ',
          metaCode: 'PROJECT_SUPPORT_V01',
          items: [
            { q: 'Where does VELOUR ship, and how fast?', a: 'We ship worldwide to 12+ countries. Every order includes express tracking, and in most regions pieces arrive within 3–7 working days. Duties and taxes are calculated at checkout, so there are no surprises at the door.' },
            { q: 'How do limited drops work?', a: 'Every collection is produced as a small, numbered run. When a drop sells out, it stays out — we never mass-produce or quietly restock. If you want a piece, the drop window is your moment.' },
            { q: 'What makes VELOUR sustainable?', a: 'Sustainability is our starting point, not a label. We use deadstock and upcycled fabrics, recycled hardware, and zero-waste pattern cutting. Our atelier runs on short production runs, which means nothing is made to landfill.' },
            { q: 'What is your return and exchange policy?', a: 'You have 30 days from delivery to return any unworn piece in its original condition, with tags attached. Exchanges for a different size are free — and the return label is always on us.' },
            { q: 'How should I care for my pieces?', a: 'Most pieces wash cold and hang dry beautifully. Premium wools and silks carry a care label with specific instructions, and our technical weaves are made to shrug off the everyday.' },
            { q: 'Will sold-out items ever come back?', a: 'Never in the same form. Sold-out silhouettes sometimes return in a new season with a new fabric and a new color story — but each release stays true to the limited-run spirit.' },
          ],
        },
      },
    ],
  },
  {
    title: 'Contact Us',
    slug: 'contact-us',
    status: 'published',
    seo: {
      metaTitle: 'Contact Us | VELOUR Independent Fashion House',
      metaDescription: 'Questions, sizing advice, or a collaboration in mind? Drop us a line — a real human from the VELOUR team replies within one working day.',
      metaKeywords: 'contact us, contact velour, customer service, support, email, phone, say hello',
      ogImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=1200',
      canonicalUrl: 'https://zenvro.com/contact',
    },
    sections: [
      {
        id: 'contact-info-main',
        type: 'contactInfo',
        title: 'SAY HELLO,\nWE LISTEN',
        subtitle: 'Questions, sizing advice, or a collaboration in mind? Drop us a line — a real human replies within one working day.',
        isActive: true,
        order: 1,
        data: {
          tag: '// CONTACT VELOUR',
          sideText: 'ATELIER — DIRECT LINE',
          volText: '(VOL.01)',
          email: 'hello@orbix.studio',
          phone: '+016 76234396',
          address: '5567 Washington Ave, America, 32289',
          workingHours: '08:00 - 11:00 pm',
          showContactForm: true,
        },
      },
      {
        id: 'contact-faq',
        type: 'faq',
        title: 'Frequently Asked Questions',
        subtitle: 'Quick answers to common questions about orders and shipping.',
        isActive: true,
        order: 2,
        data: {
          tag: '// FAQ',
          metaCode: 'PROJECT_SUPPORT_V01',
          items: [
            { q: 'How can I track my package?', a: 'Once your order ships, we email you a tracking code with live updates.' },
            { q: 'What payment methods do you accept?', a: 'We accept Credit/Debit cards, PayPal, Apple Pay, and Google Pay.' },
          ],
        },
      },
    ],
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    status: 'published',
    seo: {
      metaTitle: 'Privacy Policy | VELOUR Independent Fashion House',
      metaDescription: 'Your data deserves the same care as our craft. Learn how VELOUR collects, uses, and safeguards your personal information.',
      metaKeywords: 'privacy policy, data protection, security, cookies, personal information, gdpr',
      ogImage: 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&q=80&w=1200',
      canonicalUrl: 'https://zenvro.com/privacy',
    },
    sections: [
      {
        id: 'privacy-content',
        type: 'policyClauses',
        title: 'PRIVACY POLICY',
        subtitle: 'Your data deserves the same care as our craft. This policy explains what we collect, how we use it, and the control you have over your personal information.',
        isActive: true,
        order: 1,
        data: {
          lastUpdated: '2026-08-08',
          clauses: [
            {
              title: 'INFORMATION WE COLLECT',
              content: 'We collect information you provide directly — name, email, phone, shipping and billing address, payment information, and any communication you send us when ordering or creating an account.\nWe also collect automatic device data — browser type, IP address, device specs, pages you visit, time on page, and the referral link that brought you to VELOUR.',
            },
            {
              title: 'HOW WE USE YOUR INFORMATION',
              content: 'We use your data for fulfilling and shipping your order, processing payments, preventing fraud, communicating updates, improving site performance, responding to customer care, and sending newsletter updates if opted in.',
            },
            {
              title: 'COOKIES & TRACKING',
              content: 'We use cookies and similar technologies to keep you signed in, remember your preferences, and understand how visitors interact with our site. You can control cookies through browser settings.',
            },
            {
              title: 'SHARING & DISCLOSURE',
              content: 'We never sell your personal data. We share only with trusted service partners required to fulfill your order — logistics carriers, payment gateways, and IT infrastructure providers under strict confidentiality agreements.',
            },
            {
              title: 'DATA RETENTION',
              content: 'We retain personal information only for as long as necessary to fulfill the purposes for which it was collected, including tax, legal, and accounting requirements.',
            },
            {
              title: 'YOUR RIGHTS',
              content: 'Depending on your location, you have the right to access, correct, or delete the personal data we hold about you, object to processing, or request data portability.',
            },
            {
              title: 'SECURITY',
              content: 'We implement technical and organizational measures to safeguard your personal data against unauthorized access, loss, or alteration. All payments are processed securely via SSL encryption.',
            },
            {
              title: 'CHILDREN\'S PRIVACY',
              content: 'Our services are not intended for individuals under 16. We do not knowingly collect personal data from children.',
            },
            {
              title: 'CHANGES TO THIS POLICY',
              content: 'We may update this policy periodically. Changes take effect immediately upon posting to the site. We encourage you to review this page regularly.',
            },
            {
              title: 'CONTACT',
              content: 'For any privacy inquiries or to exercise your rights, email our team:\nprivacy@velour.studio\nsupport@velour.studio\nAtelier: 5567 Washington Ave, America, 32289',
            },
          ],
        },
      },
    ],
  },
  {
    title: 'Terms & Conditions',
    slug: 'terms-conditions',
    status: 'published',
    seo: {
      metaTitle: 'Terms & Conditions | VELOUR Independent Fashion House',
      metaDescription: 'The fine print behind the fabric. Review the rules and guidelines governing your use of the VELOUR website and services.',
      metaKeywords: 'terms of service, terms and conditions, user agreement, legal, refunds, shipping policy',
      ogImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1200',
      canonicalUrl: 'https://zenvro.com/terms',
    },
    sections: [
      {
        id: 'terms-content',
        type: 'policyClauses',
        title: 'TERMS & CONDITIONS',
        subtitle: 'Please read these terms carefully before using our website or purchasing our products. By accessing VELOUR, you agree to be bound by these terms.',
        isActive: true,
        order: 1,
        data: {
          lastUpdated: '2026-08-08',
          clauses: [
            {
              title: 'AGREEMENT TO TERMS',
              content: 'By accessing or using VELOUR, you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree to all of these terms, you may not use our services or purchase products.',
            },
            {
              title: 'THE SERVICE',
              content: 'VELOUR provides an online boutique platform for purchasing original garments, footwear, and accessories created by our independent studio.',
            },
            {
              title: 'INTELLECTUAL PROPERTY',
              content: 'All content on this site — including photography, pattern designs, typography, brand names, copy, logos, and UI layouts — is the exclusive property of VELOUR and protected by international copyright laws.',
            },
            {
              title: 'PURCHASES & PRICING',
              content: 'All prices are listed in USD unless otherwise specified. We reserve the right to modify prices or correct errors at any time.',
            },
            {
              title: 'LIMITED DROPS & AVAILABILITY',
              content: 'Products are produced in small, numbered runs and sold on a first-come, first-served basis. Placing an item in your cart does not reserve it.',
            },
            {
              title: 'SHIPPING & DELIVERY',
              content: 'Orders ship within 3–7 business days. International duties and taxes are calculated at checkout where applicable.',
            },
            {
              title: 'RETURNS & EXCHANGES',
              content: 'You have 30 days from delivery to return any unworn garment in its original condition with tags attached. Exchanges for size are complimentary.',
            },
            {
              title: 'USER RESPONSIBILITIES',
              content: 'You agree not to misuse our website, attempt unauthorized access to our servers, or use our content for commercial reproduction without written permission.',
            },
            {
              title: 'LIMITATION OF LIABILITY',
              content: 'VELOUR shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or site.',
            },
            {
              title: 'GOVERNING LAW',
              content: 'These terms are governed by and construed in accordance with the laws of the jurisdiction where VELOUR operates.',
            },
            {
              title: 'CONTACT',
              content: 'For questions regarding these Terms & Conditions, contact us:\nlegal@velour.studio\nsupport@velour.studio\nAtelier: 5567 Washington Ave, America, 32289',
            },
          ],
        },
      },
    ],
  },
];

export const PageModel = {
  async seedDefaults(): Promise<void> {
    const c = await col();
    // Auto-cleanup duplicate home pages
    const homePages = await c.find({
      $or: [
        { slug: 'home' },
        { slug: { $regex: '^home-' } },
        { title: 'Home Page' },
      ],
    }).sort({ createdAt: 1 }).toArray();

    if (homePages.length > 1) {
      const deleteIds = homePages.slice(1).map((p: any) => p._id);
      await c.deleteMany({ _id: { $in: deleteIds } });
      await c.updateOne({ _id: homePages[0]._id }, { $set: { slug: 'home', title: 'Home Page' } });
    }

    for (const def of defaultPagesList) {
      const existing = await c.findOne({ slug: def.slug });
      if (!existing) {
        await this.create(def);
      } else {
        // Upgrade existing records if clauses/sections count is less than default seed
        const formattedSections: PageSection[] = (def.sections || []).map((sec, idx) => ({
          id: sec.id || `sec-${Date.now()}-${idx}`,
          type: sec.type || 'richText',
          title: sec.title || 'Untitled Section',
          subtitle: sec.subtitle || '',
          isActive: sec.isActive !== undefined ? sec.isActive : true,
          order: sec.order !== undefined ? sec.order : idx + 1,
          data: sec.data || {},
        }));

        const existingClausesCount = existing.sections?.[0]?.data?.clauses?.length || 0;
        const defaultClausesCount = def.sections?.[0]?.data?.clauses?.length || 0;

        if (
          def.slug === 'about-us' && (!existing.sections || existing.sections.length < 5 || !existing.sections[0]?.data?.image1)
        ) {
          await c.updateOne({ slug: 'about-us' }, { $set: { sections: formattedSections, updatedAt: new Date() } });
        } else if (
          def.slug === 'home' && (!existing.sections || existing.sections.length < 3 || !existing.sections[0]?.data?.modelImage)
        ) {
          await c.updateOne({ slug: 'home' }, { $set: { sections: formattedSections, updatedAt: new Date() } });
        } else if (
          (def.slug === 'privacy-policy' || def.slug === 'terms-conditions') && existingClausesCount < defaultClausesCount
        ) {
          await c.updateOne({ slug: def.slug }, { $set: { sections: formattedSections, updatedAt: new Date() } });
        } else if (
          def.slug === 'contact-us' && (!existing.sections?.[0]?.data?.email || existing.sections?.[0]?.data?.email === 'support@zenvro.com')
        ) {
          await c.updateOne({ slug: 'contact-us' }, { $set: { sections: formattedSections, updatedAt: new Date() } });
        }
      }
    }
  },

  async create(data: CreatePagePayload): Promise<Page> {
    const c = await col();
    const _id = generateObjectId();
    const now = new Date();

    const title = data.title.trim();
    const slug = data.slug ? slugify(data.slug) : slugify(title);

    // Check slug collision
    const existing = await c.findOne({ slug });
    let finalSlug = slug;
    if (existing) {
      finalSlug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const sections: PageSection[] = (data.sections || []).map((sec, idx) => ({
      id: sec.id || `sec-${Date.now()}-${idx}`,
      type: sec.type || 'richText',
      title: sec.title || 'Untitled Section',
      subtitle: sec.subtitle || '',
      isActive: sec.isActive !== undefined ? sec.isActive : true,
      order: sec.order !== undefined ? sec.order : idx + 1,
      data: sec.data || {},
    }));

    const pageSeo: PageSEO = {
      ...defaultSeo(title),
      ...(data.seo || {}),
    };

    const page: Page = {
      _id,
      title,
      slug: finalSlug,
      status: data.status || 'published',
      sections,
      seo: pageSeo,
      createdAt: now,
      updatedAt: now,
    };

    await c.insertOne(page);
    return page;
  },

  async findById(_id: string): Promise<Page | null> {
    const c = await col();
    return c.findOne({ _id });
  },

  async findBySlug(slug: string): Promise<Page | null> {
    const c = await col();
    return c.findOne({ slug: slug.toLowerCase().trim() });
  },

  async findAll(params: PageListParams = {}): Promise<Page[]> {
    const c = await col();
    const filter: Record<string, unknown> = {};

    if (params.search) {
      const regex = { $regex: params.search, $options: 'i' };
      filter.$or = [{ title: regex }, { slug: regex }];
    }

    if (params.status) {
      filter.status = params.status;
    }

    return c.find(filter).sort({ title: 1 }).toArray();
  },

  async update(_id: string, data: Partial<UpdatePagePayload>): Promise<Page | null> {
    const c = await col();
    const page = await c.findOne({ _id });
    if (!page) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFields: any = { updatedAt: new Date() };

    if (data.title !== undefined) {
      updateFields.title = data.title.trim();
    }

    if (data.slug !== undefined && data.slug.trim()) {
      const newSlug = slugify(data.slug);
      if (newSlug !== page.slug) {
        const slugExists = await c.findOne({ slug: newSlug, _id: { $ne: _id } });
        if (slugExists) {
          throw new Error(`Slug '${newSlug}' is already in use by another page.`);
        }
        updateFields.slug = newSlug;
      }
    }

    if (data.status !== undefined) {
      updateFields.status = data.status;
    }

    if (data.sections !== undefined) {
      updateFields.sections = data.sections.map((sec, idx) => ({
        id: sec.id || `sec-${Date.now()}-${idx}`,
        type: sec.type || 'richText',
        title: sec.title || 'Untitled Section',
        subtitle: sec.subtitle || '',
        isActive: sec.isActive !== undefined ? sec.isActive : true,
        order: sec.order !== undefined ? sec.order : idx + 1,
        data: sec.data || {},
      }));
    }

    if (data.seo !== undefined) {
      updateFields.seo = {
        ...page.seo,
        ...data.seo,
      };
    }

    await c.updateOne({ _id }, { $set: updateFields });
    return c.findOne({ _id });
  },

  async delete(_id: string): Promise<boolean> {
    const c = await col();
    const result = await c.deleteOne({ _id });
    return result.deletedCount > 0;
  },

  async count(): Promise<number> {
    const c = await col();
    return c.countDocuments();
  },
};

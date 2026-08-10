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
      metaTitle: 'Contact Us | Zenvro Store',
      metaDescription: 'Questions, sizing advice, or a collaboration in mind? Drop us a line — a real human from the Zenvro team replies within one working day.',
      metaKeywords: 'contact us, contact zenvro, customer service, support, email, phone, say hello',
      ogImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=1200',
      canonicalUrl: 'https://zenvro.com/contact',
    },
    sections: [
      {
        id: 'contact-info-main',
        type: 'contactInfo',
        title: 'We Would Love to Hear From You',
        subtitle: 'Have a question or need assistance? Reach out to our customer care team.',
        isActive: true,
        order: 1,
        data: {
          email: 'support@zenvro.com',
          phone: '+1 (800) 555-0199',
          address: '742 Evergreen Terrace, Suite 100, New York, NY 10001',
          workingHours: 'Monday - Friday: 9am - 8pm EST',
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
          items: [
            { question: 'How can I track my package?', answer: 'Once your order ships, we email you a tracking code with live updates.' },
            { question: 'What payment methods do you accept?', answer: 'We accept Credit/Debit cards, PayPal, Apple Pay, and Google Pay.' },
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
      metaTitle: 'Privacy Policy | Zenvro Store',
      metaDescription: 'Your data deserves the same care as our craft. Learn how Zenvro collects, uses, and safeguards your personal information.',
      metaKeywords: 'privacy policy, data protection, security, cookies, personal information, gdpr',
      ogImage: 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&q=80&w=1200',
      canonicalUrl: 'https://zenvro.com/privacy',
    },
    sections: [
      {
        id: 'privacy-content',
        type: 'policyClauses',
        title: 'Zenvro Privacy Policy',
        subtitle: 'Last updated: August 2026',
        isActive: true,
        order: 1,
        data: {
          lastUpdated: '2026-08-08',
          clauses: [
            {
              title: '1. Information We Collect',
              content: 'We collect personal details such as your name, email address, shipping address, and payment information when you place an order or create an account.',
            },
            {
              title: '2. How We Use Your Information',
              content: 'Your data is utilized strictly to fulfill orders, process payments, prevent fraud, and improve your personalized shopping experience.',
            },
            {
              title: '3. Data Security',
              content: 'We employ enterprise-grade SSL encryption and secure cloud servers to guard your sensitive data against unauthorized access.',
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
      metaTitle: 'Terms & Conditions | Zenvro Store',
      metaDescription: 'The fine print behind the fabric. Review the rules and guidelines governing your use of the Zenvro website and services.',
      metaKeywords: 'terms of service, terms and conditions, user agreement, legal, refunds, shipping policy',
      ogImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1200',
      canonicalUrl: 'https://zenvro.com/terms',
    },
    sections: [
      {
        id: 'terms-content',
        type: 'policyClauses',
        title: 'Terms & Conditions of Service',
        subtitle: 'Effective Date: August 2026',
        isActive: true,
        order: 1,
        data: {
          lastUpdated: '2026-08-08',
          clauses: [
            {
              title: '1. Acceptance of Terms',
              content: 'By accessing or purchasing from Zenvro, you agree to be bound by these terms and all applicable laws.',
            },
            {
              title: '2. Intellectual Property',
              content: 'All content on this site including text, graphics, logos, and images is the exclusive property of Zenvro Store.',
            },
            {
              title: '3. Limitation of Liability',
              content: 'Zenvro shall not be liable for indirect, incidental, or consequential damages resulting from product use.',
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
    for (const def of defaultPagesList) {
      const existing = await c.findOne({ slug: def.slug });
      if (!existing) {
        await this.create(def);
      } else if (def.slug === 'about-us') {
        // Upgrade existing about-us if sections don't match the new multi-image schema
        if (!existing.sections || existing.sections.length < 5 || !existing.sections[0]?.data?.image1) {
          const formattedSections: PageSection[] = (def.sections || []).map((sec, idx) => ({
            id: sec.id || `sec-${Date.now()}-${idx}`,
            type: sec.type || 'richText',
            title: sec.title || 'Untitled Section',
            subtitle: sec.subtitle || '',
            isActive: sec.isActive !== undefined ? sec.isActive : true,
            order: sec.order !== undefined ? sec.order : idx + 1,
            data: sec.data || {},
          }));
          await c.updateOne(
            { slug: 'about-us' },
            { $set: { sections: formattedSections, updatedAt: new Date() } }
          );
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

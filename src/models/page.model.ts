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
      ogImage: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=1200',
      canonicalUrl: 'https://zenvro.com/about-us',
    },
    sections: [
      {
        id: 'hero-about',
        type: 'hero',
        title: 'THE STORY OF VELOUR',
        subtitle: 'Velour represents a vision of modern elegance and urban craftsmanship. Founded with a passion for premium textiles and timeless design, our brand merges utility and luxury.',
        isActive: true,
        order: 1,
        data: {
          bgImage: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=1200',
          ctaLabel: 'EXPLORE COLLECTION',
          ctaLink: '/products',
          secondaryCtaLabel: 'OUR TIMELINE',
          secondaryCtaLink: '#timeline',
        },
      },
      {
        id: 'mission-vision-about',
        type: 'missionVision',
        title: 'EIGHT YEARS IN THE MAKING',
        subtitle: 'From a small boutique vision to an international urban fashion brand, every stitch reflects our commitment to perfection.',
        isActive: true,
        order: 2,
        data: {
          missionHeading: '2018 - THE FIRST REGULAR LINE',
          missionText: 'Launched our core apparel baseline focused on raw luxury materials and classic silhouettes.',
          visionHeading: '2020 - THE SUSTAINABLE SHIFT',
          visionText: 'Pivoted 100% of our outerwear production to eco-responsible, recycled materials and ethically sourced cotton.',
          values: [
            '2022 - THE ARCHIVE DROPS: Limited edition seasonal runs that sold out globally within minutes.',
            '2024 - GLOBAL EXPANSION: Established flagships across Tokyo, Paris, and London.',
            '2026 - BEYOND & FUTURE: Next-gen technical wear combining ergonomic design with streetwear aesthetics.'
          ],
        },
      },
      {
        id: 'features-about',
        type: 'featuresGrid',
        title: 'WHAT WE STAND FOR',
        subtitle: 'The foundational pillars driving every piece in our collection.',
        isActive: true,
        order: 3,
        data: {
          items: [
            { icon: 'ShieldCheck', title: 'MATERIAL OBSESSION', description: 'Every fabric is hand-selected from top sustainable mills across Italy and Japan.' },
            { icon: 'Award', title: 'SUSTAINABLE FIRST', description: 'Zero-waste cutting patterns, eco-dyes, and plastic-free recyclable packaging.' },
            { icon: 'Sparkles', title: 'HAND-FINISHED', description: 'Meticulous stitching and custom hardware crafted by seasoned apparel artisans.' },
            { icon: 'Flame', title: 'LIMITED DROPS', description: 'Exclusivity at heart. Once a seasonal drop sells out, it enters our permanent archive.' },
            { icon: 'Scissors', title: 'TAILORED CUTS', description: 'Ergonomic pattern design ensuring sleek drape, durability, and daily comfort.' },
            { icon: 'UserCheck', title: 'ELITE FIT', description: 'Designed to flatter all body types with subtle adjustable elements and modern cuts.' },
          ],
        },
      },
      {
        id: 'faq-about',
        type: 'faq',
        title: 'QUESTIONS, ANSWERED',
        subtitle: 'Everything you need to know about Velour products, shipping, and releases.',
        isActive: true,
        order: 4,
        data: {
          items: [
            { question: 'WHERE DOES VELOUR SHIP AND HOW FAST?', answer: 'We ship globally via express logistics. Standard international delivery takes 3-5 business days.' },
            { question: 'HOW DO LIMITED DROPS WORK?', answer: 'Limited drops are released in numbered batches. Members get priority access 15 minutes before public launches.' },
            { question: 'WHAT PACKAGING DOES VELOUR USE?', answer: 'All orders are packaged in 100% biodegradable and FSC-certified recycled materials.' },
            { question: 'WHAT IS YOUR RETURN AND EXCHANGE POLICY?', answer: 'We offer hassle-free 30-day returns and free exchanges for size adjustments.' },
            { question: 'HOW SHOULD I CARE FOR MY GARMENT?', answer: 'Machine wash cold inside out with mild detergent. Hang dry to maintain fabric tension and color vibrancy.' },
            { question: 'WILL SOLD-OUT ITEMS EVER BE RE-RELEASED?', answer: 'Core wardrobe essentials are restocked quarterly, while Archive Drop items are strictly one-time releases.' },
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

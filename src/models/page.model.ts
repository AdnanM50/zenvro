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
      metaTitle: 'About Us | Zenvro Premium Store',
      metaDescription: 'Discover our story, mission, and dedication to crafting high quality products.',
      metaKeywords: 'about us, zenvro, quality, fashion, brand',
    },
    sections: [
      {
        id: 'hero-about',
        type: 'hero',
        title: 'Unlock Your Potential at Zenvro Pro',
        subtitle: 'Designed for quality lovers and trendsetters across the globe.',
        isActive: true,
        order: 1,
        data: {
          bgImage: '',
          ctaLabel: 'Explore Collection',
          ctaLink: '/products',
          secondaryCtaLabel: 'Contact Us',
          secondaryCtaLink: '/contact-us',
        },
      },
      {
        id: 'mission-vision-about',
        type: 'missionVision',
        title: 'Our Purpose & Vision',
        subtitle: 'Guiding values driving our everyday innovation.',
        isActive: true,
        order: 2,
        data: {
          missionHeading: 'Our Mission',
          missionText: 'To elevate daily living by providing timeless, sustainable, and meticulously crafted products.',
          visionHeading: 'Our Vision',
          visionText: 'To become the global benchmark for modern ecommerce excellence and customer trust.',
          values: ['Uncompromising Quality', 'Customer First', 'Sustainable Practices', 'Continuous Innovation'],
        },
      },
      {
        id: 'features-about',
        type: 'featuresGrid',
        title: 'Why Choose Zenvro',
        subtitle: 'The core pillars of our commitment to you.',
        isActive: true,
        order: 3,
        data: {
          items: [
            { icon: 'ShieldCheck', title: 'Certified Excellence', description: 'Every item is verified for premium quality standards.' },
            { icon: 'Truck', title: 'Global Express Shipping', description: 'Fast, secure doorstep delivery worldwide.' },
            { icon: 'Headphones', title: '24/7 Priority Support', description: 'Dedicated customer delight specialists ready to assist.' },
            { icon: 'RefreshCw', title: 'Easy Returns', description: 'Hassle-free 30-day money-back return policy.' },
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
      metaTitle: 'Contact Us | Zenvro Help Center',
      metaDescription: 'Get in touch with the Zenvro support team. We are available 24/7 to answer your queries.',
      metaKeywords: 'contact us, customer service, support, email, phone',
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
      metaTitle: 'Privacy Policy | Zenvro',
      metaDescription: 'Learn how Zenvro collects, uses, and safeguards your personal information.',
      metaKeywords: 'privacy policy, data protection, security, cookies',
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
      metaTitle: 'Terms & Conditions | Zenvro',
      metaDescription: 'Review the rules and guidelines governing the use of Zenvro website and services.',
      metaKeywords: 'terms of service, terms and conditions, user agreement, legal',
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

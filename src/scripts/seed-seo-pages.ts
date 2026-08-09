import dotenv from 'dotenv';
dotenv.config({ path: 'e:/Next-apps/zenvro/.env' });

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.DB_STRING || '';
const DB_NAME = 'velour';

type SeoData = {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  canonicalUrl: string;
};

type PageSeed = {
  title: string;
  slug: string;
  seo: SeoData;
};

const pageSeeds: PageSeed[] = [
  {
    title: 'Contact Us',
    slug: 'contact-us',
    seo: {
      metaTitle: 'Contact Us | Zenvro Store',
      metaDescription: 'Questions, sizing advice, or a collaboration in mind? Drop us a line — a real human from the Zenvro team replies within one working day.',
      metaKeywords: 'contact us, contact zenvro, customer service, support, email, phone, say hello',
      ogImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=1200',
      canonicalUrl: 'https://zenvro.com/contact',
    },
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    seo: {
      metaTitle: 'Privacy Policy | Zenvro Store',
      metaDescription: 'Your data deserves the same care as our craft. Learn how Zenvro collects, uses, and safeguards your personal information.',
      metaKeywords: 'privacy policy, data protection, security, cookies, personal information, gdpr',
      ogImage: 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&q=80&w=1200',
      canonicalUrl: 'https://zenvro.com/privacy',
    },
  },
  {
    title: 'Terms & Conditions',
    slug: 'terms-conditions',
    seo: {
      metaTitle: 'Terms & Conditions | Zenvro Store',
      metaDescription: 'The fine print behind the fabric. Review the rules and guidelines governing your use of the Zenvro website and services.',
      metaKeywords: 'terms of service, terms and conditions, user agreement, legal, refunds, shipping policy',
      ogImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1200',
      canonicalUrl: 'https://zenvro.com/terms',
    },
  },
];

async function updateDb() {
  if (!MONGODB_URI) {
    throw new Error('DB_STRING environment variable is missing');
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log('Connected to MongoDB');
  const db = client.db(DB_NAME);
  const pages = db.collection('pages');

  for (const seed of pageSeeds) {
    const existing = await pages.findOne({ slug: seed.slug });

    if (existing) {
      await pages.updateOne(
        { slug: seed.slug },
        {
          $set: {
            title: seed.title,
            seo: seed.seo,
            status: 'published',
            updatedAt: new Date(),
          },
        }
      );
      console.log(`Updated SEO for "${seed.title}" (${seed.slug})`);
    } else {
      await pages.insertOne({
        title: seed.title,
        slug: seed.slug,
        status: 'published',
        sections: [],
        seo: seed.seo,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`Created "${seed.title}" (${seed.slug})`);
    }
  }

  console.log('Database updated successfully');
  await client.close();
  process.exit(0);
}

updateDb().catch((err) => {
  console.error('Error updating DB:', err);
  process.exit(1);
});

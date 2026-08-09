import dotenv from 'dotenv';
dotenv.config({ path: 'e:/Next-apps/zenvro/.env' });

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.DB_STRING || '';
const DB_NAME = 'velour';

async function updateDb() {
  if (!MONGODB_URI) {
    throw new Error('DB_STRING environment variable is missing');
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log('Connected to MongoDB');
  const db = client.db(DB_NAME);

  const seoData = {
    metaTitle: 'The Story of Velour | Eight Years of Urban & Streetwear Craftsmanship',
    metaDescription: 'Discover the story behind VELOUR. Eight years in the making—crafting premium urban fashion, sustainable outerwear, limited drops, and tailored fits for trendsetters worldwide.',
    metaKeywords: 'velour, urban fashion, streetwear, story of velour, sustainable fashion, outer wear, archive drops, tailored fit, hand finished apparel',
    ogImage: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=1200',
    canonicalUrl: 'https://zenvro.com/about-us',
  };

  const sectionsData = [
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
          { question: 'HOW DOES LIMITED DROPS WORK?', answer: 'Limited drops are released in numbered batches. Members get priority access 15 minutes before public launches.' },
          { question: 'WHAT PACKAGING DOES VELOUR USE?', answer: 'All orders are packaged in 100% biodegradable and FSC-certified recycled materials.' },
          { question: 'WHAT IS YOUR RETURN AND EXCHANGE POLICY?', answer: 'We offer hassle-free 30-day returns and free exchanges for size adjustments.' },
          { question: 'HOW SHOULD I CARE FOR MY GARMENT?', answer: 'Machine wash cold inside out with mild detergent. Hang dry to maintain fabric tension and color vibrancy.' },
          { question: 'WILL SOLD-OUT ITEMS EVER BE RE-RELEASED?', answer: 'Core wardrobe essentials are restocked quarterly, while Archive Drop items are strictly one-time releases.' },
        ],
      },
    },
  ];

  const updateResult = await db.collection('pages').updateOne(
    { slug: 'about-us' },
    {
      $set: {
        title: 'About Us',
        slug: 'about-us',
        status: 'published',
        sections: sectionsData,
        seo: seoData,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  console.log('Database updated successfully:', updateResult);
  await client.close();
  process.exit(0);
}

updateDb().catch((err) => {
  console.error('Error updating DB:', err);
  process.exit(1);
});

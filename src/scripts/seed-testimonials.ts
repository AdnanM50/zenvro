import dotenv from 'dotenv';
dotenv.config({ path: 'e:/Next-apps/zenvro/.env' });

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.DB_STRING || '';
const DB_NAME = 'velour';

type TestimonialSeed = {
  name: string;
  role: string;
  quote: string;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  status: 'active' | 'inactive';
};

const testimonialSeeds: TestimonialSeed[] = [
  {
    name: 'Sophia Anderson',
    role: 'Creative Director',
    quote: 'I was impressed by the quality and attention to detail. The clothes look even better in person and the fit is fantastic.',
    rating: 5,
    reviewCount: 36,
    isFeatured: true,
    status: 'active',
  },
  {
    name: 'Olivia Martinez',
    role: 'Lifestyle Blogger',
    quote: 'The collection is stylish, comfortable, and incredibly easy to wear. I have already recommended it to several of my friends.',
    rating: 5,
    reviewCount: 28,
    isFeatured: true,
    status: 'active',
  },
  {
    name: 'Amelia Brown',
    role: 'Fashion Consultant',
    quote: 'Beautiful designs with excellent fabric quality. The sizing was accurate and my order arrived exactly as expected.',
    rating: 4.5,
    reviewCount: 42,
    isFeatured: false,
    status: 'active',
  },
  {
    name: 'Isabella Taylor',
    role: 'Content Creator',
    quote: 'I absolutely love the style and quality. The pieces are versatile enough for both casual days and special occasions.',
    rating: 5,
    reviewCount: 31,
    isFeatured: true,
    status: 'active',
  },
  {
    name: 'Mia Johnson',
    role: 'Model & Influencer',
    quote: 'The fit is amazing and the material feels premium. You can really see the craftsmanship in every detail.',
    rating: 4.5,
    reviewCount: 57,
    isFeatured: false,
    status: 'active',
  },
  {
    name: 'Charlotte Davis',
    role: 'Boutique Owner',
    quote: 'A wonderful shopping experience from start to finish. The quality exceeded my expectations and the designs are gorgeous.',
    rating: 5,
    reviewCount: 63,
    isFeatured: true,
    status: 'active',
  },
  {
    name: 'Evelyn Wilson',
    role: 'Digital Creator',
    quote: 'These are some of the most comfortable and stylish pieces I have purchased. Great quality, beautiful designs, and a perfect fit.',
    rating: 5,
    reviewCount: 38,
    isFeatured: false,
    status: 'active',
  },
];

async function seedTestimonials() {
  if (!MONGODB_URI) {
    throw new Error('DB_STRING environment variable is missing');
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log('Connected to MongoDB');
  const db = client.db(DB_NAME);
  const testimonials = db.collection('testimonials');

  let inserted = 0;
  let skipped = 0;

  for (const seed of testimonialSeeds) {
    const existing = await testimonials.findOne({ name: seed.name });

    if (existing) {
      skipped += 1;
      console.log(`Skipped "${seed.name}" (already exists)`);
      continue;
    }

    const now = new Date();
    await testimonials.insertOne({
      ...seed,
      avatar: '',
      createdAt: now,
      updatedAt: now,
    });
    inserted += 1;
    console.log(`Inserted "${seed.name}" (${seed.role})`);
  }

  console.log(`Seed complete — ${inserted} inserted, ${skipped} skipped`);
  await client.close();
  process.exit(0);
}

seedTestimonials().catch((err) => {
  console.error('Error seeding testimonials:', err);
  process.exit(1);
});

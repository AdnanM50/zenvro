import { buildPageMetadata } from '@/lib/pageMetadata';
import { PageModel } from '@/models/page.model';

jest.mock('@/models/page.model', () => ({
  PageModel: {
    seedDefaults: jest.fn().mockResolvedValue(undefined),
    findBySlug: jest.fn(),
  },
}));

const mockedSeedDefaults = PageModel.seedDefaults as jest.Mock;
const mockedFindBySlug = PageModel.findBySlug as jest.Mock;

const FALLBACK = {
  title: 'Fallback Title',
  description: 'Fallback description.',
  keywords: ['fallback-keyword', 'ZenVro'],
  ogImage: 'https://images.example.com/fallback.jpg',
};

describe('buildPageMetadata()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSeedDefaults.mockResolvedValue(undefined);
  });

  it('uses fallback values when no page exists', async () => {
    mockedFindBySlug.mockResolvedValue(null);

    const meta = await buildPageMetadata('missing-page', '/missing', FALLBACK);

    expect(meta.title).toBe('Fallback Title');
    expect(meta.description).toBe('Fallback description.');
    expect(meta.keywords).toEqual(['fallback-keyword', 'zenvro']);
    expect(meta.openGraph?.title).toBe('Fallback Title');
    expect(meta.alternates?.canonical).toBe('https://zenvro.com/missing');
    expect(mockedSeedDefaults).toHaveBeenCalled();
    expect(mockedFindBySlug).toHaveBeenCalledWith('missing-page');
  });

  it('uses fallback values when page.seo is undefined', async () => {
    mockedFindBySlug.mockResolvedValue({ _id: 'p1', title: 'Contact', seo: undefined });

    const meta = await buildPageMetadata('contact-us', '/contact', FALLBACK);

    expect(meta.title).toBe('Fallback Title');
    expect(meta.description).toBe('Fallback description.');
    expect(meta.alternates?.canonical).toBe('https://zenvro.com/contact');
  });

  it('overrides everything when a complete SEO object is present', async () => {
    mockedFindBySlug.mockResolvedValue({
      _id: 'p1',
      slug: 'about-us',
      seo: {
        metaTitle: 'The Story of Velour',
        metaDescription: 'Eight years in the making.',
        focusKeyword: 'velour streetwear',
        metaKeywords: 'velour, urban fashion, streetwear',
        additionalKeywords: ['sustainable fashion', 'archive drops'],
        searchPhrases: ['where to buy velour jacket online', 'sustainable fashion'],
        ogImage: 'https://images.example.com/og.jpg',
        canonicalUrl: 'https://zenvro.com/custom-canonical',
      },
    });

    const meta = await buildPageMetadata('about-us', '/about', FALLBACK);

    expect(meta.title).toBe('The Story of Velour');
    expect(meta.description).toBe('Eight years in the making.');
    // focus keyword first, everything lowercased, duplicates removed
    expect(meta.keywords).toEqual([
      'velour streetwear',
      'velour',
      'urban fashion',
      'streetwear',
      'sustainable fashion',
      'archive drops',
      'where to buy velour jacket online',
    ]);
    expect(meta.openGraph?.images).toEqual([{ url: 'https://images.example.com/og.jpg', width: 1200, height: 630 }]);
    expect(meta.twitter?.images).toEqual(['https://images.example.com/og.jpg']);
    expect(meta.alternates?.canonical).toBe('https://zenvro.com/custom-canonical');
  });

  it('falls back per-field when SEO is only partially filled', async () => {
    mockedFindBySlug.mockResolvedValue({
      _id: 'p1',
      seo: {
        metaTitle: 'Only a title',
      },
    });

    const meta = await buildPageMetadata('terms-conditions', '/terms', FALLBACK);

    expect(meta.title).toBe('Only a title');
    expect(meta.description).toBe('Fallback description.');
    expect(meta.keywords).toEqual(['fallback-keyword', 'zenvro']);
    expect(meta.alternates?.canonical).toBe('https://zenvro.com/terms');
  });

  it('trims messy metaKeywords and drops empty entries', async () => {
    mockedFindBySlug.mockResolvedValue({
      _id: 'p1',
      seo: {
        metaTitle: 'T',
        metaDescription: 'D',
        metaKeywords: '  one ,two,  , three ,,four ',
      },
    });

    const meta = await buildPageMetadata('contact-us', '/contact', FALLBACK);

    expect(meta.keywords).toEqual(['one', 'two', 'three', 'four']);
  });

  it('deduplicates identical keywords across all sources (case-insensitive)', async () => {
    mockedFindBySlug.mockResolvedValue({
      _id: 'p1',
      seo: {
        metaTitle: 'T',
        metaDescription: 'D',
        focusKeyword: 'velour',
        metaKeywords: 'VELOUR',
        additionalKeywords: ['Velour', 'brand'],
        searchPhrases: ['brand'],
      },
    });

    const meta = await buildPageMetadata('about-us', '/about', FALLBACK);

    expect(meta.keywords).toEqual(['velour', 'brand']);
  });

  it('uses fallback keywords when no keyword fields exist on SEO', async () => {
    mockedFindBySlug.mockResolvedValue({
      _id: 'p1',
      seo: {
        metaTitle: 'T',
        metaDescription: 'D',
      },
    });

    const meta = await buildPageMetadata('privacy-policy', '/privacy', FALLBACK);

    expect(meta.keywords).toEqual(['fallback-keyword', 'zenvro']);
  });

  it('gracefully falls back when the database call throws', async () => {
    mockedSeedDefaults.mockRejectedValue(new Error('db down'));

    const meta = await buildPageMetadata('terms-conditions', '/terms', FALLBACK);

    expect(meta.title).toBe('Fallback Title');
    expect(meta.description).toBe('Fallback description.');
    expect(meta.alternates?.canonical).toBe('https://zenvro.com/terms');
  });

  it('always includes canonical, robots, and openGraph base fields', async () => {
    mockedFindBySlug.mockResolvedValue(null);

    const meta = await buildPageMetadata('about-us', '/about', FALLBACK);

    expect(meta.alternates?.canonical).toBe('https://zenvro.com/about');
    expect(meta.robots).toMatchObject({ index: true, follow: true });
    const og = meta.openGraph as unknown as { siteName?: string; type?: string; url?: string };
    expect(og.siteName).toBe('VELOUR');
    expect(og.type).toBe('website');
    expect(og.url).toBe('https://zenvro.com/about');
    expect((meta.twitter as unknown as { card?: string }).card).toBe('summary_large_image');
  });
});

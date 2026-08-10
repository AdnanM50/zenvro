import { getPagePublicPath } from '@/lib/pagePaths';

describe('getPagePublicPath()', () => {
  it('maps CMS slugs to their public routes', () => {
    expect(getPagePublicPath('about-us')).toBe('/about');
    expect(getPagePublicPath('contact-us')).toBe('/contact');
    expect(getPagePublicPath('privacy-policy')).toBe('/privacy');
    expect(getPagePublicPath('terms-conditions')).toBe('/terms');
  });

  it('falls back to the slug for unknown pages', () => {
    expect(getPagePublicPath('faq')).toBe('/faq');
    expect(getPagePublicPath('shipping')).toBe('/shipping');
  });

  it('handles slugs that already start with a leading slash', () => {
    expect(getPagePublicPath('/about-us')).toBe('/about');
    expect(getPagePublicPath('/unknown-page')).toBe('/unknown-page');
  });

  it('handles empty and edge-case slugs safely', () => {
    expect(getPagePublicPath('')).toBe('/');
    expect(getPagePublicPath('  ')).toBe('/  ');
  });
});

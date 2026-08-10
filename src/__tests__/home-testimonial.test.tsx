// ---------------------------------------------------------------------------
// Tests: HomeTestimonial (src/app/_components/home/HomeTestimonial.tsx)
// ---------------------------------------------------------------------------
// Covers the homepage testimonials section after removing the old dummy data:
//   1. Rendering real testimonial data (name, role, quote, avatar, rating)
//   2. Avatar fallback placeholder when no image is set
//   3. Carousel navigation (next / prev / wrap-around / disabled states)
//   4. Empty state when no testimonials exist
//   5. Section config (header index / tag / footer) from the CMS section
//   6. ISR seeding via initialTestimonials
// ---------------------------------------------------------------------------

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import HomeTestimonial from '@/app/_components/home/HomeTestimonial';
import { usePublicTestimonials } from '@/hooks';
import type { PageSection, Testimonial } from '@/types';

// ── Mock framer-motion (ESM in node_modules breaks ts-jest transforms) ─────
jest.mock('framer-motion', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactLib = require('react');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createMotion = (tag: string) => (props: any) => {
    const rest = { ...props };
    delete rest.initial;
    delete rest.animate;
    delete rest.exit;
    delete rest.transition;
    delete rest.variants;
    delete rest.whileInView;
    delete rest.whileHover;
    delete rest.whileTap;
    delete rest.viewport;
    delete rest.custom;
    delete rest.drag;
    return ReactLib.createElement(tag, rest);
  };
  return {
    motion: {
      div: createMotion('div'),
      blockquote: createMotion('blockquote'),
      button: createMotion('button'),
    },
  };
});

jest.mock('@/hooks', () => ({
  usePublicTestimonials: jest.fn(),
}));

const mockedUsePublicTestimonials = usePublicTestimonials as jest.Mock;

function makeTestimonial(overrides: Partial<Testimonial> = {}): Testimonial {
  return {
    _id: 't1',
    name: 'Emma Williams',
    role: 'Fashion Stylist',
    quote: 'Everything is absolutely perfect!',
    avatar: 'https://img.com/avatar.png',
    rating: 5,
    reviewCount: 49,
    isFeatured: true,
    status: 'active',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function mockHookData(testimonials: Testimonial[]) {
  mockedUsePublicTestimonials.mockReturnValue({
    data: { success: true, message: 'Testimonials fetched', data: testimonials },
  });
}

const defaultSection: PageSection = {
  id: 's1',
  type: 'homeTestimonial',
  title: 'Testimonials',
  isActive: true,
  order: 0,
  data: {},
};

describe('HomeTestimonial', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHookData([makeTestimonial()]);
  });

  describe('rendering testimonial data (no dummy data)', () => {
    it('renders the testimonial name, role and quote', () => {
      render(<HomeTestimonial section={defaultSection} />);

      expect(screen.getByText('Emma Williams')).toBeInTheDocument();
      expect(screen.getByText('Fashion Stylist')).toBeInTheDocument();
      expect(screen.getByText('Everything is absolutely perfect!')).toBeInTheDocument();
    });

    it('does not render any hardcoded dummy quote or author', () => {
      render(<HomeTestimonial section={defaultSection} />);

      expect(screen.queryByText('[Emma Williams]')).not.toBeInTheDocument();
      expect(
        screen.queryByText(/This brand has completely transformed my wardrobe/i),
      ).not.toBeInTheDocument();
    });

    it('renders the avatar image with an accessible name', () => {
      render(<HomeTestimonial section={defaultSection} />);

      const img = screen.getByRole('img', { name: 'Emma Williams Profile' });
      expect(img.getAttribute('src')).toContain('https%3A%2F%2Fimg.com%2Favatar.png');
    });

    it('renders an initial placeholder when no avatar is set', () => {
      mockHookData([makeTestimonial({ avatar: '' })]);
      render(<HomeTestimonial section={defaultSection} />);

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      expect(screen.getByText('E')).toBeInTheDocument();
    });

    it('renders the rating stars and numeric value', () => {
      const { container } = render(<HomeTestimonial section={defaultSection} />);

      const stars = container.querySelectorAll('[data-icon="star"]');
      expect(stars.length).toBe(5);
      expect(stars[0]).not.toHaveClass('opacity-20');
      expect(screen.getByText('5.0 (49 Reviews)')).toBeInTheDocument();
    });

    it('renders partially filled stars for a 4 rating', () => {
      mockHookData([makeTestimonial({ rating: 4, reviewCount: 28 })]);
      const { container } = render(<HomeTestimonial section={defaultSection} />);

      const stars = container.querySelectorAll('[data-icon="star"]');
      expect(stars.length).toBe(5);
      expect(stars[0]).not.toHaveClass('opacity-20');
      expect(stars[4]).toHaveClass('opacity-20');
      expect(screen.getByText('4.0 (28 Reviews)')).toBeInTheDocument();
    });

    it('renders the fractional rating value with full stars (rating 4.5)', () => {
      mockHookData([makeTestimonial({ rating: 4.5, reviewCount: 28 })]);
      const { container } = render(<HomeTestimonial section={defaultSection} />);

      const stars = container.querySelectorAll('[data-icon="star"]');
      expect(stars.length).toBe(5);
      expect(screen.getByText('4.5 (28 Reviews)')).toBeInTheDocument();
    });

    it('omits the review count text when reviewCount is undefined', () => {
      mockHookData([makeTestimonial({ reviewCount: undefined })]);
      render(<HomeTestimonial section={defaultSection} />);

      expect(screen.getByText('5.0')).toBeInTheDocument();
      expect(screen.queryByText(/Reviews/i)).not.toBeInTheDocument();
    });
  });

  describe('carousel navigation', () => {
    const two = [
      makeTestimonial({ _id: 't1', name: 'Emma Williams' }),
      makeTestimonial({ _id: 't2', name: 'Sophia Anderson' }),
    ];

    it('advances to the next testimonial on "next" click', () => {
      mockHookData(two);
      render(<HomeTestimonial section={defaultSection} />);

      expect(screen.getByText('Emma Williams')).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('Next testimonial'));

      expect(screen.getByText('Sophia Anderson')).toBeInTheDocument();
      expect(screen.queryByText('Emma Williams')).not.toBeInTheDocument();
    });

    it('goes back to the previous testimonial on "previous" click', () => {
      mockHookData(two);
      render(<HomeTestimonial section={defaultSection} />);

      fireEvent.click(screen.getByLabelText('Next testimonial'));
      expect(screen.getByText('Sophia Anderson')).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('Previous testimonial'));
      expect(screen.getByText('Emma Williams')).toBeInTheDocument();
    });

    it('wraps around from the last to the first testimonial', () => {
      mockHookData(two);
      render(<HomeTestimonial section={defaultSection} />);

      fireEvent.click(screen.getByLabelText('Next testimonial'));
      fireEvent.click(screen.getByLabelText('Next testimonial'));

      expect(screen.getByText('Emma Williams')).toBeInTheDocument();
    });

    it('wraps around from the first to the last testimonial going backwards', () => {
      mockHookData(two);
      render(<HomeTestimonial section={defaultSection} />);

      fireEvent.click(screen.getByLabelText('Previous testimonial'));

      expect(screen.getByText('Sophia Anderson')).toBeInTheDocument();
    });

    it('disables the navigation buttons when there is only one testimonial', () => {
      mockHookData([makeTestimonial()]);
      render(<HomeTestimonial section={defaultSection} />);

      expect(screen.getByLabelText('Next testimonial')).toBeDisabled();
      expect(screen.getByLabelText('Previous testimonial')).toBeDisabled();
    });
  });

  describe('empty state', () => {
    it('shows an empty message when there are no testimonials', () => {
      mockHookData([]);
      render(<HomeTestimonial section={defaultSection} />);

      expect(screen.getByText('No testimonials available yet.')).toBeInTheDocument();
      expect(screen.queryByLabelText('Next testimonial')).not.toBeInTheDocument();
    });

    it('falls back to initialTestimonials when the hook has no data (ISR seed)', () => {
      mockedUsePublicTestimonials.mockReturnValue({ data: undefined });
      render(
        <HomeTestimonial
          section={defaultSection}
          initialTestimonials={[makeTestimonial({ _id: 'seed-1', name: 'Seeded User' })]}
        />,
      );

      expect(screen.getByText('Seeded User')).toBeInTheDocument();
    });
  });

  describe('section config', () => {
    it('uses default header index, tag and footer text when the section is empty', () => {
      render(<HomeTestimonial section={defaultSection} />);

      expect(screen.getByText('01/8')).toBeInTheDocument();
      expect(screen.getByText('[Testimonial]')).toBeInTheDocument();
      expect(screen.getByText('See What Our Customers Are Saying')).toBeInTheDocument();
    });

    it('uses CMS-provided header index, tag and footer text', () => {
      const section: PageSection = {
        ...defaultSection,
        subtitle: 'Loved by our community',
        data: { headerIndex: '02/8', tag: '[Loved]', footerText: 'Join our happy customers' },
      };
      render(<HomeTestimonial section={section} />);

      expect(screen.getByText('02/8')).toBeInTheDocument();
      expect(screen.getByText('[Loved]')).toBeInTheDocument();
      expect(screen.getByText('Loved by our community')).toBeInTheDocument();
      expect(screen.queryByText('Join our happy customers')).not.toBeInTheDocument();
    });

    it('uses the footerText from section data when no subtitle is set', () => {
      const section: PageSection = {
        ...defaultSection,
        data: { footerText: 'Real reviews from real people' },
      };
      render(<HomeTestimonial section={section} />);

      expect(screen.getByText('Real reviews from real people')).toBeInTheDocument();
    });
  });

  describe('data resilience', () => {
    it('resets the active index when the list shrinks (admin deleted items)', async () => {
      const three = [
        makeTestimonial({ _id: 't1', name: 'Alpha' }),
        makeTestimonial({ _id: 't2', name: 'Beta' }),
        makeTestimonial({ _id: 't3', name: 'Gamma' }),
      ];
      const { rerender } = render(<HomeTestimonial section={defaultSection} />);

      mockHookData(three);
      rerender(<HomeTestimonial section={defaultSection} />);

      fireEvent.click(screen.getByLabelText('Next testimonial'));
      fireEvent.click(screen.getByLabelText('Next testimonial'));
      expect(screen.getByText('Gamma')).toBeInTheDocument();

      mockHookData([makeTestimonial({ _id: 't1', name: 'Alpha' })]);
      rerender(<HomeTestimonial section={defaultSection} />);

      await waitFor(() => expect(screen.getByText('Alpha')).toBeInTheDocument());
      expect(screen.queryByText('Gamma')).not.toBeInTheDocument();
    });
  });
});

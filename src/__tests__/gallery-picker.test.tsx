import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GalleryPicker from '@/components/admin/GalleryPicker';
import { getGallery, createGalleryItem } from '@/services/gallery.service';
import toast from 'react-hot-toast';

// ── Mock framer-motion (ESM in node_modules breaks ts-jest transforms) ─────
jest.mock('framer-motion', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactLib = require('react');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MotionDiv = (props: any) => {
    const rest = { ...props };
    delete rest.initial;
    delete rest.animate;
    delete rest.exit;
    delete rest.transition;
    return ReactLib.createElement('div', rest);
  };
  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      ReactLib.createElement(ReactLib.Fragment, null, children),
    motion: { div: MotionDiv },
  };
});

jest.mock('@/services/gallery.service', () => ({
  getGallery: jest.fn(),
  createGalleryItem: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockToast = toast as jest.Mocked<typeof toast>;

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

function renderPicker(props?: Partial<React.ComponentProps<typeof GalleryPicker>>) {
  const queryClient = createTestQueryClient();
  const utils = render(
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(GalleryPicker, {
        open: true,
        onClose: jest.fn(),
        onSelect: jest.fn(),
        ...props,
      } as React.ComponentProps<typeof GalleryPicker>),
    ),
  );
  return { ...utils, queryClient };
}

const galleryResponse = {
  success: true,
  message: 'Gallery items fetched',
  data: [
    { _id: 'g1', url: 'https://example.com/a.jpg', title: 'Hero', source: 'url' },
    { _id: 'g2', url: 'https://res.cloudinary.com/x/b.jpg', title: 'Banner', source: 'upload' },
  ],
  meta: { page: 1, limit: 24, total: 2, totalPages: 1 },
};

beforeEach(() => {
  jest.clearAllMocks();
  (getGallery as jest.Mock).mockResolvedValue(galleryResponse);
});

describe('GalleryPicker', () => {
  it('renders the media library tab with gallery images', async () => {
    renderPicker();

    expect(screen.getByRole('button', { name: 'Media Library' })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByAltText('Hero')).toBeInTheDocument();
      expect(screen.getByAltText('Banner')).toBeInTheDocument();
    });
  });

  it('calls onSelect with a single URL when an image is picked and Insert is clicked', async () => {
    const onSelect = jest.fn();
    renderPicker({ onSelect, multiple: false });

    await waitFor(() => expect(screen.getByAltText('Hero')).toBeInTheDocument());

    fireEvent.click(screen.getByAltText('Hero'));
    fireEvent.click(screen.getByRole('button', { name: 'Insert' }));

    expect(onSelect).toHaveBeenCalledWith(['https://example.com/a.jpg']);
  });

  it('selects multiple images when multiple is true', async () => {
    const onSelect = jest.fn();
    renderPicker({ onSelect, multiple: true });

    await waitFor(() => expect(screen.getByAltText('Hero')).toBeInTheDocument());

    fireEvent.click(screen.getByAltText('Hero'));
    fireEvent.click(screen.getByAltText('Banner'));

    expect(screen.getByText('2 images selected')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Insert (2)' }));

    expect(onSelect).toHaveBeenCalledWith([
      'https://example.com/a.jpg',
      'https://res.cloudinary.com/x/b.jpg',
    ]);
  });

  it('toggles a selection off when clicking the same image again', async () => {
    renderPicker({ multiple: true });

    await waitFor(() => expect(screen.getByAltText('Hero')).toBeInTheDocument());

    fireEvent.click(screen.getByAltText('Hero'));
    expect(screen.getByText('1 image selected')).toBeInTheDocument();

    fireEvent.click(screen.getByAltText('Hero'));
    expect(screen.getByText('Select an image to insert')).toBeInTheDocument();
  });

  it('adds an image from a URL and selects it', async () => {
    (createGalleryItem as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Image added to gallery',
      data: { _id: 'g3', url: 'https://example.com/new.jpg', source: 'url' },
    });

    renderPicker();

    fireEvent.click(screen.getByRole('button', { name: 'From URL' }));
    fireEvent.change(screen.getByPlaceholderText('https://example.com/image.jpg'), {
      target: { value: 'https://example.com/new.jpg' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add & Select' }));

    await waitFor(() => {
      expect(createGalleryItem).toHaveBeenCalledWith(
        expect.objectContaining({ url: 'https://example.com/new.jpg', source: 'url' }),
        expect.anything(),
      );
    });

    expect(screen.getByText('1 image selected')).toBeInTheDocument();
  });

  it('rejects an invalid URL with an error toast', async () => {
    renderPicker();

    fireEvent.click(screen.getByRole('button', { name: 'From URL' }));
    fireEvent.change(screen.getByPlaceholderText('https://example.com/image.jpg'), {
      target: { value: 'not-a-url' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add & Select' }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Please enter a valid image URL');
    });
    expect(createGalleryItem).not.toHaveBeenCalled();
  });

  it('renders the upload dropzone on the Upload tab', () => {
    renderPicker();

    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    expect(screen.getByText('Click or drag an image here')).toBeInTheDocument();
  });

  it('does not call onSelect when Insert is clicked with no selection', () => {
    const onSelect = jest.fn();
    const { getByRole } = renderPicker({ onSelect });

    const insertButton = getByRole('button', { name: 'Insert' });
    expect(insertButton).toBeDisabled();

    fireEvent.click(insertButton);
    expect(onSelect).not.toHaveBeenCalled();
  });
});

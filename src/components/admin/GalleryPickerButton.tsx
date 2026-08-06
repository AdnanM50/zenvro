'use client';

import { useState } from 'react';
import { Images } from 'lucide-react';
import GalleryPicker from './GalleryPicker';

interface GalleryPickerButtonProps {
  /** Called with the list of selected image URLs. */
  onSelect: (urls: string[]) => void;
  /** When true the user can select multiple images. */
  multiple?: boolean;
  /** Cloudinary folder used when uploading from the picker. */
  folder?: string;
  /** URLs already selected (for highlight + de-duplication). */
  selectedUrls?: string[];
  /** Button label. Defaults to "Browse Gallery". */
  label?: string;
  className?: string;
}

/**
 * Drop-in button that opens the WordPress-style media library modal.
 * Useful next to any image URL input (products, categories, collections, etc.).
 */
export default function GalleryPickerButton({
  onSelect,
  multiple = false,
  folder,
  selectedUrls = [],
  label = 'Browse Gallery',
  className = '',
}: GalleryPickerButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
      >
        <Images className="h-3.5 w-3.5" /> {label}
      </button>

      <GalleryPicker
        open={open}
        onClose={() => setOpen(false)}
        onSelect={onSelect}
        multiple={multiple}
        folder={folder}
        selectedUrls={selectedUrls}
      />
    </>
  );
}

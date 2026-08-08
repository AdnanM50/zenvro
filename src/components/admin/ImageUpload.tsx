'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, LibraryBig } from 'lucide-react';
import GalleryPicker from '../../app/admin/gallery/_components/GalleryPicker';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  folder?: string;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label,
  folder = 'velour/categories',
  className = '',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        onChange(data.data.url);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
        <ImageIcon className="h-3.5 w-3.5" /> {label}
      </label>

      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt={label}
            className="w-full h-32 object-cover rounded-xl border border-gray-200"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="px-3 py-1.5 bg-white text-black text-xs font-medium rounded-lg hover:bg-gray-100"
            >
              Browse Library
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-black text-xs font-medium rounded-lg hover:bg-gray-100"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 bg-white text-red-500 rounded-lg hover:bg-gray-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
            dragOver ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300'
          }`}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          ) : (
            <>
              <Upload className="h-5 w-5 text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">Click or drag to upload</p>
            </>
          )}
        </div>
      )}

      {/* Library + upload actions */}
      <div className="flex items-center gap-2 mt-2">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <LibraryBig className="h-3.5 w-3.5" /> Browse Library
        </button>
        {value && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Upload className="h-3.5 w-3.5" /> Upload
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />

      <GalleryPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(urls) => {
          if (urls[0]) onChange(urls[0]);
        }}
        folder={folder}
        selectedUrls={value ? [value] : []}
      />
    </div>
  );
}

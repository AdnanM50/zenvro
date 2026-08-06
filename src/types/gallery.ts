export type GallerySource = 'upload' | 'url';

export interface GalleryItem {
  _id: string;
  url: string;
  publicId?: string;
  title?: string;
  altText?: string;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
  source: GallerySource;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGalleryPayload {
  url: string;
  publicId?: string;
  title?: string;
  altText?: string;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
  source?: GallerySource;
}

export interface UpdateGalleryPayload extends Partial<CreateGalleryPayload> {
  _id: string;
}

export interface GalleryListParams {
  page?: number;
  limit?: number;
  search?: string;
}

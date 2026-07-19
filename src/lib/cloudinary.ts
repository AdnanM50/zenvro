import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

/**
 * Extract Cloudinary public_id from a URL.
 * Handles URLs like:
 *   https://res.cloudinary.com/{cloud}/image/upload/v123/folder/file.jpg
 *   https://res.cloudinary.com/{cloud}/image/upload/folder/file.jpg
 *   folder/file  (already a public_id)
 */
export function extractPublicId(url: string): string | null {
  if (!url) return null;
  if (!url.startsWith('http')) return url;

  try {
    const uploadIdx = url.indexOf('/upload/');
    if (uploadIdx === -1) return null;

    let id = url.slice(uploadIdx + '/upload/'.length);
    // strip version prefix like v1234567890/
    id = id.replace(/^v\d+\//, '');
    // strip file extension
    id = id.replace(/\.[^.]+$/, '');
    return id || null;
  } catch {
    return null;
  }
}

/** Delete a single image from Cloudinary. Silently ignores failures. */
export async function deleteImage(urlOrId: string): Promise<void> {
  const publicId = extractPublicId(urlOrId);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete failed:', publicId, err);
  }
}

/** Delete multiple images from Cloudinary. Silently ignores failures. */
export async function deleteImages(urls: (string | undefined | null)[]): Promise<void> {
  const ids = urls
    .filter(Boolean)
    .map((u) => extractPublicId(u!))
    .filter(Boolean) as string[];
  if (ids.length === 0) return;
  try {
    await Promise.all(ids.map((id) => cloudinary.uploader.destroy(id)));
  } catch (err) {
    console.error('Cloudinary batch delete failed:', err);
  }
}

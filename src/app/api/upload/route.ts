import { NextRequest } from 'next/server';
import { requireAdmin, validateUploadFile } from '@/middlewares';
import cloudinary from '@/lib/cloudinary';
import { api } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof Response) return auth;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'velour';

    const fileValidation = validateUploadFile(file);
    if (fileValidation) return fileValidation;

    const bytes = await file!.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as { secure_url: string; public_id: string });
        },
      );
      stream.end(buffer);
    });

    return api.created(
      { url: result.secure_url, publicId: result.public_id },
      'File uploaded',
    );
  } catch (error) {
    console.error('Upload error:', error);
    return api.serverError('Upload failed');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof Response) return auth;

    const { publicId } = await req.json();
    if (!publicId) return api.badRequest('No public ID provided');

    await cloudinary.uploader.destroy(publicId);

    return api.ok(null, 'File deleted');
  } catch (error) {
    console.error('Delete error:', error);
    return api.serverError('Delete failed');
  }
}

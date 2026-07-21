import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import cloudinary from '@/lib/cloudinary';
import { api } from '@/lib/api-response';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const MAX_SIZE = 5 * 1024 * 1024;

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return api.unauthorized();
  const payload = await verifyAccessToken(token);
  if (!payload) return api.unauthorized('Invalid token');
  const user = await UserModel.findById(payload.userId);
  if (!user || user.role !== 'admin') return api.forbidden();
  return { admin: user };
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof Response) return auth;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'velour';

    if (!file) return api.badRequest('No file provided');
    if (!ALLOWED_TYPES.includes(file.type)) return api.badRequest('Invalid file type. Allowed: JPEG, PNG, WebP, GIF, SVG');
    if (file.size > MAX_SIZE) return api.badRequest('File too large. Max 5MB');

    const bytes = await file.arrayBuffer();
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

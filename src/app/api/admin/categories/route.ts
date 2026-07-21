import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { CategoryModel } from '@/models/category.model';
import { api } from '@/lib/api-response';

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return api.unauthorized();
  const decoded = verifyAccessToken(token);
  if (!decoded) return api.unauthorized('Invalid or expired token');
  const user = await UserModel.findById(decoded.userId);
  if (!user || user.role !== 'admin') return api.forbidden();
  return { admin: user };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const parentCategory = searchParams.get('parentCategory') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    if (parentCategory) {
      const categories = await CategoryModel.findChildren(parentCategory);
      return api.ok(categories, 'Subcategories fetched');
    }

    const { categories, total } = await CategoryModel.findPaginated(page, limit, search);
    const totalPages = Math.ceil(total / limit);

    return api.paginated(
      categories,
      { page, limit, total, totalPages },
      'Categories fetched',
    );
  } catch (error) {
    console.error('Get categories error:', error);
    return api.serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { name, slug, parentCategory, image, description, seo, isActive } = body;

    if (!name) return api.badRequest('Name is required');

    const existing = await CategoryModel.findBySlug(slug || name.toLowerCase().replace(/\s+/g, '-'));
    if (existing) return api.conflict('Category with this slug already exists');

    const category = await CategoryModel.create({
      name,
      slug,
      parentCategory,
      image: image || '',
      description: description || '',
      seo: seo || { title: '', description: '', keywords: [], canonical: '', ogImage: '', robots: 'index' },
      isActive: isActive ?? true,
    });

    return api.created(category, 'Category created');
  } catch (error) {
    console.error('Create category error:', error);
    return api.serverError();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) return api.badRequest('_id is required');

    const updated = await CategoryModel.update(_id, updateData);
    if (!updated) return api.notFound('Category not found');

    return api.ok(null, 'Category updated');
  } catch (error) {
    console.error('Update category error:', error);
    return api.serverError();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const _id = searchParams.get('_id');

    if (!_id) return api.badRequest('_id is required');

    const deleted = await CategoryModel.delete(_id);
    if (!deleted) return api.notFound('Category not found');

    return api.ok(null, 'Category deleted');
  } catch (error) {
    console.error('Delete category error:', error);
    return api.serverError();
  }
}

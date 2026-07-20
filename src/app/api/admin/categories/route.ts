import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { CategoryModel } from '@/models/category.model';

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return { error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) };
  const decoded = verifyAccessToken(token);
  if (!decoded) return { error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }) };
  const user = await UserModel.findById(decoded.userId);
  if (!user || user.role !== 'admin') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { admin: user };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const parentCategory = searchParams.get('parentCategory') || undefined;
    const categories = parentCategory
      ? await CategoryModel.findChildren(parentCategory)
      : await CategoryModel.findAll();
    const count = await CategoryModel.count();

    return NextResponse.json({ categories, total: count });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const { name, slug, parentCategory, image, description, seo, isActive } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const existing = await CategoryModel.findBySlug(slug || name.toLowerCase().replace(/\s+/g, '-'));
    if (existing) {
      return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 400 });
    }

    const category = await CategoryModel.create({
      name,
      slug,
      parentCategory,
      image: image || '',
      description: description || '',
      seo: seo || { title: '', description: '', keywords: [], canonical: '', ogImage: '', robots: 'index' },
      isActive: isActive ?? true,
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ error: '_id is required' }, { status: 400 });
    }

    const updated = await CategoryModel.update(_id, updateData);
    if (!updated) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const _id = searchParams.get('_id');

    if (!_id) {
      return NextResponse.json({ error: '_id is required' }, { status: 400 });
    }

    const deleted = await CategoryModel.delete(_id);
    if (!deleted) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

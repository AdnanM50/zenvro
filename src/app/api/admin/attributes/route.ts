import { NextRequest } from 'next/server';
import { requireAdmin } from '@/middlewares';
import { AttributeModel } from '@/models/attribute.model';
import { api } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const { attributes, total } = await AttributeModel.findPaginated(page, limit, search);
    const totalPages = Math.ceil(total / limit) || 1;

    return api.paginated(attributes, { page, limit, total, totalPages }, 'Attributes fetched');
  } catch (error) {
    console.error('Get attributes error:', error);
    return api.serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { name, values, useForVariants, isVariant } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return api.badRequest('Attribute name is required');
    }

    const attr = await AttributeModel.create({
      name: name.trim(),
      values: Array.isArray(values)
        ? values.map((v) => String(v).trim()).filter(Boolean)
        : typeof values === 'string'
        ? values.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      useForVariants: useForVariants ?? isVariant ?? true,
      isVariant: useForVariants ?? isVariant ?? true,
    });

    return api.created(attr, 'Attribute created');
  } catch (error) {
    console.error('Create attribute error:', error);
    return api.serverError();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { _id, useForVariants, isVariant, ...updateData } = body;

    if (!_id) return api.badRequest('_id is required');

    if (updateData.values && typeof updateData.values === 'string') {
      updateData.values = updateData.values.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    const flag = useForVariants ?? isVariant;
    if (flag !== undefined) {
      updateData.useForVariants = flag;
      updateData.isVariant = flag;
    }

    const updated = await AttributeModel.update(_id, updateData);
    if (!updated) return api.notFound('Attribute not found');

    return api.ok(null, 'Attribute updated');
  } catch (error) {
    console.error('Update attribute error:', error);
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

    const deleted = await AttributeModel.delete(_id);
    if (!deleted) return api.notFound('Attribute not found');

    return api.ok(null, 'Attribute deleted');
  } catch (error) {
    console.error('Delete attribute error:', error);
    return api.serverError();
  }
}

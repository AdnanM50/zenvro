import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { api } from '@/lib/api-response';
import type { Profile } from '@/types';

async function requireUser(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return api.unauthorized();
  const decoded = verifyAccessToken(token);
  if (!decoded) return api.unauthorized('Invalid or expired token');
  const user = await UserModel.findById(decoded.userId);
  if (!user) return api.notFound('User not found');
  return { user };
}

function toProfile(user: {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  createdAt: Date;
}): Profile {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role as Profile['role'],
    status: user.status as Profile['status'],
    createdAt: user.createdAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if (auth instanceof Response) return auth;
    return api.ok(toProfile(auth.user), 'Profile fetched');
  } catch (error) {
    console.error('Get profile error:', error);
    return api.serverError();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { name, email, phone } = body ?? {};

    if (name !== undefined && typeof name !== 'string') {
      return api.badRequest('Name must be a string');
    }
    if (email !== undefined && typeof email !== 'string') {
      return api.badRequest('Email must be a string');
    }
    if (phone !== undefined && typeof phone !== 'string') {
      return api.badRequest('Phone must be a string');
    }

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) return api.badRequest('Email cannot be empty');
      if (normalizedEmail !== auth.user.email) {
        const existing = await UserModel.findByEmail(normalizedEmail);
        if (existing && existing._id !== auth.user._id) {
          return api.conflict('Email is already in use');
        }
      }
    }

    const updated = await UserModel.updateProfile(auth.user._id, { name, email, phone });
    if (!updated) return api.badRequest('Nothing to update');

    return api.ok(toProfile(updated), 'Profile updated');
  } catch (error) {
    console.error('Update profile error:', error);
    return api.serverError();
  }
}

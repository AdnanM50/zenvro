'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  KeyRound,
  LogOut,
  Mail,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile, updateProfile, changePassword } from '@/services/profile.service';
import type { Profile } from '@/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const inputLabel = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5';

export default function AdminProfilePage() {
  const router = useRouter();
  const { user, checkAuth, logout } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    let active = true;
    getProfile()
      .then((res) => {
        if (!active) return;
        setProfile(res.data);
        setName(res.data.name);
        setEmail(res.data.email);
        setPhone(res.data.phone ?? '');
      })
      .catch(() => {
        if (active) toast.error('Failed to load profile');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (!trimmedName) return toast.error('Name is required');
    if (!EMAIL_REGEX.test(trimmedEmail)) return toast.error('Please enter a valid email address');

    setSavingProfile(true);
    try {
      const res = await updateProfile({
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone || undefined,
      });
      setProfile(res.data);
      toast.success(res.message || 'Profile updated');
      await checkAuth();
    } catch (error) {
      const err = error as { serverMessage?: string; message?: string };
      toast.error(err.serverMessage || err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match');

    setSavingPassword(true);
    try {
      const res = await changePassword({ currentPassword, newPassword });
      toast.success(res.message || 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const err = error as { serverMessage?: string; message?: string };
      toast.error(err.serverMessage || err.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-20 text-gray-500">Failed to load profile</div>;
  }

  const initials = getInitials(profile.name);
  const memberSince = new Date(profile.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your personal information and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: summary card */}
        <div className="lg:sticky lg:top-4 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-20 h-20 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-2xl font-bold">
                {initials}
              </div>
              <div>
                <div className="font-bold text-lg text-gray-900 dark:text-white truncate">
                  {profile.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{profile.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                  <ShieldCheck className="h-3 w-3" /> {profile.role}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> {profile.status}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-300">
                <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{profile.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-300">
                <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{profile.phone || 'No phone added'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-300">
                <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span>Member since {memberSince}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal information */}
          <form
            onSubmit={handleSaveProfile}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-5"
          >
            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
              <UserRound className="h-4 w-4" /> Personal Information
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={inputLabel}>Full Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label className={inputLabel}>Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className={inputLabel}>Phone Number</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          {/* Security */}
          <form
            onSubmit={handleChangePassword}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-5"
          >
            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
              <KeyRound className="h-4 w-4" /> Change Password
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={inputLabel}>Current Password</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className={inputLabel}>New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className={inputLabel}>Confirm New Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <KeyRound className="h-4 w-4" />
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>

          {/* Danger zone */}
          <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/60 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <LogOut className="h-4 w-4 text-red-500" />
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">Sign out of your account</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  You will be redirected to the login page.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

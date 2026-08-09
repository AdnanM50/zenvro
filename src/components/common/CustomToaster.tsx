'use client';

import React from 'react';
import toast, { Toaster, resolveValue, Toast } from 'react-hot-toast';
import {
  Sparkles,
  Edit3,
  Trash2,
  AlertTriangle,
  Lock,
  ServerCrash,
  AlertCircle,
  Loader2,
  X,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastCategory =
  | 'create'
  | 'edit'
  | 'delete'
  | 'warning'
  | 'unauthenticated'
  | 'apiError'
  | 'loading'
  | 'info';

function getToastCategory(t: Toast, messageText: string): ToastCategory {
  if (t.type === 'loading') return 'loading';

  const msgLower = messageText.toLowerCase();

  // 1. Unauthenticated / Unauthorized / Access Denied
  if (
    msgLower.includes('unauthorized') ||
    msgLower.includes('unauthenticated') ||
    msgLower.includes('login') ||
    msgLower.includes('session expired') ||
    msgLower.includes('401') ||
    msgLower.includes('403') ||
    msgLower.includes('forbidden') ||
    msgLower.includes('access denied') ||
    msgLower.includes('auth error')
  ) {
    return 'unauthenticated';
  }

  // 2. Warning
  if (
    msgLower.includes('warning') ||
    msgLower.includes('warn') ||
    msgLower.includes('caution') ||
    msgLower.includes('low stock') ||
    msgLower.includes('attention')
  ) {
    return 'warning';
  }

  // 3. Delete / Remove
  if (
    msgLower.includes('delete') ||
    msgLower.includes('deleted') ||
    msgLower.includes('remove') ||
    msgLower.includes('removed') ||
    msgLower.includes('clear') ||
    msgLower.includes('purge')
  ) {
    return 'delete';
  }

  // 4. Edit / Update / Modify
  if (
    msgLower.includes('update') ||
    msgLower.includes('updated') ||
    msgLower.includes('edit') ||
    msgLower.includes('edited') ||
    msgLower.includes('modify') ||
    msgLower.includes('modified') ||
    msgLower.includes('saved') ||
    msgLower.includes('changed')
  ) {
    return 'edit';
  }

  // 5. Create / Add / New
  if (
    msgLower.includes('create') ||
    msgLower.includes('created') ||
    msgLower.includes('add') ||
    msgLower.includes('added') ||
    msgLower.includes('new') ||
    msgLower.includes('registered') ||
    msgLower.includes('published')
  ) {
    return 'create';
  }

  // 6. Generic Error or Server Crash
  if (t.type === 'error' || msgLower.includes('error') || msgLower.includes('failed') || msgLower.includes('server')) {
    return 'apiError';
  }

  return 'info';
}

function ToastCard({ t }: { t: Toast }) {
  const rawMessage = resolveValue(t.message, t);
  const messageText = typeof rawMessage === 'string' ? rawMessage : String(rawMessage || '');
  const category = getToastCategory(t, messageText);

  const getVariantStyles = () => {
    switch (category) {
      case 'create':
        return {
          bar: 'bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.7)]',
          badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
          icon: <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-toast-icon-pop" />,
          label: 'Success',
          labelColor: 'text-emerald-600 dark:text-emerald-400',
        };
      case 'edit':
        return {
          bar: 'bg-cyan-500 shadow-[0_0_14px_rgba(6,182,212,0.7)]',
          badge: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.25)]',
          icon: <Edit3 className="h-4 w-4 text-cyan-600 dark:text-cyan-400 animate-toast-icon-spin" />,
          label: 'Updated',
          labelColor: 'text-cyan-600 dark:text-cyan-400',
        };
      case 'delete':
        return {
          bar: 'bg-rose-500 shadow-[0_0_14px_rgba(244,63,94,0.7)]',
          badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.25)]',
          icon: <Trash2 className="h-4 w-4 text-rose-600 dark:text-rose-400 animate-toast-icon-shake" />,
          label: 'Removed',
          labelColor: 'text-rose-600 dark:text-rose-400',
        };
      case 'warning':
        return {
          bar: 'bg-amber-500 shadow-[0_0_14px_rgba(245,158,11,0.7)]',
          badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
          icon: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-toast-icon-pop" />,
          label: 'Warning',
          labelColor: 'text-amber-600 dark:text-amber-400',
        };
      case 'unauthenticated':
        return {
          bar: 'bg-fuchsia-500 shadow-[0_0_14px_rgba(217,70,239,0.7)]',
          badge: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/30 shadow-[0_0_12px_rgba(217,70,239,0.25)]',
          icon: <Lock className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-400 animate-toast-icon-lock" />,
          label: 'Auth Lock',
          labelColor: 'text-fuchsia-600 dark:text-fuchsia-400',
        };
      case 'apiError':
        return {
          bar: 'bg-red-600 shadow-[0_0_14px_rgba(220,38,38,0.7)]',
          badge: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 shadow-[0_0_12px_rgba(220,38,38,0.25)]',
          icon: <ServerCrash className="h-4 w-4 text-red-600 dark:text-red-400 animate-toast-icon-shake" />,
          label: 'API Error',
          labelColor: 'text-red-600 dark:text-red-400',
        };
      case 'loading':
        return {
          bar: 'bg-blue-500 shadow-[0_0_14px_rgba(59,130,246,0.7)]',
          badge: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.25)]',
          icon: <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />,
          label: 'Processing',
          labelColor: 'text-blue-600 dark:text-blue-400',
        };
      default:
        return {
          bar: 'bg-purple-500 shadow-[0_0_14px_rgba(168,85,247,0.7)]',
          badge: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.25)]',
          icon: <Info className="h-4 w-4 text-purple-600 dark:text-purple-400 animate-toast-icon-pop" />,
          label: 'Notice',
          labelColor: 'text-purple-600 dark:text-purple-400',
        };
    }
  };

  const variant = getVariantStyles();

  return (
    <div
      className={cn(
        'group relative flex items-center justify-between gap-3.5 px-4 py-3.5 rounded-2xl border transition-all duration-300 pointer-events-auto overflow-hidden min-w-[300px] max-w-[440px]',
        'bg-white/95 dark:bg-[#0d1322]/95 backdrop-blur-2xl',
        'border-gray-200/90 dark:border-slate-800/90',
        'shadow-[0_12px_36px_-6px_rgba(0,0,0,0.15),0_4px_16px_-2px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.6)]',
        'hover:scale-[1.01] hover:border-gray-300 dark:hover:border-slate-700',
        t.visible ? 'animate-toast-in' : 'animate-toast-out'
      )}
    >
      {/* Left glowing accent bar */}
      <div className={cn('absolute left-0 top-2 bottom-2 w-1.5 rounded-r-full transition-all duration-300', variant.bar)} />

      {/* Main content: Animated Icon & Message */}
      <div className="flex items-center gap-3.5 min-w-0 pl-1">
        <div className={cn('p-2.5 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105', variant.badge)}>
          {variant.icon}
        </div>
        <div className="flex flex-col min-w-0">
          <span className={cn('text-[10px] font-bold uppercase tracking-wider leading-tight mb-0.5', variant.labelColor)}>
            {variant.label}
          </span>
          <div className="text-xs font-semibold text-gray-900 dark:text-slate-100 leading-snug break-words">
            {rawMessage}
          </div>
        </div>
      </div>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={() => toast.dismiss(t.id)}
        className="ml-2 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800/60 transition-all shrink-0 opacity-70 group-hover:opacity-100 active:scale-95"
        aria-label="Close notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function CustomToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3800,
      }}
    >
      {(t) => <ToastCard t={t} />}
    </Toaster>
  );
}

'use client';

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  variant?: 'buttons' | 'toggle' | 'dropdown';
  className?: string;
}

export default function ThemeToggle({ variant = 'buttons', className = '' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (variant === 'toggle') {
    const isDark = resolvedTheme === 'dark';
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`p-2 rounded-full transition-colors flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 ${className}`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
            theme === 'light'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
          title="Light Theme"
        >
          <Sun className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
            theme === 'dark'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
          title="Dark Theme"
        >
          <Moon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Dark</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('system')}
          className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
            theme === 'system'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
          title="System Theme"
        >
          <Monitor className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">System</span>
        </button>
      </div>
    );
  }

  // Default 'buttons' variant
  const isDark = resolvedTheme === 'dark';
  return (
    <div className={`flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-full border border-gray-200 dark:border-gray-700 shadow-xs ${className}`}>
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
          !isDark
            ? 'bg-white text-gray-900 shadow-xs'
            : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500'
        }`}
        aria-label="Light mode"
        title="Light mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
          isDark
            ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
            : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500'
        }`}
        aria-label="Dark mode"
        title="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  );
}

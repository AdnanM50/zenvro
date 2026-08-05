'use client';

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  variant?: 'buttons' | 'toggle' | 'dropdown';
  className?: string;
}

export default function ThemeToggle({ variant = 'buttons', className = '' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  if (variant === 'toggle') {
    return (
      <motion.button
        type="button"
        onClick={toggleTheme}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`p-2 rounded-full transition-colors flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 ${className}`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        aria-label="Toggle theme"
      >
        <motion.div
          key={isDark ? 'dark' : 'light'}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.35, ease: 'backOut' }}
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
        </motion.div>
      </motion.button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`flex items-center gap-1 bg-gray-100 dark:bg-gray-800/80 backdrop-blur-md p-1 rounded-xl border border-gray-200 dark:border-gray-700/60 ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`relative p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
            theme === 'light'
              ? 'text-gray-900 dark:text-white font-bold'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
          title="Light Theme"
        >
          {theme === 'light' && (
            <motion.div
              layoutId="theme-dropdown-active"
              className="absolute inset-0 bg-white dark:bg-gray-900 rounded-lg shadow-xs -z-10"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <Sun className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`relative p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
            theme === 'dark'
              ? 'text-gray-900 dark:text-white font-bold'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
          title="Dark Theme"
        >
          {theme === 'dark' && (
            <motion.div
              layoutId="theme-dropdown-active"
              className="absolute inset-0 bg-white dark:bg-gray-900 rounded-lg shadow-xs -z-10"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <Moon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('system')}
          className={`relative p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
            theme === 'system'
              ? 'text-gray-900 dark:text-white font-bold'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
          title="System Theme"
        >
          {theme === 'system' && (
            <motion.div
              layoutId="theme-dropdown-active"
              className="absolute inset-0 bg-white dark:bg-gray-900 rounded-lg shadow-xs -z-10"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <Monitor className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">System</span>
        </button>
      </div>
    );
  }

  // Default 'buttons' / pill toggle variant with smooth spring knob
  return (
    <div className={`relative flex items-center bg-gray-200/80 dark:bg-gray-900/90 backdrop-blur-md p-1 rounded-full border border-gray-300/60 dark:border-gray-700/60 shadow-inner ${className}`}>
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
          !isDark ? 'text-amber-500 font-bold' : 'text-gray-400 hover:text-gray-200'
        }`}
        aria-label="Light mode"
        title="Light mode"
      >
        <motion.div animate={{ rotate: !isDark ? 0 : -30, scale: !isDark ? 1.1 : 0.9 }} transition={{ duration: 0.3 }}>
          <Sun className="h-4 w-4" />
        </motion.div>
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
          isDark ? 'text-indigo-400 font-bold' : 'text-gray-400 hover:text-gray-700'
        }`}
        aria-label="Dark mode"
        title="Dark mode"
      >
        <motion.div animate={{ rotate: isDark ? 0 : 30, scale: isDark ? 1.1 : 0.9 }} transition={{ duration: 0.3 }}>
          <Moon className="h-4 w-4" />
        </motion.div>
      </button>

      {/* Sliding spring pill knob */}
      <motion.div
        className="absolute top-1 bottom-1 w-8 h-8 sm:w-9 sm:h-9 bg-white dark:bg-gray-800 rounded-full shadow-md z-0"
        initial={false}
        animate={{ x: isDark ? '100%' : '0%' }}
        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
      />
    </div>
  );
}

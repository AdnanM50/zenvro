'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Save, RefreshCw, FileText, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_ROBOTS = `# Robots.txt for VELOUR
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/admin/
Disallow: /login
Disallow: /signup
Disallow: /forgot-password
Disallow: /user-dashboard/

# Sitemaps
Sitemap: ${typeof window !== 'undefined' ? window.location.origin : ''}/sitemap.xml
`;

export default function RobotsPage() {
  const [content, setContent] = useState('');
  const [updatedBy, setUpdatedBy] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchRobots = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/seo/robots', { credentials: 'include' });
      const json = await res.json();
      if (json.success) {
        setContent(json.data.content);
        setUpdatedBy(json.data.updatedBy || 'system');
        setUpdatedAt(json.data.updatedAt ? new Date(json.data.updatedAt).toLocaleString() : '');
      }
    } catch {
      toast.error('Failed to load robots.txt');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRobots(); }, [fetchRobots]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/seo/robots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Robots.txt saved');
        setUpdatedAt(new Date().toLocaleString());
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch {
      toast.error('Failed to save robots.txt');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setContent(DEFAULT_ROBOTS);
    toast.success('Reset to defaults — remember to save');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Robots.txt</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Control which pages search engines can crawl.
            {updatedAt && <span className="ml-2 text-xs">Last updated: {updatedAt} by {updatedBy}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">robots.txt</span>
          <span className="text-xs text-gray-400 ml-auto">{content.length} chars</span>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          spellCheck={false}
          className="w-full px-5 py-4 text-sm font-mono text-gray-900 dark:text-white bg-transparent focus:outline-none resize-y leading-relaxed"
          placeholder="User-agent: *&#10;Allow: /"
        />
      </div>

      {/* Preview link */}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Preview:{' '}
        <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600 dark:hover:text-gray-300">
          /robots.txt
        </a>
      </p>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Save, RefreshCw, Map, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

interface SitemapData {
  config: {
    enabled: boolean;
    autoGenerate: boolean;
    includeProducts: boolean;
    includeCategories: boolean;
    includeBrands: boolean;
    includePages: boolean;
    includeImages: boolean;
    lastGenerated: string | null;
  };
  counts: Record<string, number>;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </label>
  );
}

export default function SitemapPage() {
  const [data, setData] = useState<SitemapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/seo/sitemap', { credentials: 'include' });
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch {
      toast.error('Failed to load sitemap config');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateConfig = (field: string, value: boolean) => {
    setData((prev) => prev ? { ...prev, config: { ...prev.config, [field]: value } } : prev);
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/seo/sitemap', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data.config),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Sitemap config saved');
        setData(json.data);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await fetch('/api/admin/seo/sitemap', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ regenerate: true }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Sitemap regenerated with ${json.data.regenerated} items`);
        setData(json.data);
      } else {
        toast.error(json.error || 'Failed to regenerate');
      }
    } catch {
      toast.error('Failed to regenerate sitemap');
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!data) return <div className="text-center py-20 text-gray-500">Failed to load sitemap config</div>;

  const entityTypes = ['product', 'category', 'brand', 'page', 'static'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sitemap</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure sitemap auto-generation and manage included content.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <Zap className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} /> {regenerating ? 'Regenerating...' : 'Regenerate Now'}
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

      {/* Config */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-1">
        <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white font-semibold">
          <Map className="h-4 w-4" /> Configuration
        </div>
        <Toggle checked={data.config.enabled} onChange={(v) => updateConfig('enabled', v)} label="Enable Sitemap" />
        <Toggle checked={data.config.autoGenerate} onChange={(v) => updateConfig('autoGenerate', v)} label="Auto-Generate on Access" />
        <Toggle checked={data.config.includeProducts} onChange={(v) => updateConfig('includeProducts', v)} label="Include Products" />
        <Toggle checked={data.config.includeCategories} onChange={(v) => updateConfig('includeCategories', v)} label="Include Categories" />
        <Toggle checked={data.config.includeBrands} onChange={(v) => updateConfig('includeBrands', v)} label="Include Brands" />
        <Toggle checked={data.config.includePages} onChange={(v) => updateConfig('includePages', v)} label="Include CMS Pages" />
        <Toggle checked={data.config.includeImages} onChange={(v) => updateConfig('includeImages', v)} label="Include Images" />
      </div>

      {/* Stats */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Item Counts</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {entityTypes.map((type) => (
            <div key={type} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="text-lg font-bold text-gray-900 dark:text-white">{data.counts[type] || 0}</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mt-0.5">{type}s</div>
            </div>
          ))}
          <div className="text-center p-3 bg-black dark:bg-white rounded-xl">
            <div className="text-lg font-bold text-white dark:text-black">{data.counts.total || 0}</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-600 font-semibold mt-0.5">Total</div>
          </div>
        </div>
        {data.config.lastGenerated && (
          <p className="text-xs text-gray-400 mt-4">Last generated: {new Date(data.config.lastGenerated).toLocaleString()}</p>
        )}
      </div>

      {/* Preview link */}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Preview:{' '}
        <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600 dark:hover:text-gray-300">
          /sitemap.xml
        </a>
      </p>
    </div>
  );
}

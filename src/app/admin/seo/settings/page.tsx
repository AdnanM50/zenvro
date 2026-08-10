'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Save, RefreshCw, Globe, Image, Search, Shield, Code } from 'lucide-react';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

interface SeoSettings {
  siteName: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultKeywords: string[];
  defaultOgImage: string;
  favicon: string;
  logo: string;
  canonicalDomain: string;
  schemaOrganization: Record<string, unknown>;
  schemaWebsite: Record<string, unknown>;
  googleVerification: string;
  bingVerification: string;
  yandexVerification: string;
  indexNowKey: string;
  robotsDefault: string;
}

export default function SeoSettingsPage() {
  const [settings, setSettings] = useState<SeoSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [keywordDraft, setKeywordDraft] = useState('');
  const [schemaOrgStr, setSchemaOrgStr] = useState('{}');
  const [schemaWebStr, setSchemaWebStr] = useState('{}');

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/seo/settings', { credentials: 'include' });
      const json = await res.json();
      if (json.success) {
        setSettings(json.data);
        setSchemaOrgStr(JSON.stringify(json.data.schemaOrganization || {}, null, 2));
        setSchemaWebStr(JSON.stringify(json.data.schemaWebsite || {}, null, 2));
      }
    } catch {
      toast.error('Failed to load SEO settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      let schemaOrganization = settings.schemaOrganization;
      let schemaWebsite = settings.schemaWebsite;
      try { schemaOrganization = JSON.parse(schemaOrgStr); } catch { toast.error('Invalid Organization Schema JSON'); setSaving(false); return; }
      try { schemaWebsite = JSON.parse(schemaWebStr); } catch { toast.error('Invalid Website Schema JSON'); setSaving(false); return; }

      const res = await fetch('/api/admin/seo/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...settings, schemaOrganization, schemaWebsite }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('SEO settings saved');
        setSettings(json.data);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch {
      toast.error('Failed to save SEO settings');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof SeoSettings, value: unknown) => {
    setSettings((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const addKeyword = () => {
    const kw = keywordDraft.trim();
    if (!kw || !settings) return;
    if (!settings.defaultKeywords.includes(kw.toLowerCase())) {
      updateField('defaultKeywords', [...settings.defaultKeywords, kw.toLowerCase()]);
    }
    setKeywordDraft('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!settings) return <div className="text-center py-20 text-gray-500">Failed to load settings</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Global SEO Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure default meta tags, schema markup, and verification codes.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* General */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
          <Globe className="h-4 w-4" /> General
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Site Name</label>
            <Input value={settings.siteName} onChange={(e) => updateField('siteName', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Canonical Domain</label>
            <Input value={settings.canonicalDomain} onChange={(e) => updateField('canonicalDomain', e.target.value)} placeholder="https://yoursite.com" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Default Title</label>
            <Input value={settings.defaultTitle} onChange={(e) => updateField('defaultTitle', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Title Template <span className="text-gray-400">(%s = page title)</span></label>
            <Input value={settings.titleTemplate} onChange={(e) => updateField('titleTemplate', e.target.value)} placeholder="%s | VELOUR" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Default Description</label>
            <textarea
              value={settings.defaultDescription}
              onChange={(e) => updateField('defaultDescription', e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Default Robots</label>
            <Input value={settings.robotsDefault} onChange={(e) => updateField('robotsDefault', e.target.value)} placeholder="index, follow" />
          </div>
        </div>
      </section>

      {/* Keywords */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
          <Search className="h-4 w-4" /> Default Keywords
        </div>
        <div className="flex gap-2">
          <Input
            value={keywordDraft}
            onChange={(e) => setKeywordDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
            placeholder="Add keyword..."
            className="flex-1"
          />
          <button onClick={addKeyword} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {settings.defaultKeywords.map((kw) => (
            <span key={kw} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
              {kw}
              <button onClick={() => updateField('defaultKeywords', settings.defaultKeywords.filter((k) => k !== kw))} className="hover:text-red-500 transition-colors">&times;</button>
            </span>
          ))}
        </div>
      </section>

      {/* Images */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
          <Image className="h-4 w-4" /> Images
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Default OG Image URL</label>
            <Input value={settings.defaultOgImage} onChange={(e) => updateField('defaultOgImage', e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Favicon URL</label>
            <Input value={settings.favicon} onChange={(e) => updateField('favicon', e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Logo URL</label>
            <Input value={settings.logo} onChange={(e) => updateField('logo', e.target.value)} placeholder="https://..." />
          </div>
        </div>
      </section>

      {/* Verification */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
          <Shield className="h-4 w-4" /> Search Engine Verification
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Google Verification</label>
            <Input value={settings.googleVerification} onChange={(e) => updateField('googleVerification', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Bing Verification</label>
            <Input value={settings.bingVerification} onChange={(e) => updateField('bingVerification', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Yandex Verification</label>
            <Input value={settings.yandexVerification} onChange={(e) => updateField('yandexVerification', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">IndexNow Key</label>
            <Input value={settings.indexNowKey} onChange={(e) => updateField('indexNowKey', e.target.value)} />
          </div>
        </div>
      </section>

      {/* Schema */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
          <Code className="h-4 w-4" /> Structured Data (JSON-LD)
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Organization Schema</label>
          <textarea
            value={schemaOrgStr}
            onChange={(e) => setSchemaOrgStr(e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3.5 py-2.5 text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:outline-none resize-y"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Website Schema</label>
          <textarea
            value={schemaWebStr}
            onChange={(e) => setSchemaWebStr(e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3.5 py-2.5 text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:outline-none resize-y"
          />
        </div>
      </section>
    </div>
  );
}

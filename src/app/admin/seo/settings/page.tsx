'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Save,
  RefreshCw,
  Globe,
  Image as ImageIcon,
  Search,
  Shield,
  Code,
  Upload,
  Sparkles,
  X,
} from 'lucide-react';
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
  const [uploadingOgImage, setUploadingOgImage] = useState(false);
  const [keywordDraft, setKeywordDraft] = useState('');
  const [schemaOrgStr, setSchemaOrgStr] = useState('{}');
  const [schemaWebStr, setSchemaWebStr] = useState('{}');

  const ogFileInputRef = useRef<HTMLInputElement>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/seo/settings', { credentials: 'include' });
      const json = await res.json();
      if (json.success && json.data) {
        setSettings(json.data);
        setSchemaOrgStr(JSON.stringify(json.data.schemaOrganization || {}, null, 2));
        setSchemaWebStr(JSON.stringify(json.data.schemaWebsite || {}, null, 2));
      } else {
        toast.error('Failed to load SEO settings');
      }
    } catch {
      toast.error('Failed to load SEO settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateField = (field: keyof SeoSettings, value: unknown) => {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleOgImageUpload = async (file: File) => {
    if (!file) return;
    setUploadingOgImage(true);
    const toastId = toast.loading('Uploading OG social image...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'seo-og');

      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.data?.url) {
        updateField('defaultOgImage', json.data.url);
        toast.success('OG Image uploaded successfully!', { id: toastId });
      } else {
        toast.error(json.error || json.message || 'Upload failed', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload image file', { id: toastId });
    } finally {
      setUploadingOgImage(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const toastId = toast.loading('Saving Global SEO settings...');

    try {
      let schemaOrganization = settings.schemaOrganization;
      let schemaWebsite = settings.schemaWebsite;
      try {
        schemaOrganization = JSON.parse(schemaOrgStr);
      } catch {
        toast.error('Invalid Organization Schema JSON', { id: toastId });
        setSaving(false);
        return;
      }
      try {
        schemaWebsite = JSON.parse(schemaWebStr);
      } catch {
        toast.error('Invalid Website Schema JSON', { id: toastId });
        setSaving(false);
        return;
      }

      const res = await fetch('/api/admin/seo/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...settings, schemaOrganization, schemaWebsite }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        toast.success('Global SEO settings saved!', { id: toastId });
        setSettings(json.data);
      } else {
        toast.error(json.error || 'Failed to save SEO settings', { id: toastId });
      }
    } catch {
      toast.error('Failed to save SEO settings', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = () => {
    const kw = keywordDraft.trim();
    if (!kw || !settings) return;
    const currentKws = settings.defaultKeywords || [];
    if (!currentKws.includes(kw.toLowerCase())) {
      updateField('defaultKeywords', [...currentKws, kw.toLowerCase()]);
    }
    setKeywordDraft('');
  };

  const removeKeyword = (kwToRemove: string) => {
    if (!settings) return;
    updateField(
      'defaultKeywords',
      (settings.defaultKeywords || []).filter((k) => k !== kwToRemove)
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-black dark:text-white opacity-60" />
        <p className="text-sm font-medium text-gray-500">Loading Global SEO settings...</p>
      </div>
    );
  }

  if (!settings) {
    return <div className="text-center py-20 text-gray-500">Failed to load SEO settings</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <Search className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Global SEO Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure default meta tags, schema markup, social preview images, and search console verification.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <button
            onClick={fetchSettings}
            disabled={saving}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            title="Reload settings"
          >
            <RefreshCw className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black font-semibold text-sm rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-md disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Metadata */}
          <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-black dark:text-white">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">General & Title Tags</h2>
                <p className="text-xs text-gray-500">Default site meta titles and domain canonicalization.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Site Name
                </label>
                <Input
                  value={settings.siteName}
                  onChange={(e) => updateField('siteName', e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Canonical Domain URL
                </label>
                <Input
                  value={settings.canonicalDomain}
                  onChange={(e) => updateField('canonicalDomain', e.target.value)}
                  placeholder="https://zenvro.com"
                  className="rounded-xl"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Default Title
                </label>
                <Input
                  value={settings.defaultTitle}
                  onChange={(e) => updateField('defaultTitle', e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Title Template <span className="text-gray-400 font-normal">(use %s for inner page title)</span>
                </label>
                <Input
                  value={settings.titleTemplate}
                  onChange={(e) => updateField('titleTemplate', e.target.value)}
                  placeholder="%s | VELOUR"
                  className="rounded-xl"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Default Meta Description
                </label>
                <textarea
                  value={settings.defaultDescription}
                  onChange={(e) => updateField('defaultDescription', e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Default Robots Tag
                </label>
                <Input
                  value={settings.robotsDefault}
                  onChange={(e) => updateField('robotsDefault', e.target.value)}
                  placeholder="index, follow"
                  className="rounded-xl"
                />
              </div>
            </div>
          </section>

          {/* Keywords Manager */}
          <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-black dark:text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Default Keywords Manager</h2>
                <p className="text-xs text-gray-500">Keywords used as metadata fallbacks across pages.</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                value={keywordDraft}
                onChange={(e) => setKeywordDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addKeyword();
                  }
                }}
                placeholder="Type keyword and press Enter or Add..."
                className="flex-1 rounded-xl"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {(settings.defaultKeywords || []).map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700"
                >
                  #{kw}
                  <button
                    type="button"
                    onClick={() => removeKeyword(kw)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </section>

          {/* Social Image Uploader */}
          <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-black dark:text-white">
                <ImageIcon className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Default OG Social Sharing Image</h2>
                <p className="text-xs text-gray-500">Image displayed when sharing site links on social media.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                OG Image URL
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  value={settings.defaultOgImage}
                  onChange={(e) => updateField('defaultOgImage', e.target.value)}
                  placeholder="https://example.com/og-image.jpg"
                  className="flex-1 rounded-xl"
                />
                <input
                  type="file"
                  ref={ogFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleOgImageUpload(file);
                  }}
                />
                <button
                  type="button"
                  disabled={uploadingOgImage}
                  onClick={() => ogFileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-semibold transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {uploadingOgImage ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
            </div>
          </section>

          {/* Search Engine Verification */}
          <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-black dark:text-white">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Search Engine Verification</h2>
                <p className="text-xs text-gray-500">Insert site verification tags for Google Search Console, Bing, Yandex, and IndexNow.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Google Verification ID
                </label>
                <Input
                  value={settings.googleVerification}
                  onChange={(e) => updateField('googleVerification', e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Bing Verification Code
                </label>
                <Input
                  value={settings.bingVerification}
                  onChange={(e) => updateField('bingVerification', e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Yandex Verification Key
                </label>
                <Input
                  value={settings.yandexVerification}
                  onChange={(e) => updateField('yandexVerification', e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  IndexNow Key
                </label>
                <Input
                  value={settings.indexNowKey}
                  onChange={(e) => updateField('indexNowKey', e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>
          </section>

          {/* Structured Data */}
          <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-black dark:text-white">
                <Code className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Structured Data (JSON-LD)</h2>
                <p className="text-xs text-gray-500">Edit schema.org JSON-LD snippets embedded in the website header.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Organization Schema
                </label>
                <textarea
                  value={schemaOrgStr}
                  onChange={(e) => setSchemaOrgStr(e.target.value)}
                  rows={5}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3.5 py-2.5 text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:outline-none resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Website Schema
                </label>
                <textarea
                  value={schemaWebStr}
                  onChange={(e) => setSchemaWebStr(e.target.value)}
                  rows={5}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3.5 py-2.5 text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:outline-none resize-y"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Live Search & Social Preview Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-xs sticky top-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Search className="h-4 w-4 text-purple-500" /> Google SERP Live Simulation
            </h3>

            <div className="p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 truncate">
                <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold">
                  {settings.siteName?.[0] || 'V'}
                </div>
                <span className="truncate">{settings.canonicalDomain || 'https://zenvro.com'}</span>
              </div>

              <div className="text-base font-medium text-blue-600 dark:text-blue-400 hover:underline truncate cursor-pointer pt-1">
                {settings.defaultTitle || settings.siteName}
              </div>

              <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {settings.defaultDescription || 'Explore curated collections and everyday essentials.'}
              </div>
            </div>

            {/* Social OG Card Preview */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Social Sharing Card Preview
              </span>
              <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-950">
                {settings.defaultOgImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.defaultOgImage}
                    alt="OG Preview"
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-28 bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-400">
                    No Social OG Image Uploaded
                  </div>
                )}
                <div className="p-3 space-y-0.5">
                  <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {settings.defaultTitle}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate">
                    {settings.canonicalDomain}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

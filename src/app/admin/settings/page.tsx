'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Save,
  RefreshCw,
  Globe,
  Image as ImageIcon,
  Layout,
  Upload,
  ExternalLink,
  Sparkles,
  Layers,
  Store,
  Share2,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Settings,
  PanelBottom,
  CreditCard,
  Send,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

interface SiteSettings {
  siteName: string;
  tagline?: string;
  favicon: string;
  logo: string;
  logoDark?: string;
  navBrandType?: 'text' | 'logo' | 'both';
  navbarText?: string;
  announcementEnabled?: boolean;
  announcementText?: string;
  announcementLink?: string;
  canonicalDomain: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  currencySymbol?: string;
  currencyCode?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialTwitter?: string;
  socialYoutube?: string;
  socialTiktok?: string;
  copyrightText?: string;
  footerAboutText?: string;
  footerShowPaymentIcons?: boolean;
  footerNewsletterEnabled?: boolean;
  footerNewsletterTitle?: string;
  footerNewsletterSubtitle?: string;
  footerQuickLinksTitle?: string;
}

type TabType = 'general' | 'navbar' | 'footer' | 'contact';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const faviconInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoDarkInputRef = useRef<HTMLInputElement>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings', { credentials: 'include' });
      const json = await res.json();
      if (json.success && json.data) {
        setSettings(json.data);
      } else {
        toast.error(json.message || 'Failed to load settings');
      }
    } catch {
      toast.error('Failed to connect to site settings API');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateField = (field: keyof SiteSettings, value: unknown) => {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleFileUpload = async (file: File, fieldName: keyof SiteSettings) => {
    if (!file) return;
    setUploadingField(fieldName);
    const toastId = toast.loading(`Uploading image...`);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'site-settings');

      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.data?.url) {
        updateField(fieldName, json.data.url);
        toast.success('Image uploaded successfully!', { id: toastId });
      } else {
        toast.error(json.error || json.message || 'Upload failed', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload image file', { id: toastId });
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const toastId = toast.loading('Saving site settings...');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setSettings(json.data);
        toast.success('Site settings updated successfully!', { id: toastId });
      } else {
        toast.error(json.error || json.message || 'Failed to update settings', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-black dark:text-white opacity-60" />
        <p className="text-sm font-medium text-gray-500">Loading site settings...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 max-w-lg mx-auto shadow-sm">
        <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Unable to load settings</h3>
        <p className="text-sm text-gray-500 mt-1 mb-6">There was an issue fetching current site configuration.</p>
        <button
          onClick={fetchSettings}
          className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Site Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage store identity, logos, favicon, navbar text, announcement bar, footer, contact info, and currency.
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
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
        <button
          onClick={() => setActiveTab('general')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-colors cursor-pointer ${
            activeTab === 'general'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Store className="h-4 w-4" />
          General & Branding
        </button>

        <button
          onClick={() => setActiveTab('navbar')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-colors cursor-pointer ${
            activeTab === 'navbar'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Layout className="h-4 w-4" />
          Navbar & Announcement
        </button>

        <button
          onClick={() => setActiveTab('footer')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-colors cursor-pointer ${
            activeTab === 'footer'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <PanelBottom className="h-4 w-4" />
          Footer Settings
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-colors cursor-pointer ${
            activeTab === 'contact'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Share2 className="h-4 w-4" />
          Contact & Social Info
        </button>
      </div>

      {/* TAB 1: GENERAL & BRANDING */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-5 shadow-xs">
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-black dark:text-white">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Basic Site Identity</h2>
                  <p className="text-xs text-gray-500">Configure public site brand name, tagline, and canonical URL.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Site / Store Name
                  </label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => updateField('siteName', e.target.value)}
                    placeholder="e.g. VELOUR"
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Canonical Domain
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
                    Site Tagline
                  </label>
                  <Input
                    value={settings.tagline || ''}
                    onChange={(e) => updateField('tagline', e.target.value)}
                    placeholder="Independent Fashion Atelier & Premium Apparel"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </section>

            {/* Favicon & Logo Uploader Section */}
            <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-5 shadow-xs">
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-black dark:text-white">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Logos & Favicon</h2>
                  <p className="text-xs text-gray-500">Upload or enter image URLs for browser tab icon and header logos.</p>
                </div>
              </div>

              {/* Favicon field */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Favicon Image (.ico, .png, .svg)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    value={settings.favicon}
                    onChange={(e) => updateField('favicon', e.target.value)}
                    placeholder="https://example.com/favicon.png or /favicon.ico"
                    className="flex-1 rounded-xl"
                  />
                  <input
                    type="file"
                    ref={faviconInputRef}
                    accept="image/*,.ico"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'favicon');
                    }}
                  />
                  <button
                    type="button"
                    disabled={uploadingField === 'favicon'}
                    onClick={() => faviconInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-semibold transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {uploadingField === 'favicon' ? 'Uploading...' : 'Upload Favicon'}
                  </button>
                </div>
              </div>

              {/* Main Logo field */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Main Site Logo (Light Theme)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    value={settings.logo}
                    onChange={(e) => updateField('logo', e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="flex-1 rounded-xl"
                  />
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'logo');
                    }}
                  />
                  <button
                    type="button"
                    disabled={uploadingField === 'logo'}
                    onClick={() => logoInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-semibold transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {uploadingField === 'logo' ? 'Uploading...' : 'Upload Logo'}
                  </button>
                </div>
              </div>

              {/* Dark Logo field */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Dark Theme Logo (Optional)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    value={settings.logoDark || ''}
                    onChange={(e) => updateField('logoDark', e.target.value)}
                    placeholder="https://example.com/logo-dark.png"
                    className="flex-1 rounded-xl"
                  />
                  <input
                    type="file"
                    ref={logoDarkInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'logoDark');
                    }}
                  />
                  <button
                    type="button"
                    disabled={uploadingField === 'logoDark'}
                    onClick={() => logoDarkInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-semibold transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {uploadingField === 'logoDark' ? 'Uploading...' : 'Upload Dark Logo'}
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Live Identity & Assets Preview Sidebar */}
          <div className="space-y-6">
            {/* Favicon Browser Tab Live Preview */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Browser Tab Preview
              </h3>
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-xl">
                <div className="bg-white dark:bg-gray-950 rounded-lg p-2 shadow-xs flex items-center gap-2 border border-gray-200 dark:border-gray-800 max-w-xs">
                  {settings.favicon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={settings.favicon}
                      alt="Favicon preview"
                      className="w-4 h-4 object-contain shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-4 h-4 rounded bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-[9px] shrink-0">
                      {settings.siteName?.[0] || 'V'}
                    </div>
                  )}
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                    {settings.siteName || 'VELOUR'}
                  </span>
                  <span className="text-gray-400 text-xs ml-auto">&times;</span>
                </div>
              </div>
            </div>

            {/* Logo Live Preview Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-blue-500" /> Logo Assets Preview
              </h3>

              <div className="space-y-3">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 min-h-[80px]">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Light Mode Logo
                  </span>
                  {settings.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={settings.logo} alt="Logo" className="max-h-10 object-contain" />
                  ) : (
                    <div className="text-lg font-black text-black tracking-widest uppercase">
                      {settings.siteName || 'VELOUR'}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl flex flex-col items-center justify-center gap-2 min-h-[80px]">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    Dark Mode Logo
                  </span>
                  {settings.logoDark || settings.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={settings.logoDark || settings.logo}
                      alt="Dark Logo"
                      className="max-h-10 object-contain"
                    />
                  ) : (
                    <div className="text-lg font-black text-white tracking-widest uppercase">
                      {settings.siteName || 'VELOUR'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NAVBAR & ANNOUNCEMENT */}
      {activeTab === 'navbar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-5 shadow-xs">
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-black dark:text-white">
                  <Layout className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Navbar Brand Style & Text</h2>
                  <p className="text-xs text-gray-500">
                    Choose whether the top header uses text, image logo, or both.
                  </p>
                </div>
              </div>

              {/* Brand display choice */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Navbar Branding Mode
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'text', label: 'Text Only' },
                    { id: 'logo', label: 'Logo Only' },
                    { id: 'both', label: 'Logo & Text' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => updateField('navBrandType', option.id as 'text' | 'logo' | 'both')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        settings.navBrandType === option.id
                          ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black shadow-xs'
                          : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Navbar Display Text / Brand Title
                </label>
                <Input
                  value={settings.navbarText || ''}
                  onChange={(e) => updateField('navbarText', e.target.value)}
                  placeholder="VELOUR"
                  className="rounded-xl"
                />
              </div>
            </section>

            {/* Top Announcement Bar */}
            <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-black dark:text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Top Announcement Bar</h2>
                    <p className="text-xs text-gray-500">Display a promo banner message at the top of every page.</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.announcementEnabled ?? true}
                    onChange={(e) => updateField('announcementEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-gray-600 peer-checked:bg-black dark:peer-checked:bg-white dark:peer-checked:after:bg-black" />
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Announcement Banner Text
                  </label>
                  <Input
                    value={settings.announcementText || ''}
                    onChange={(e) => updateField('announcementText', e.target.value)}
                    placeholder="Complimentary worldwide express shipping on orders over $150"
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Announcement Target Link
                  </label>
                  <Input
                    value={settings.announcementLink || ''}
                    onChange={(e) => updateField('announcementLink', e.target.value)}
                    placeholder="/products or /collections/sale"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Live Navbar Preview Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-xs sticky top-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Layout className="h-4 w-4 text-emerald-500" /> Header Live Simulation
              </h3>

              <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-xs bg-gray-50 dark:bg-gray-950">
                {/* Announcement Bar */}
                {settings.announcementEnabled && (
                  <div className="bg-black text-white dark:bg-white dark:text-black py-1.5 px-3 text-[11px] font-medium text-center truncate flex items-center justify-center gap-2">
                    <span>{settings.announcementText || 'Special announcement banner message'}</span>
                    {settings.announcementLink && <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />}
                  </div>
                )}

                {/* Navbar Bar */}
                <div className="p-3 bg-white dark:bg-gray-900 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    {(settings.navBrandType === 'logo' || settings.navBrandType === 'both') && settings.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={settings.logo} alt="Logo" className="h-5 object-contain" />
                    ) : null}

                    {(settings.navBrandType === 'text' ||
                      settings.navBrandType === 'both' ||
                      !settings.logo) && (
                      <span className="font-extrabold text-xs tracking-wider uppercase text-gray-900 dark:text-white">
                        {settings.navbarText || settings.siteName || 'VELOUR'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                    <span>Shop</span>
                    <span>Cart (0)</span>
                  </div>
                </div>

                <div className="p-5 text-center text-xs text-gray-400 bg-white/50 dark:bg-gray-900/50">
                  Main Page Content Area
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FOOTER SETTINGS */}
      {activeTab === 'footer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Footer About & Brand Info */}
            <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-5 shadow-xs">
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-black dark:text-white">
                  <PanelBottom className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Footer Bio & Navigation</h2>
                  <p className="text-xs text-gray-500">Configure footer brand description, section headers, and payment badges.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Footer Brand Bio / About Text
                  </label>
                  <textarea
                    value={settings.footerAboutText || ''}
                    onChange={(e) => updateField('footerAboutText', e.target.value)}
                    rows={3}
                    placeholder="Discover curated high-fashion collections and modern everyday wardrobe essentials."
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Footer Navigation Header
                    </label>
                    <Input
                      value={settings.footerQuickLinksTitle || 'Quick Links'}
                      onChange={(e) => updateField('footerQuickLinksTitle', e.target.value)}
                      placeholder="e.g. Quick Links or Explore"
                      className="rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Copyright Notice Text
                    </label>
                    <Input
                      value={settings.copyrightText || ''}
                      onChange={(e) => updateField('copyrightText', e.target.value)}
                      placeholder="© 2026 VELOUR. All rights reserved."
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Show accepted payment icons toggle */}
                <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    <div>
                      <div className="text-xs font-bold text-gray-900 dark:text-white">Show Accepted Payment Badges</div>
                      <div className="text-[11px] text-gray-500">Display Visa, Mastercard, AMEX & Apple Pay icons in footer</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.footerShowPaymentIcons ?? true}
                      onChange={(e) => updateField('footerShowPaymentIcons', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-gray-600 peer-checked:bg-black dark:peer-checked:bg-white dark:peer-checked:after:bg-black" />
                  </label>
                </div>
              </div>
            </section>

            {/* Newsletter Subscription Box Config */}
            <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-black dark:text-white">
                    <Send className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Footer Newsletter Subscription</h2>
                    <p className="text-xs text-gray-500">Enable or customize email signup box in the site footer.</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.footerNewsletterEnabled ?? true}
                    onChange={(e) => updateField('footerNewsletterEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-gray-600 peer-checked:bg-black dark:peer-checked:bg-white dark:peer-checked:after:bg-black" />
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Newsletter Box Title
                  </label>
                  <Input
                    value={settings.footerNewsletterTitle || 'Join the VIP Atelier Club'}
                    onChange={(e) => updateField('footerNewsletterTitle', e.target.value)}
                    placeholder="Join the VIP Atelier Club"
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Newsletter Box Subtitle / Offer Text
                  </label>
                  <Input
                    value={settings.footerNewsletterSubtitle || 'Subscribe to receive private sale invitations and 10% off.'}
                    onChange={(e) => updateField('footerNewsletterSubtitle', e.target.value)}
                    placeholder="Subscribe to receive private sale invitations and 10% off."
                    className="rounded-xl"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Full Footer Live Simulation Card Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-xs sticky top-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <PanelBottom className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Footer Live Simulation
              </h3>

              <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-black text-white p-4 space-y-4 shadow-xs">
                {/* Brand & Bio */}
                <div>
                  <div className="font-extrabold text-sm tracking-wider uppercase text-white mb-1">
                    {settings.siteName || 'VELOUR'}
                  </div>
                  <p className="text-[11px] text-gray-400 line-clamp-2">
                    {settings.footerAboutText || 'Discover curated high-fashion collections and modern everyday wardrobe essentials.'}
                  </p>
                </div>

                {/* Newsletter Simulation */}
                {settings.footerNewsletterEnabled && (
                  <div className="p-3 bg-gray-900 rounded-lg space-y-2 border border-gray-800">
                    <div className="text-xs font-bold text-white">
                      {settings.footerNewsletterTitle || 'Join Newsletter'}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {settings.footerNewsletterSubtitle || 'Get 10% off your first order'}
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        disabled
                        placeholder="Enter email address"
                        className="bg-gray-800 border border-gray-700 text-[10px] text-gray-300 px-2 py-1 rounded w-full"
                      />
                      <button disabled className="bg-white text-black px-2 py-1 text-[10px] font-bold rounded">
                        Subscribe
                      </button>
                    </div>
                  </div>
                )}

                {/* Links & Payments */}
                <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-[10px] text-gray-400">
                  <span>{settings.copyrightText || `© ${new Date().getFullYear()} ${settings.siteName}`}</span>
                  {settings.footerShowPaymentIcons && (
                    <div className="flex items-center gap-1 font-mono text-[9px] text-gray-300">
                      <span>VISA</span>
                      <span>MC</span>
                      <span>AMEX</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CONTACT & SOCIAL INFO */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-5 shadow-xs">
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-black dark:text-white">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Store Contact Details</h2>
                  <p className="text-xs text-gray-500">Contact details shown in customer emails and footer.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Support Email
                  </label>
                  <Input
                    value={settings.contactEmail || ''}
                    onChange={(e) => updateField('contactEmail', e.target.value)}
                    placeholder="support@velour.com"
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Support Phone Number
                  </label>
                  <Input
                    value={settings.contactPhone || ''}
                    onChange={(e) => updateField('contactPhone', e.target.value)}
                    placeholder="+1 (800) 555-0199"
                    className="rounded-xl"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Physical Store / Office Address
                  </label>
                  <Input
                    value={settings.contactAddress || ''}
                    onChange={(e) => updateField('contactAddress', e.target.value)}
                    placeholder="742 Evergreen Terrace, Suite 100, New York, NY 10001"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </section>

            {/* Currency & Copyright */}
            <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-5 shadow-xs">
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-black dark:text-white">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Currency & Regional Settings</h2>
                  <p className="text-xs text-gray-500">Default pricing currency and regional display settings.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Currency Symbol
                  </label>
                  <Input
                    value={settings.currencySymbol || '$'}
                    onChange={(e) => updateField('currencySymbol', e.target.value)}
                    placeholder="$ or ৳ or €"
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Currency Code
                  </label>
                  <Input
                    value={settings.currencyCode || 'USD'}
                    onChange={(e) => updateField('currencyCode', e.target.value)}
                    placeholder="USD or BDT or EUR"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </section>

            {/* Social Links */}
            <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-5 shadow-xs">
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-black dark:text-white">
                  <Share2 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Social Media Profiles</h2>
                  <p className="text-xs text-gray-500">Provide official URLs for your brand social channels.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Facebook Page URL
                  </label>
                  <Input
                    value={settings.socialFacebook || ''}
                    onChange={(e) => updateField('socialFacebook', e.target.value)}
                    placeholder="https://facebook.com/yourbrand"
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Instagram Handle / URL
                  </label>
                  <Input
                    value={settings.socialInstagram || ''}
                    onChange={(e) => updateField('socialInstagram', e.target.value)}
                    placeholder="https://instagram.com/yourbrand"
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Twitter / X Profile URL
                  </label>
                  <Input
                    value={settings.socialTwitter || ''}
                    onChange={(e) => updateField('socialTwitter', e.target.value)}
                    placeholder="https://x.com/yourbrand"
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    YouTube Channel URL
                  </label>
                  <Input
                    value={settings.socialYoutube || ''}
                    onChange={(e) => updateField('socialYoutube', e.target.value)}
                    placeholder="https://youtube.com/@yourbrand"
                    className="rounded-xl"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    TikTok Profile URL
                  </label>
                  <Input
                    value={settings.socialTiktok || ''}
                    onChange={(e) => updateField('socialTiktok', e.target.value)}
                    placeholder="https://tiktok.com/@yourbrand"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Contact Card Live Preview */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-xs sticky top-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Store className="h-4 w-4 text-pink-500" /> Contact Details Preview
              </h3>

              <div className="p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl space-y-3">
                <div className="font-bold text-sm text-gray-900 dark:text-white">
                  {settings.siteName || 'VELOUR'}
                </div>
                <div className="text-xs text-gray-500 space-y-1.5">
                  {settings.contactEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{settings.contactEmail}</span>
                    </div>
                  )}
                  {settings.contactPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{settings.contactPhone}</span>
                    </div>
                  )}
                  {settings.contactAddress && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{settings.contactAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

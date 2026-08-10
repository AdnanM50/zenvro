'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Save,
  RefreshCw,
  BarChart3,
  Code,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Shield,
  Layers,
  Terminal,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { getAnalyticsSettings, updateAnalyticsSettings } from '@/services/analytics.service';
import type { AnalyticsSettings } from '@/types';

type TabType = 'pixels' | 'custom-scripts';

export default function AnalyticsSettingsPage() {
  const [settings, setSettings] = useState<AnalyticsSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('pixels');

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAnalyticsSettings();
      setSettings(res.data);
    } catch {
      toast.error('Failed to load analytics settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await updateAnalyticsSettings({
        googleAnalyticsId: settings.googleAnalyticsId || '',
        googleTagManagerId: settings.googleTagManagerId || '',
        facebookPixelId: settings.facebookPixelId || '',
        microsoftClarityId: settings.microsoftClarityId || '',
        hotjarId: settings.hotjarId || '',
        tiktokPixelId: settings.tiktokPixelId || '',
        snapchatPixelId: settings.snapchatPixelId || '',
        linkedInInsightId: settings.linkedInInsightId || '',
        customScriptsHead: settings.customScriptsHead || '',
        customScriptsBody: settings.customScriptsBody || '',
        customScriptsFooter: settings.customScriptsFooter || '',
      });
      setSettings(res.data);
      toast.success('Analytics settings updated successfully');
    } catch {
      toast.error('Failed to save analytics settings');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof AnalyticsSettings, value: string) => {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="h-7 w-7 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-24">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">Failed to load analytics settings.</p>
        <button
          onClick={fetchSettings}
          className="mt-4 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </div>
    );
  }

  const activeTrackingCount = [
    settings.googleAnalyticsId,
    settings.googleTagManagerId,
    settings.facebookPixelId,
    settings.microsoftClarityId,
    settings.hotjarId,
    settings.tiktokPixelId,
    settings.snapchatPixelId,
    settings.linkedInInsightId,
  ].filter(Boolean).length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Tracking</h1>
            <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-orange-500/20">
              {activeTrackingCount} Active Integrations
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage tracking pixels, measurement IDs, and custom header/body/footer scripts for your e-commerce platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchSettings}
            disabled={saving}
            className="p-2.5 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            title="Reload settings"
          >
            <RefreshCw className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md shadow-black/10 dark:shadow-white/10"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('pixels')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'pixels'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <BarChart3 className="h-4 w-4" /> Tracking Pixels & Analytics
        </button>
        <button
          onClick={() => setActiveTab('custom-scripts')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'custom-scripts'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Code className="h-4 w-4" /> Custom Scripts (Head/Body/Footer)
        </button>
      </div>

      {activeTab === 'pixels' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Google Analytics 4 */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Google Analytics 4</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Measurement ID (e.g., G-XXXXXXXXXX)</p>
                </div>
              </div>
              {settings.googleAnalyticsId ? (
                <span className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full font-medium border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </span>
              ) : (
                <span className="text-[11px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full font-medium">
                  Not Configured
                </span>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">GA4 Measurement ID</label>
              <Input
                value={settings.googleAnalyticsId}
                onChange={(e) => updateField('googleAnalyticsId', e.target.value)}
                placeholder="G-XXXXXXXXXX"
              />
            </div>
          </div>

          {/* Google Tag Manager */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Google Tag Manager</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Container ID (e.g., GTM-XXXXXXX)</p>
                </div>
              </div>
              {settings.googleTagManagerId ? (
                <span className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full font-medium border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </span>
              ) : (
                <span className="text-[11px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full font-medium">
                  Not Configured
                </span>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">GTM Container ID</label>
              <Input
                value={settings.googleTagManagerId}
                onChange={(e) => updateField('googleTagManagerId', e.target.value)}
                placeholder="GTM-XXXXXXX"
              />
            </div>
          </div>

          {/* Facebook / Meta Pixel */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100/50 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm">
                  fb
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Facebook / Meta Pixel</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pixel ID (e.g., 123456789012345)</p>
                </div>
              </div>
              {settings.facebookPixelId ? (
                <span className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full font-medium border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </span>
              ) : (
                <span className="text-[11px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full font-medium">
                  Not Configured
                </span>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Meta Pixel ID</label>
              <Input
                value={settings.facebookPixelId}
                onChange={(e) => updateField('facebookPixelId', e.target.value)}
                placeholder="123456789012345"
              />
            </div>
          </div>

          {/* Microsoft Clarity */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Microsoft Clarity</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Project ID (e.g., abcdef1234)</p>
                </div>
              </div>
              {settings.microsoftClarityId ? (
                <span className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full font-medium border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </span>
              ) : (
                <span className="text-[11px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full font-medium">
                  Not Configured
                </span>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Clarity Project ID</label>
              <Input
                value={settings.microsoftClarityId}
                onChange={(e) => updateField('microsoftClarityId', e.target.value)}
                placeholder="abcdef1234"
              />
            </div>
          </div>

          {/* Hotjar */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Hotjar Analytics</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Site ID (e.g., 1234567)</p>
                </div>
              </div>
              {settings.hotjarId ? (
                <span className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full font-medium border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </span>
              ) : (
                <span className="text-[11px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full font-medium">
                  Not Configured
                </span>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Hotjar Site ID</label>
              <Input
                value={settings.hotjarId}
                onChange={(e) => updateField('hotjarId', e.target.value)}
                placeholder="1234567"
              />
            </div>
          </div>

          {/* TikTok Pixel */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white font-bold text-sm">
                  TT
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">TikTok Pixel</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pixel ID (e.g., C1234567890)</p>
                </div>
              </div>
              {settings.tiktokPixelId ? (
                <span className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full font-medium border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </span>
              ) : (
                <span className="text-[11px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full font-medium">
                  Not Configured
                </span>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">TikTok Pixel ID</label>
              <Input
                value={settings.tiktokPixelId}
                onChange={(e) => updateField('tiktokPixelId', e.target.value)}
                placeholder="C1234567890"
              />
            </div>
          </div>

          {/* Snapchat Pixel */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-950/50 flex items-center justify-center text-yellow-700 dark:text-yellow-400 font-bold text-sm">
                  SC
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Snapchat Pixel</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pixel ID (e.g., xxxx-xxxx-xxxx)</p>
                </div>
              </div>
              {settings.snapchatPixelId ? (
                <span className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full font-medium border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </span>
              ) : (
                <span className="text-[11px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full font-medium">
                  Not Configured
                </span>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Snapchat Pixel ID</label>
              <Input
                value={settings.snapchatPixelId}
                onChange={(e) => updateField('snapchatPixelId', e.target.value)}
                placeholder="xxxx-xxxx-xxxx"
              />
            </div>
          </div>

          {/* LinkedIn Insight Tag */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center text-sky-700 dark:text-sky-300 font-bold text-sm">
                  in
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">LinkedIn Insight Tag</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Partner ID (e.g., 123456)</p>
                </div>
              </div>
              {settings.linkedInInsightId ? (
                <span className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full font-medium border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </span>
              ) : (
                <span className="text-[11px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full font-medium">
                  Not Configured
                </span>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Partner ID</label>
              <Input
                value={settings.linkedInInsightId}
                onChange={(e) => updateField('linkedInInsightId', e.target.value)}
                placeholder="123456"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'custom-scripts' && (
        <div className="space-y-6">
          {/* Head Scripts */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
              <Terminal className="h-4 w-4 text-orange-500" /> Custom Head Scripts
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              HTML scripts injected inside the <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-800 dark:text-gray-200">&lt;head&gt;</code> element. (e.g. Meta verification tags, custom CSS/JS).
            </p>
            <textarea
              value={settings.customScriptsHead}
              onChange={(e) => updateField('customScriptsHead', e.target.value)}
              rows={5}
              placeholder="<!-- Insert custom <script> or <meta> tags here -->"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3.5 text-xs font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:outline-none resize-y"
            />
          </div>

          {/* Body Scripts */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
              <Code className="h-4 w-4 text-indigo-500" /> Custom Body Scripts
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              HTML scripts injected immediately after opening <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-800 dark:text-gray-200">&lt;body&gt;</code> tag (e.g. GTM noscript fallbacks).
            </p>
            <textarea
              value={settings.customScriptsBody}
              onChange={(e) => updateField('customScriptsBody', e.target.value)}
              rows={5}
              placeholder="<!-- Insert top-of-body scripts or noscript tags here -->"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3.5 text-xs font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:outline-none resize-y"
            />
          </div>

          {/* Footer Scripts */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
              <ExternalLink className="h-4 w-4 text-emerald-500" /> Custom Footer Scripts
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              HTML scripts injected immediately before closing <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-800 dark:text-gray-200">&lt;/body&gt;</code> tag (e.g. live chat widgets, floating triggers).
            </p>
            <textarea
              value={settings.customScriptsFooter}
              onChange={(e) => updateField('customScriptsFooter', e.target.value)}
              rows={5}
              placeholder="<!-- Insert footer scripts, live chat scripts, etc. here -->"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3.5 text-xs font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:outline-none resize-y"
            />
          </div>
        </div>
      )}
    </div>
  );
}

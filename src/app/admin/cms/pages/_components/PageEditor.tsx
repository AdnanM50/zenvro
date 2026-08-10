'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  Plus,
  Trash2,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Layout,
  Type,
  Target,
  Mail,
  FileText,
  Grid,
  HelpCircle,
  Globe,
  Settings as SettingsIcon,
  Layers,
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import type { Page, PageSection, PageSEO, SectionType, PageStatus } from '@/types';
import SectionItemEditor from './SectionItemEditor';
import PageSeoForm from './PageSeoForm';
import ConfirmDialog from '@/app/admin/_components/common/ConfirmDialog';

interface PageEditorProps {
  page: Page;
  onSave: (updatedData: {
    title: string;
    slug: string;
    status: PageStatus;
    sections: PageSection[];
    seo: PageSEO;
  }) => void;
  onDeletePage: (pageId: string) => void;
  isSaving?: boolean;
}

export default function PageEditor({
  page,
  onSave,
  onDeletePage,
  isSaving = false,
}: PageEditorProps) {
  const [activeTab, setActiveTab] = useState<'sections' | 'preview' | 'seo' | 'settings'>('sections');
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState(0);

  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [status, setStatus] = useState<PageStatus>(page.status);
  const [sections, setSections] = useState<PageSection[]>(page.sections || []);
  const [seo, setSeo] = useState<PageSEO>(page.seo || { metaTitle: '', metaDescription: '' });
  const [isAddSectionMenuOpen, setIsAddSectionMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const previewPath = slug === 'about-us' ? '/about' : slug === 'contact-us' ? '/contact' : `/${slug.replace(/^\//, '')}`;

  // Sync internal state when active page prop changes
  useEffect(() => {
    setTitle(page.title);
    setSlug(page.slug);
    setStatus(page.status);
    setSections(page.sections || []);
    setSeo(page.seo || { metaTitle: `${page.title} | Zenvro Store`, metaDescription: '' });
  }, [page]);

  const handleReset = () => {
    setTitle(page.title);
    setSlug(page.slug);
    setStatus(page.status);
    setSections(page.sections || []);
    setSeo(page.seo || { metaTitle: '', metaDescription: '' });
  };

  const handleAddSection = (type: SectionType) => {
    const newId = `sec-${Date.now()}`;
    let newSection: PageSection;

    switch (type) {
      case 'hero':
        newSection = {
          id: newId,
          type: 'hero',
          title: 'Hero Banner Heading',
          subtitle: 'Catchy subtitle for this section',
          isActive: true,
          order: sections.length + 1,
          data: { bgImage: '', ctaLabel: 'Shop Now', ctaLink: '/products' },
        };
        break;
      case 'missionVision':
        newSection = {
          id: newId,
          type: 'missionVision',
          title: 'Our Mission & Vision',
          subtitle: 'Our guiding principles',
          isActive: true,
          order: sections.length + 1,
          data: {
            missionHeading: 'Our Mission',
            missionText: 'Mission details here...',
            visionHeading: 'Our Vision',
            visionText: 'Vision details here...',
            values: ['Quality', 'Integrity', 'Innovation'],
          },
        };
        break;
      case 'contactInfo':
        newSection = {
          id: newId,
          type: 'contactInfo',
          title: 'Get In Touch',
          subtitle: 'We are here to assist you 24/7',
          isActive: true,
          order: sections.length + 1,
          data: { email: 'support@zenvro.com', phone: '+1 800 000 0000', address: '123 Main St', showContactForm: true },
        };
        break;
      case 'policyClauses':
        newSection = {
          id: newId,
          type: 'policyClauses',
          title: 'Terms & Policy Guidelines',
          subtitle: 'Effective August 2026',
          isActive: true,
          order: sections.length + 1,
          data: {
            clauses: [{ title: '1. General Overview', content: 'Clause content goes here...' }],
          },
        };
        break;
      case 'featuresGrid':
        newSection = {
          id: newId,
          type: 'featuresGrid',
          title: 'Our Core Features',
          subtitle: 'Why customers choose us',
          isActive: true,
          order: sections.length + 1,
          data: {
            items: [
              { icon: 'ShieldCheck', title: 'Feature 1', description: 'Description 1' },
              { icon: 'Truck', title: 'Feature 2', description: 'Description 2' },
            ],
          },
        };
        break;
      case 'stats':
        newSection = {
          id: newId,
          type: 'stats',
          title: 'Become part of the story',
          subtitle: 'Every drop is a small chapter.',
          isActive: true,
          order: sections.length + 1,
          data: {
            items: [
              { value: 8, suffix: '', label: 'Years of craft' },
              { value: 45, suffix: '', label: 'Signature collections' },
            ],
            ctaLabel: 'Explore the edit',
            ctaLink: '/products',
          },
        };
        break;
      case 'faq':
        newSection = {
          id: newId,
          type: 'faq',
          title: 'Frequently Asked Questions',
          subtitle: 'Find quick answers',
          isActive: true,
          order: sections.length + 1,
          data: {
            items: [{ q: 'Sample Question?', a: 'Sample answer details.' }],
          },
        };
        break;
      default:
        newSection = {
          id: newId,
          type: 'richText',
          title: 'Content Section',
          subtitle: '',
          isActive: true,
          order: sections.length + 1,
          data: { body: 'Write rich paragraph content here...' },
        };
        break;
    }

    setSections([...sections, newSection]);
    setIsAddSectionMenuOpen(false);
  };

  const handleUpdateSection = (index: number, updated: PageSection) => {
    const newSections = [...sections];
    newSections[index] = updated;
    setSections(newSections);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    const temp = newSections[index - 1];
    newSections[index - 1] = newSections[index];
    newSections[index] = temp;
    // update order property
    newSections.forEach((s, idx) => (s.order = idx + 1));
    setSections(newSections);
  };

  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    const temp = newSections[index + 1];
    newSections[index + 1] = newSections[index];
    newSections[index] = temp;
    newSections.forEach((s, idx) => (s.order = idx + 1));
    setSections(newSections);
  };

  const handleDeleteSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    newSections.forEach((s, idx) => (s.order = idx + 1));
    setSections(newSections);
  };

  const handleFormSubmit = () => {
    onSave({
      title,
      slug,
      status,
      sections,
      seo,
    });
  };

  const sectionTypeOptions: { type: SectionType; label: string; icon: any; desc: string }[] = [
    { type: 'hero', label: 'Hero Banner', icon: Layout, desc: 'Header banner with 3 editorial images & CTA buttons' },
    { type: 'richText', label: 'Rich Text / Paragraph', icon: Type, desc: 'General text content block' },
    { type: 'missionVision', label: 'Story & Timeline', icon: Target, desc: 'Our story intro with timeline milestones' },
    { type: 'featuresGrid', label: 'Craft & Values', icon: Grid, desc: 'Grid of 6 craft value cards with icons' },
    { type: 'stats', label: 'Stats & Numbers CTA', icon: Sparkles, desc: 'Counter stats numbers with call-to-action banner' },
    { type: 'contactInfo', label: 'Contact Info & Form', icon: Mail, desc: 'Email, phone, address, and inquiry form' },
    { type: 'policyClauses', label: 'Policy Clauses', icon: FileText, desc: 'Terms & conditions or privacy policy list' },
    { type: 'faq', label: 'FAQ Accordion', icon: HelpCircle, desc: 'Expandable Q&A accordion list' },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Editor Top Bar */}
      <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-gray-50/30">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900">{title || page.title}</h1>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                status === 'published'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-amber-50 text-amber-600 border border-amber-200'
              }`}
            >
              {status}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <span>Slug:</span>
            <code className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-mono text-[11px]">
              /{slug}
            </code>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={`/api/cms/pages/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
            title="Preview JSON / API output"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview API</span>
          </a>

          <button
            onClick={handleReset}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition"
            title="Reset unsaved changes"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleFormSubmit}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition shadow-md shadow-orange-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 px-4 pt-3 border-b border-gray-100 bg-white overflow-x-auto">
        <button
          onClick={() => setActiveTab('sections')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition shrink-0 ${
            activeTab === 'sections'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Edit Sections ({sections.length})
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition shrink-0 ${
            activeTab === 'preview'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Eye className="w-4 h-4" />
          Live Preview
        </button>

        <button
          onClick={() => setActiveTab('seo')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition shrink-0 ${
            activeTab === 'seo'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          SEO & Social Meta
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition shrink-0 ${
            activeTab === 'settings'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          Page Settings
        </button>
      </div>

      {/* Workspace Area */}
      <div className="flex-1 p-1 sm:p-2.5 bg-gray-50/40">
        {/* LIVE PREVIEW TAB */}
        {activeTab === 'preview' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider px-2">Viewport:</span>
                <button
                  type="button"
                  onClick={() => setDevice('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                    device === 'desktop'
                      ? 'bg-orange-50 text-orange-600 border-orange-200 shadow-2xs'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" /> Desktop (100%)
                </button>
                <button
                  type="button"
                  onClick={() => setDevice('tablet')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                    device === 'tablet'
                      ? 'bg-orange-50 text-orange-600 border-orange-200 shadow-2xs'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" /> Tablet (768px)
                </button>
                <button
                  type="button"
                  onClick={() => setDevice('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                    device === 'mobile'
                      ? 'bg-orange-50 text-orange-600 border-orange-200 shadow-2xs'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Mobile (375px)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewKey((k) => k + 1)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reload Preview
                </button>
                <a
                  href={previewPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-black hover:bg-gray-800 rounded-xl transition shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Public Page
                </a>
              </div>
            </div>

            {/* Frame Canvas */}
            <div className="bg-gray-900/90 rounded-2xl p-4 sm:p-8 flex justify-center items-start min-h-[700px] overflow-x-auto shadow-inner">
              <div
                className={`bg-white rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 border border-gray-700 flex flex-col ${
                  device === 'desktop'
                    ? 'w-full max-w-[1280px] h-[750px]'
                    : device === 'tablet'
                    ? 'w-[768px] h-[750px]'
                    : 'w-[375px] h-[667px]'
                }`}
              >
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                  </div>
                  <div className="flex-1 bg-white px-3 py-1 rounded-lg border border-gray-200 text-gray-500 font-mono text-[11px] truncate flex items-center justify-between">
                    <span>https://zenvro.com{previewPath}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold uppercase">LIVE PREVIEW</span>
                  </div>
                </div>

                <iframe
                  key={previewKey}
                  src={previewPath}
                  title="Live Preview Page"
                  className="w-full flex-1 border-none bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTIONS TAB */}
        {activeTab === 'sections' && (
          <div className="space-y-4 max-w-5xl mx-auto">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Dynamic Sections Manager</h3>
                <p className="text-xs text-gray-400">Reorder, toggle, and edit block content dynamically</p>
              </div>

              {/* Add Section Button with Popover */}
              <div className="relative">
                <button
                  onClick={() => setIsAddSectionMenuOpen(!isAddSectionMenuOpen)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-black text-white hover:bg-gray-800 rounded-xl transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Section
                </button>

                {isAddSectionMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-gray-100 shadow-xl z-30 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Select Section Type
                    </div>
                    {sectionTypeOptions.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.type}
                          onClick={() => handleAddSection(opt.type)}
                          className="w-full text-left p-2 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition flex items-start gap-2.5 group"
                        >
                          <Icon className="w-4 h-4 text-gray-400 group-hover:text-orange-500 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-semibold text-gray-800 group-hover:text-orange-600">
                              {opt.label}
                            </div>
                            <div className="text-[10px] text-gray-400">{opt.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Sections List */}
            {sections.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 mx-auto flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-gray-800 text-sm">No Sections Added Yet</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Build your page dynamically by adding your first section block.
                </p>
                <button
                  onClick={() => setIsAddSectionMenuOpen(true)}
                  className="px-4 py-2 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition shadow-sm"
                >
                  + Add First Section
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sections.map((section, idx) => (
                  <SectionItemEditor
                    key={section.id || idx}
                    section={section}
                    index={idx}
                    totalSections={sections.length}
                    onChange={(updated) => handleUpdateSection(idx, updated)}
                    onMoveUp={() => handleMoveUp(idx)}
                    onMoveDown={() => handleMoveDown(idx)}
                    onDelete={() => handleDeleteSection(idx)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* SEO TAB */}
        {activeTab === 'seo' && (
          <div className="max-w-3xl mx-auto">
            <PageSeoForm seo={seo} onChange={setSeo} />
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm">General Page Parameters</h3>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Page Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Publication Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PageStatus)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500"
                >
                  <option value="published">Published (Live)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50/50 p-5 rounded-2xl border border-red-100 space-y-3">
              <div className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-4 h-4" />
                <h4 className="font-semibold text-xs">Danger Zone</h4>
              </div>
              <p className="text-[11px] text-gray-500">
                Deleting this page will permanently remove it from the CMS.
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3.5 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl transition shadow-sm"
              >
                Delete Page
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDeletePage(page._id);
        }}
        description={`Are you sure you want to delete "${title}"? This action cannot be undone.`}
      />
    </div>
  );
}

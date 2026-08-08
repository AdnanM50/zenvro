'use client';

import React, { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  X,
  Type,
  Layout,
  Target,
  Mail,
  FileText,
  Grid,
  HelpCircle,
} from 'lucide-react';
import type { PageSection, SectionType } from '@/types';
import GalleryPickerButton from '@/app/admin/gallery/_components/GalleryPickerButton';

interface SectionItemEditorProps {
  section: PageSection;
  index: number;
  totalSections: number;
  onChange: (updated: PageSection) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

export default function SectionItemEditor({
  section,
  index,
  totalSections,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: SectionItemEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateField = (field: keyof PageSection, value: any) => {
    onChange({ ...section, [field]: value });
  };

  const updateDataField = (dataKey: string, value: any) => {
    onChange({
      ...section,
      data: {
        ...(section.data || {}),
        [dataKey]: value,
      },
    });
  };

  const getSectionBadge = (type: SectionType) => {
    switch (type) {
      case 'hero':
        return { label: 'Hero Banner', icon: Layout, color: 'bg-purple-50 text-purple-600 border-purple-200' };
      case 'missionVision':
        return { label: 'Mission & Vision', icon: Target, color: 'bg-blue-50 text-blue-600 border-blue-200' };
      case 'contactInfo':
        return { label: 'Contact Info', icon: Mail, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
      case 'policyClauses':
        return { label: 'Policy Clauses', icon: FileText, color: 'bg-amber-50 text-amber-600 border-amber-200' };
      case 'featuresGrid':
        return { label: 'Features Grid', icon: Grid, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' };
      case 'faq':
        return { label: 'FAQ Accordion', icon: HelpCircle, color: 'bg-rose-50 text-rose-600 border-rose-200' };
      default:
        return { label: 'Rich Text', icon: Type, color: 'bg-gray-50 text-gray-600 border-gray-200' };
    }
  };

  const badge = getSectionBadge(section.type);
  const BadgeIcon = badge.icon;

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm ${
        section.isActive ? 'border-gray-200' : 'border-gray-200 opacity-60 bg-gray-50/50'
      }`}
    >
      {/* Section Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/40 rounded-t-2xl">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1">
            <button
              onClick={onMoveUp}
              disabled={index === 0}
              className="p-1 text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-400 rounded transition"
              title="Move Section Up"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={onMoveDown}
              disabled={index === totalSections - 1}
              className="p-1 text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-400 rounded transition"
              title="Move Section Down"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="cursor-pointer flex items-center gap-2.5 truncate select-none"
          >
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${badge.color}`}>
              <BadgeIcon className="w-3.5 h-3.5" />
              {badge.label}
            </span>
            <span className="font-semibold text-sm text-gray-900 truncate">
              {section.title || 'Untitled Section'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => updateField('isActive', !section.isActive)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
              section.isActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-gray-100 text-gray-500 border-gray-200'
            }`}
            title="Toggle Section Visibility"
          >
            {section.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {section.isActive ? 'Active' : 'Hidden'}
          </button>

          <button
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Delete Section"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Section Content Editor */}
      {isExpanded && (
        <div className="p-4 space-y-4 text-xs">
          {/* Section Main Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Section Heading</label>
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Enter section heading..."
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Section Subheading / Subtitle</label>
              <input
                type="text"
                value={section.subtitle || ''}
                onChange={(e) => updateField('subtitle', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Enter section subtitle..."
              />
            </div>
          </div>

          {/* Type-Specific Data Fields */}
          <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100 space-y-3">
            {/* HERO SECTION */}
            {section.type === 'hero' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Background Image URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={section.data?.bgImage || ''}
                      onChange={(e) => updateDataField('bgImage', e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                      placeholder="https://images.unsplash.com/..."
                    />
                    <GalleryPickerButton
                      onSelect={(urls) => updateDataField('bgImage', urls[0] || '')}
                      label="Choose Image"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Primary CTA Label</label>
                    <input
                      type="text"
                      value={section.data?.ctaLabel || ''}
                      onChange={(e) => updateDataField('ctaLabel', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                      placeholder="e.g. Shop Now"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Primary CTA Link</label>
                    <input
                      type="text"
                      value={section.data?.ctaLink || ''}
                      onChange={(e) => updateDataField('ctaLink', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                      placeholder="/products"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Secondary CTA Label</label>
                    <input
                      type="text"
                      value={section.data?.secondaryCtaLabel || ''}
                      onChange={(e) => updateDataField('secondaryCtaLabel', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                      placeholder="e.g. Learn More"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Secondary CTA Link</label>
                    <input
                      type="text"
                      value={section.data?.secondaryCtaLink || ''}
                      onChange={(e) => updateDataField('secondaryCtaLink', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                      placeholder="/about-us"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* RICH TEXT SECTION */}
            {section.type === 'richText' && (
              <div>
                <label className="block text-gray-700 font-medium mb-1">Section Body Content (Markdown / HTML / Text)</label>
                <textarea
                  rows={5}
                  value={section.data?.body || ''}
                  onChange={(e) => updateDataField('body', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-mono text-xs"
                  placeholder="Enter main content text..."
                />
              </div>
            )}

            {/* MISSION & VISION */}
            {section.type === 'missionVision' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Mission Heading</label>
                    <input
                      type="text"
                      value={section.data?.missionHeading || 'Mission'}
                      onChange={(e) => updateDataField('missionHeading', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                    />
                    <label className="block text-gray-700 font-medium mt-2 mb-1">Mission Description</label>
                    <textarea
                      rows={3}
                      value={section.data?.missionText || ''}
                      onChange={(e) => updateDataField('missionText', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Vision Heading</label>
                    <input
                      type="text"
                      value={section.data?.visionHeading || 'Vision'}
                      onChange={(e) => updateDataField('visionHeading', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                    />
                    <label className="block text-gray-700 font-medium mt-2 mb-1">Vision Description</label>
                    <textarea
                      rows={3}
                      value={section.data?.visionText || ''}
                      onChange={(e) => updateDataField('visionText', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>

                {/* Values array */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-gray-700 font-medium">Core Values List</label>
                    <button
                      type="button"
                      onClick={() => {
                        const vals = section.data?.values || [];
                        updateDataField('values', [...vals, 'New Value']);
                      }}
                      className="text-orange-600 hover:text-orange-700 font-semibold text-[11px] flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Value
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {(section.data?.values || []).map((val: string, vIdx: number) => (
                      <div key={vIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => {
                            const newVals = [...(section.data?.values || [])];
                            newVals[vIdx] = e.target.value;
                            updateDataField('values', newVals);
                          }}
                          className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newVals = (section.data?.values || []).filter((_: any, i: number) => i !== vIdx);
                            updateDataField('values', newVals);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CONTACT INFO */}
            {section.type === 'contactInfo' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    value={section.data?.email || ''}
                    onChange={(e) => updateDataField('email', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={section.data?.phone || ''}
                    onChange={(e) => updateDataField('phone', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Physical Address</label>
                  <input
                    type="text"
                    value={section.data?.address || ''}
                    onChange={(e) => updateDataField('address', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Support Hours</label>
                  <input
                    type="text"
                    value={section.data?.workingHours || ''}
                    onChange={(e) => updateDataField('workingHours', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl"
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id={`contact-form-${section.id}`}
                    checked={section.data?.showContactForm ?? true}
                    onChange={(e) => updateDataField('showContactForm', e.target.checked)}
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <label htmlFor={`contact-form-${section.id}`} className="text-gray-700 font-medium cursor-pointer">
                    Enable Interactive Contact Inquiry Form
                  </label>
                </div>
              </div>
            )}

            {/* POLICY CLAUSES */}
            {section.type === 'policyClauses' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-gray-700 font-medium">Policy Clauses & Paragraphs</label>
                  <button
                    type="button"
                    onClick={() => {
                      const clauses = section.data?.clauses || [];
                      updateDataField('clauses', [
                        ...clauses,
                        { title: `${clauses.length + 1}. Clause Title`, content: 'Detailed clause text content...' },
                      ]);
                    }}
                    className="text-orange-600 hover:text-orange-700 font-semibold text-[11px] flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Clause
                  </button>
                </div>
                <div className="space-y-2">
                  {(section.data?.clauses || []).map((clause: any, cIdx: number) => (
                    <div key={cIdx} className="bg-white p-3 rounded-xl border border-gray-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={clause.title || ''}
                          onChange={(e) => {
                            const newClauses = [...(section.data?.clauses || [])];
                            newClauses[cIdx] = { ...newClauses[cIdx], title: e.target.value };
                            updateDataField('clauses', newClauses);
                          }}
                          className="flex-1 font-semibold px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                          placeholder="Clause Title"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newClauses = (section.data?.clauses || []).filter((_: any, i: number) => i !== cIdx);
                            updateDataField('clauses', newClauses);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={clause.content || ''}
                        onChange={(e) => {
                          const newClauses = [...(section.data?.clauses || [])];
                          newClauses[cIdx] = { ...newClauses[cIdx], content: e.target.value };
                          updateDataField('clauses', newClauses);
                        }}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                        placeholder="Clause details..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FEATURES GRID */}
            {section.type === 'featuresGrid' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-gray-700 font-medium">Feature Cards</label>
                  <button
                    type="button"
                    onClick={() => {
                      const items = section.data?.items || [];
                      updateDataField('items', [
                        ...items,
                        { icon: 'Sparkles', title: 'New Feature', description: 'Feature description details' },
                      ]);
                    }}
                    className="text-orange-600 hover:text-orange-700 font-semibold text-[11px] flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Feature Card
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(section.data?.items || []).map((item: any, fIdx: number) => (
                    <div key={fIdx} className="bg-white p-3 rounded-xl border border-gray-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={item.title || ''}
                          onChange={(e) => {
                            const newItems = [...(section.data?.items || [])];
                            newItems[fIdx] = { ...newItems[fIdx], title: e.target.value };
                            updateDataField('items', newItems);
                          }}
                          className="flex-1 font-semibold px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                          placeholder="Feature Title"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = (section.data?.items || []).filter((_: any, i: number) => i !== fIdx);
                            updateDataField('items', newItems);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={item.icon || 'Sparkles'}
                        onChange={(e) => {
                          const newItems = [...(section.data?.items || [])];
                          newItems[fIdx] = { ...newItems[fIdx], icon: e.target.value };
                          updateDataField('items', newItems);
                        }}
                        className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                        placeholder="Lucide Icon Name (e.g. ShieldCheck, Truck, Sparkles)"
                      />
                      <textarea
                        rows={2}
                        value={item.description || ''}
                        onChange={(e) => {
                          const newItems = [...(section.data?.items || [])];
                          newItems[fIdx] = { ...newItems[fIdx], description: e.target.value };
                          updateDataField('items', newItems);
                        }}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                        placeholder="Feature Description"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ SECTION */}
            {section.type === 'faq' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-gray-700 font-medium">FAQ Questions & Answers</label>
                  <button
                    type="button"
                    onClick={() => {
                      const items = section.data?.items || [];
                      updateDataField('items', [
                        ...items,
                        { question: 'What is your question?', answer: 'Answer details here.' },
                      ]);
                    }}
                    className="text-orange-600 hover:text-orange-700 font-semibold text-[11px] flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add FAQ Item
                  </button>
                </div>
                <div className="space-y-2">
                  {(section.data?.items || []).map((faq: any, qIdx: number) => (
                    <div key={qIdx} className="bg-white p-3 rounded-xl border border-gray-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={faq.question || ''}
                          onChange={(e) => {
                            const newItems = [...(section.data?.items || [])];
                            newItems[qIdx] = { ...newItems[qIdx], question: e.target.value };
                            updateDataField('items', newItems);
                          }}
                          className="flex-1 font-semibold px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                          placeholder="Question?"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = (section.data?.items || []).filter((_: any, i: number) => i !== qIdx);
                            updateDataField('items', newItems);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={faq.answer || ''}
                        onChange={(e) => {
                          const newItems = [...(section.data?.items || [])];
                          newItems[qIdx] = { ...newItems[qIdx], answer: e.target.value };
                          updateDataField('items', newItems);
                        }}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                        placeholder="Answer details..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
  BarChart3,
  Pencil,
} from 'lucide-react';
import type { PageSection, SectionType } from '@/types';
import GalleryPickerButton from '@/app/admin/gallery/_components/GalleryPickerButton';
import GalleryPicker from '@/app/admin/gallery/_components/GalleryPicker';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface SectionItemEditorProps {
  section: PageSection;
  index: number;
  totalSections: number;
  onChange: (updated: PageSection) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

function ImageFieldWithPreview({
  label,
  value,
  onChange,
  onGallerySelect,
  placeholder = 'https://...',
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onGallerySelect?: (urls: string[]) => void;
  placeholder?: string;
}) {
  const [hasError, setHasError] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const hasValue = Boolean(value && value.trim());

  return (
    <div className="space-y-1.5">
      <label className="block text-gray-700 font-medium text-xs">{label}</label>

      {hasValue && !isEditingUrl ? (
        <div className="relative w-full aspect-square sm:aspect-[4/5] max-w-[200px] rounded-xl overflow-hidden bg-gray-100 group border border-gray-200 shadow-sm flex items-center justify-center">
          {!hasError ? (
            <img
              src={value}
              alt="Selected preview"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={() => setHasError(true)}
            />
          ) : (
            <span className="text-[10px] text-gray-400 font-mono text-center px-2">Invalid Image URL</span>
          )}

          {/* Dark Overlay on Hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Action Buttons Container */}
          <div className="absolute inset-0 flex items-center justify-center gap-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            {/* View / Change */}
            <button
              type="button"
              onClick={() => setIsGalleryOpen(true)}
              className="w-10 h-10 rounded-full bg-white text-slate-700 hover:text-slate-900 shadow-xl flex items-center justify-center transition-transform hover:scale-110"
              title="Change Image (Gallery)"
            >
              <Eye className="w-4 h-4 stroke-[2.5]" />
            </button>
            
            {/* Edit URL */}
            <button
              type="button"
              onClick={() => setIsEditingUrl(true)}
              className="w-10 h-10 rounded-full bg-white text-slate-700 hover:text-slate-900 shadow-xl flex items-center justify-center transition-transform hover:scale-110"
              title="Edit URL Manually"
            >
              <Pencil className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Remove */}
            <button
              type="button"
              onClick={() => {
                setHasError(false);
                onChange('');
              }}
              className="w-10 h-10 rounded-full bg-white text-red-500 hover:text-red-600 shadow-xl flex items-center justify-center transition-transform hover:scale-110"
              title="Remove Image"
            >
              <Trash2 className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
          
          <GalleryPicker
            open={isGalleryOpen}
            onClose={() => setIsGalleryOpen(false)}
            onSelect={(urls) => {
              setHasError(false);
              setIsGalleryOpen(false);
              if (onGallerySelect) onGallerySelect(urls);
              else if (urls[0]) onChange(urls[0]);
            }}
            multiple={false}
          />
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <Input
            type="text"
            value={value}
            onChange={(e) => {
              setHasError(false);
              onChange(e.target.value);
            }}
            className="h-9 flex-1 rounded-md bg-white px-2.5 font-mono text-[11px] focus:bg-white focus:border-orange-500"
            placeholder={placeholder}
          />
          <GalleryPickerButton
            onSelect={(urls) => {
              setHasError(false);
              setIsEditingUrl(false);
              if (onGallerySelect) {
                onGallerySelect(urls);
              } else if (urls[0]) {
                onChange(urls[0]);
              }
            }}
            label="Choose"
          />
          {isEditingUrl && (
            <button
              type="button"
              onClick={() => setIsEditingUrl(false)}
              className="px-2 py-1 text-xs text-gray-500 hover:text-gray-800"
            >
              Done
            </button>
          )}
        </div>
      )}
    </div>
  );
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
      case 'stats':
        return { label: 'Stats & Numbers CTA', icon: BarChart3, color: 'bg-teal-50 text-teal-600 border-teal-200' };
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
      className={`bg-white rounded-2xl border transition-all w-full duration-200 shadow-sm ${
        section.isActive ? 'border-gray-200' : 'border-gray-200 opacity-60 bg-gray-50/50'
      }`}
    >
      {/* Section Header */}
      <div className="p-3 sm:p-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 border-b border-gray-100 bg-gray-50/40 rounded-t-2xl">
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
              <Input
                type="text"
                value={section.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="bg-gray-50 focus:bg-white focus:border-orange-500 rounded-md h-10"
                placeholder="Enter section heading..."
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Section Subheading / Subtitle</label>
              <Input
                type="text"
                value={section.subtitle || ''}
                onChange={(e) => updateField('subtitle', e.target.value)}
                className="bg-gray-50 focus:bg-white focus:border-orange-500 rounded-md h-10"
                placeholder="Enter section subtitle..."
              />
            </div>
          </div>

          {/* Type-Specific Data Fields */}
          <div className="bg-gray-50/70 p-3.5 rounded-md border border-gray-100 space-y-3">
            {/* HERO SECTION */}
            {section.type === 'hero' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Tag (Top Left)</label>
                    <Input
                      type="text"
                      value={section.data?.tag || '// About Velour'}
                      onChange={(e) => updateDataField('tag', e.target.value)}
                      className="bg-gray-50 focus:bg-white focus:border-orange-500 rounded-md h-10"
                      placeholder="// About Velour"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Est. Text (Center)</label>
                    <Input
                      type="text"
                      value={section.data?.estText || 'Est. MMXVIII'}
                      onChange={(e) => updateDataField('estText', e.target.value)}
                      className="bg-gray-50 focus:bg-white focus:border-orange-500 rounded-md h-10"
                      placeholder="Est. MMXVIII"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Volume Tag (Top Right)</label>
                    <Input
                      type="text"
                      value={section.data?.volText || '(VOL.01)'}
                      onChange={(e) => updateDataField('volText', e.target.value)}
                      className="bg-gray-50 focus:bg-white focus:border-orange-500 rounded-md h-10"
                      placeholder="(VOL.01)"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Sideways Subtext</label>
                    <Input
                      type="text"
                      value={section.data?.sideText || 'Where elegance meets sustainability'}
                      onChange={(e) => updateDataField('sideText', e.target.value)}
                      className="bg-gray-50 focus:bg-white focus:border-orange-500 rounded-md h-10"
                      placeholder="Where elegance meets sustainability"
                    />
                  </div>
                </div>

                {/* 3 Hero Images Controls */}
                <div className="border border-purple-100 bg-purple-50/40 p-3.5 rounded-xl space-y-3">
                  <div className="font-semibold text-purple-900 text-[11px] uppercase tracking-wider">
                    Hero Editorial Strip Images (3 Images)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ImageFieldWithPreview
                      label="Image 1 (Left Close-Up)"
                      value={section.data?.image1 || section.data?.bgImage || ''}
                      onChange={(val) => {
                        updateDataField('image1', val);
                        updateDataField('bgImage', val);
                      }}
                      onGallerySelect={(urls) => {
                        updateDataField('image1', urls[0] || '');
                        updateDataField('bgImage', urls[0] || '');
                      }}
                    />

                    <ImageFieldWithPreview
                      label="Image 2 (Center Main)"
                      value={section.data?.image2 || ''}
                      onChange={(val) => updateDataField('image2', val)}
                    />

                    <ImageFieldWithPreview
                      label="Image 3 (Right Detail)"
                      value={section.data?.image3 || ''}
                      onChange={(val) => updateDataField('image3', val)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Season Tag</label>
                    <Input
                      type="text"
                      value={section.data?.seasonTag || '(SS/26)'}
                      onChange={(e) => updateDataField('seasonTag', e.target.value)}
                      className="bg-gray-50 focus:bg-white focus:border-orange-500 rounded-md h-10"
                      placeholder="(SS/26)"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Copyright Text</label>
                    <Input
                      type="text"
                      value={section.data?.copyrightText || '©International - going distance 2026'}
                      onChange={(e) => updateDataField('copyrightText', e.target.value)}
                      className="bg-gray-50 focus:bg-white focus:border-orange-500 rounded-md h-10"
                      placeholder="©International..."
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">CTA Button Label</label>
                    <Input
                      type="text"
                      value={section.data?.ctaLabel || 'Scroll to begin'}
                      onChange={(e) => updateDataField('ctaLabel', e.target.value)}
                      className="bg-gray-50 focus:bg-white focus:border-orange-500 rounded-md h-10"
                      placeholder="e.g. Scroll to begin"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">CTA Button Link</label>
                    <Input
                      type="text"
                      value={section.data?.ctaLink || '#story'}
                      onChange={(e) => updateDataField('ctaLink', e.target.value)}
                      className="bg-gray-50 focus:bg-white focus:border-orange-500 rounded-md h-10"
                      placeholder="#story"
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

            {/* MISSION & VISION / STORY */}
            {section.type === 'missionVision' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                 <div className='col-span-2'>
                   <div>
                    <label className="block text-gray-700 font-medium mb-1">Tag (Top Header)</label>
                    <Input
                      type="text"
                      value={section.data?.tag || '// Our Story'}
                      onChange={(e) => updateDataField('tag', e.target.value)}
                      className="bg-gray-50 focus:bg-white focus:border-orange-500 rounded-md h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Meta Code (Footer)</label>
                    <Input
                      type="text"
                      value={section.data?.metaCode || 'PROJECT_STORY_V02'}
                      onChange={(e) => updateDataField('metaCode', e.target.value)}
                      className="bg-gray-50 focus:bg-white focus:border-orange-500 rounded-md h-10"
                    />
                  </div>
                 </div>
                  <ImageFieldWithPreview
                    label="Editorial Image URL"
                    value={section.data?.image || ''}
                    onChange={(val) => updateDataField('image', val)}
                  />
                </div>

                {/* Timeline items list */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-gray-700 font-medium">Timeline Milestones List</label>
                    <button
                      type="button"
                      onClick={() => {
                        const items = section.data?.items || [];
                        updateDataField('items', [
                          ...items,
                          { year: '2026', title: 'New Milestone', copy: 'Milestone description details...' },
                        ]);
                      }}
                      className="text-orange-600 hover:text-orange-700 font-semibold text-[11px] flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Timeline Item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(section.data?.items || []).map((item: any, tIdx: number) => (
                      <div key={tIdx} className="bg-white p-3 rounded-none border border-gray-200 shadow-sm space-y-2">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <Input
                            type="text"
                            value={item.year || ''}
                            onChange={(e) => {
                              const newItems = [...(section.data?.items || [])];
                              newItems[tIdx] = { ...newItems[tIdx], year: e.target.value };
                              updateDataField('items', newItems);
                            }}
                            className="h-9 w-full rounded-md bg-gray-50 px-2.5 text-xs font-bold text-orange-600 sm:w-24 focus:bg-white focus:border-orange-500"
                            placeholder="Year (2026)"
                          />
                          <Input
                            type="text"
                            value={item.title || ''}
                            onChange={(e) => {
                              const newItems = [...(section.data?.items || [])];
                              newItems[tIdx] = { ...newItems[tIdx], title: e.target.value };
                              updateDataField('items', newItems);
                            }}
                            className="h-9 min-w-0 flex-1 rounded-md bg-gray-50 px-2.5 text-xs font-semibold focus:bg-white focus:border-orange-500"
                            placeholder="Milestone Title"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newItems = (section.data?.items || []).filter((_: any, i: number) => i !== tIdx);
                              updateDataField('items', newItems);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={item.copy || item.description || ''}
                          onChange={(e) => {
                            const newItems = [...(section.data?.items || [])];
                            newItems[tIdx] = { ...newItems[tIdx], copy: e.target.value, description: e.target.value };
                            updateDataField('items', newItems);
                          }}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-none text-xs"
                          placeholder="Milestone description..."
                        />
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
                  <Input
                    type="email"
                    value={section.data?.email || ''}
                    onChange={(e) => updateDataField('email', e.target.value)}
                    className="bg-gray-50 focus:bg-white focus:border-orange-500 rounded-md h-10"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Phone Number</label>
                  <Input
                    type="text"
                    value={section.data?.phone || ''}
                    onChange={(e) => updateDataField('phone', e.target.value)}
                    className="bg-gray-50 focus:bg-white focus:border-orange-500 rounded-md h-10"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Physical Address</label>
                  <Input
                    type="text"
                    value={section.data?.address || ''}
                    onChange={(e) => updateDataField('address', e.target.value)}
                    className="bg-gray-50 focus:bg-white focus:border-orange-500 rounded-md h-10"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Support Hours</label>
                  <Input
                    type="text"
                    value={section.data?.workingHours || ''}
                    onChange={(e) => updateDataField('workingHours', e.target.value)}
                    className="bg-gray-50 focus:bg-white focus:border-orange-500 rounded-md h-10"
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-2 pt-1">
                  <Switch
                    id={`contact-form-${section.id}`}
                    checked={section.data?.showContactForm ?? true}
                    onCheckedChange={(checked) => updateDataField('showContactForm', checked)}
                    size="sm"
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
                    <div key={cIdx} className="bg-white p-3 rounded-none border border-gray-200 shadow-sm space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Input
                          type="text"
                          value={clause.title || ''}
                          onChange={(e) => {
                            const newClauses = [...(section.data?.clauses || [])];
                            newClauses[cIdx] = { ...newClauses[cIdx], title: e.target.value };
                            updateDataField('clauses', newClauses);
                          }}
                          className="h-9 flex-1 rounded-md bg-gray-50 px-2.5 text-xs font-semibold focus:bg-white focus:border-orange-500"
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
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-none text-xs"
                        placeholder="Clause details..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FEATURES GRID / CRAFT VALUES */}
            {section.type === 'featuresGrid' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Tag (Top Left Header)</label>
                  <Input
                    type="text"
                    value={section.data?.tag || '// The Craft'}
                    onChange={(e) => updateDataField('tag', e.target.value)}
                    className="bg-gray-50 focus:bg-white focus:border-orange-500 rounded-md h-10"
                    placeholder="// The Craft"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="block text-gray-700 font-medium">Feature Cards / Craft Values</label>
                  <button
                    type="button"
                    onClick={() => {
                      const items = section.data?.items || [];
                      updateDataField('items', [
                        ...items,
                        { icon: 'auto_awesome', title: 'New Feature', copy: 'Feature description details...', tag: `CRAFT_0${items.length + 1}` },
                      ]);
                    }}
                    className="text-orange-600 hover:text-orange-700 font-semibold text-[11px] flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Feature Card
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(section.data?.items || []).map((item: any, fIdx: number) => (
                    <div key={fIdx} className="bg-white p-3 rounded-none border border-gray-200 shadow-sm space-y-2">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <Input
                          type="text"
                          value={item.title || ''}
                          onChange={(e) => {
                            const newItems = [...(section.data?.items || [])];
                            newItems[fIdx] = { ...newItems[fIdx], title: e.target.value };
                            updateDataField('items', newItems);
                          }}
                          className="h-9 min-w-0 flex-1 rounded-md bg-gray-50 px-2.5 text-xs font-semibold focus:bg-white focus:border-orange-500"
                          placeholder="Feature Title"
                        />
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            value={item.tag || ''}
                            onChange={(e) => {
                              const newItems = [...(section.data?.items || [])];
                              newItems[fIdx] = { ...newItems[fIdx], tag: e.target.value };
                              updateDataField('items', newItems);
                            }}
                            className="h-9 w-24 rounded-md bg-gray-50 px-2.5 font-mono text-xs focus:bg-white focus:border-orange-500"
                            placeholder="CRAFT_01"
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
                      </div>
                      <Input
                        type="text"
                        value={item.icon || 'auto_awesome'}
                        onChange={(e) => {
                          const newItems = [...(section.data?.items || [])];
                          newItems[fIdx] = { ...newItems[fIdx], icon: e.target.value };
                          updateDataField('items', newItems);
                        }}
                        className="h-9 w-full rounded-md bg-gray-50 px-2.5 text-xs focus:bg-white focus:border-orange-500"
                        placeholder="Material Symbol / Icon Name (e.g. auto_awesome, recycling, handshake, inventory_2)"
                      />
                      <textarea
                        rows={2}
                        value={item.copy || item.description || ''}
                        onChange={(e) => {
                          const newItems = [...(section.data?.items || [])];
                          newItems[fIdx] = { ...newItems[fIdx], copy: e.target.value, description: e.target.value };
                          updateDataField('items', newItems);
                        }}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-none text-xs"
                        placeholder="Feature Description"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STATS SECTION */}
            {section.type === 'stats' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-gray-700 font-medium">Statistics Counter Items</label>
                  <button
                    type="button"
                    onClick={() => {
                      const items = section.data?.items || [];
                      updateDataField('items', [
                        ...items,
                        { value: 100, suffix: 'K', label: 'Happy Customers' },
                      ]);
                    }}
                    className="text-orange-600 hover:text-orange-700 font-semibold text-[11px] flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Stat Item
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(section.data?.items || []).map((stat: any, sIdx: number) => (
                    <div key={sIdx} className="bg-white p-3 rounded-none border border-gray-200 shadow-sm space-y-2">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <Input
                          type="number"
                          value={stat.value ?? 0}
                          onChange={(e) => {
                            const newItems = [...(section.data?.items || [])];
                            newItems[sIdx] = { ...newItems[sIdx], value: Number(e.target.value) };
                            updateDataField('items', newItems);
                          }}
                          className="h-9 w-full rounded-md bg-gray-50 px-2.5 text-xs font-bold sm:w-20 focus:bg-white focus:border-orange-500"
                          placeholder="Value"
                        />
                        <Input
                          type="text"
                          value={stat.suffix || ''}
                          onChange={(e) => {
                            const newItems = [...(section.data?.items || [])];
                            newItems[sIdx] = { ...newItems[sIdx], suffix: e.target.value };
                            updateDataField('items', newItems);
                          }}
                          className="h-9 w-full rounded-md bg-gray-50 px-2.5 text-xs font-semibold sm:w-16 focus:bg-white focus:border-orange-500"
                          placeholder="Suffix (K)"
                        />
                        <Input
                          type="text"
                          value={stat.label || ''}
                          onChange={(e) => {
                            const newItems = [...(section.data?.items || [])];
                            newItems[sIdx] = { ...newItems[sIdx], label: e.target.value };
                            updateDataField('items', newItems);
                          }}
                          className="h-9 min-w-0 flex-1 rounded-md bg-gray-50 px-2.5 text-xs focus:bg-white focus:border-orange-500"
                          placeholder="Stat Label"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = (section.data?.items || []).filter((_: any, i: number) => i !== sIdx);
                            updateDataField('items', newItems);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-3 space-y-3">
                  <div className="font-semibold text-gray-800 text-[11px] uppercase tracking-wider">
                    Call To Action Banner Settings
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">CTA Button Label</label>
                      <Input
                        type="text"
                        value={section.data?.ctaLabel || 'Explore the edit'}
                        onChange={(e) => updateDataField('ctaLabel', e.target.value)}
                        className="bg-gray-50 focus:bg-white focus:border-orange-500 rounded-md h-10"
                        placeholder="Explore the edit"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">CTA Button Link</label>
                      <Input
                        type="text"
                        value={section.data?.ctaLink || '/products'}
                        onChange={(e) => updateDataField('ctaLink', e.target.value)}
                        className="bg-gray-50 focus:bg-white focus:border-orange-500 rounded-md h-10"
                        placeholder="/products"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ SECTION */}
            {section.type === 'faq' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Tag (Top Header)</label>
                    <Input
                      type="text"
                      value={section.data?.tag || '// FAQ'}
                      onChange={(e) => updateDataField('tag', e.target.value)}
                      className="bg-gray-50 focus:bg-white focus:border-orange-500 rounded-md h-10"
                      placeholder="// FAQ"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Meta Code (Footer)</label>
                    <Input
                      type="text"
                      value={section.data?.metaCode || 'PROJECT_SUPPORT_V01'}
                      onChange={(e) => updateDataField('metaCode', e.target.value)}
                      className="bg-gray-50 focus:bg-white focus:border-orange-500 rounded-md h-10"
                      placeholder="PROJECT_SUPPORT_V01"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="block text-gray-700 font-medium">FAQ Questions & Answers</label>
                  <button
                    type="button"
                    onClick={() => {
                      const items = section.data?.items || [];
                      updateDataField('items', [
                        ...items,
                        { q: 'What is your question?', a: 'Answer details here.' },
                      ]);
                    }}
                    className="text-orange-600 hover:text-orange-700 font-semibold text-[11px] flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add FAQ Item
                  </button>
                </div>
                <div className="space-y-2">
                  {(section.data?.items || []).map((faq: any, qIdx: number) => (
                    <div key={qIdx} className="bg-white p-3 rounded-none border border-gray-200 shadow-sm space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Input
                          type="text"
                          value={faq.q || faq.question || ''}
                          onChange={(e) => {
                            const newItems = [...(section.data?.items || [])];
                            newItems[qIdx] = { ...newItems[qIdx], q: e.target.value, question: e.target.value };
                            updateDataField('items', newItems);
                          }}
                          className="h-9 flex-1 rounded-md bg-gray-50 px-2.5 text-xs font-semibold focus:bg-white focus:border-orange-500"
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
                        value={faq.a || faq.answer || ''}
                        onChange={(e) => {
                          const newItems = [...(section.data?.items || [])];
                          newItems[qIdx] = { ...newItems[qIdx], a: e.target.value, answer: e.target.value };
                          updateDataField('items', newItems);
                        }}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-none text-xs"
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
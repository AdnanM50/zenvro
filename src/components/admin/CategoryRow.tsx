'use client';

import {
  Plus,
  ChevronDown,
  ChevronRight,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  FolderTree,
} from 'lucide-react';
import type { Category } from '@/types';

interface CategoryRowProps {
  category: Category;
  children: Category[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onAddChild: (parentId: string) => void;
  columns?: ('children' | 'seo' | 'status' | 'created' | 'actions')[];
}

export default function CategoryRow({
  category,
  children,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleActive,
  onAddChild,
  columns = ['children', 'seo', 'status', 'created', 'actions'],
}: CategoryRowProps) {
  return (
    <>
      <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {children.length > 0 ? (
              <button onClick={onToggleExpand} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-700 dark:text-gray-300">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <span className="w-6" />
            )}
            {category.image ? (
              <img src={category.image} alt={category.name} className="w-8 h-8 rounded-lg object-cover bg-gray-100 dark:bg-gray-800" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                <FolderTree className="h-4 w-4" />
              </div>
            )}
            <div>
              <div className="font-medium text-gray-900 dark:text-white">{category.name}</div>
              <div className="text-[11px] text-gray-400 dark:text-gray-500">{children.length} subcategories</div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs font-mono">{category.slug}</td>
        {columns.includes('children') && (
          <td className="px-4 py-3">
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full font-medium">{children.length}</span>
          </td>
        )}
        {columns.includes('seo') && (
          <td className="px-4 py-3">
            {category.seo?.title ? (
              <span className="bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs px-2 py-1 rounded-full font-medium border border-blue-200 dark:border-blue-900">Configured</span>
            ) : (
              <span className="text-gray-400 dark:text-gray-500 text-xs">—</span>
            )}
          </td>
        )}
        {columns.includes('status') && (
          <td className="px-4 py-3">
            <button
              onClick={() => onToggleActive(category._id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                category.isActive ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {category.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              {category.isActive ? 'Active' : 'Inactive'}
            </button>
          </td>
        )}
        {columns.includes('created') && (
          <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
            {new Date(category.createdAt).toLocaleDateString()}
          </td>
        )}
        {columns.includes('actions') && (
          <td className="px-4 py-3">
            <div className="flex items-center justify-end gap-1">
              <button onClick={() => onAddChild(category._id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" title="Add subcategory">
                <Plus className="h-4 w-4" />
              </button>
              <button onClick={() => onEdit(category)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" title="Edit">
                <Edit3 className="h-4 w-4" />
              </button>
              <button onClick={() => onDelete(category._id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </td>
        )}
      </tr>
      {isExpanded && children.map((child) => (
        <tr key={child._id} className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 hover:bg-gray-100/50 dark:hover:bg-gray-800/60 transition-colors">
          <td className="px-4 py-3 pl-12">
            <div className="flex items-center gap-2">
              {child.image ? (
                <img src={child.image} alt={child.name} className="w-6 h-6 rounded-md object-cover bg-gray-100 dark:bg-gray-800" />
              ) : (
                <div className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                  <FolderTree className="h-3 w-3" />
                </div>
              )}
              <div>
                <div className="font-medium text-gray-800 dark:text-gray-200 text-xs">{child.name}</div>
              </div>
            </div>
          </td>
          <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs font-mono">{child.slug}</td>
          {columns.includes('children') && (
            <td className="px-4 py-3">
              <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
            </td>
          )}
          {columns.includes('seo') && (
            <td className="px-4 py-3">
              {child.seo?.title ? (
                <span className="bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-[11px] px-2 py-0.5 rounded-full font-medium">Configured</span>
              ) : (
                <span className="text-gray-400 dark:text-gray-500 text-xs">—</span>
              )}
            </td>
          )}
          {columns.includes('status') && (
            <td className="px-4 py-3">
              <button
                onClick={() => onToggleActive(child._id)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                  child.isActive ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}
              >
                {child.isActive ? 'Active' : 'Inactive'}
              </button>
            </td>
          )}
          {columns.includes('created') && (
            <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs whitespace-nowrap">
              {new Date(child.createdAt).toLocaleDateString()}
            </td>
          )}
          {columns.includes('actions') && (
            <td className="px-4 py-3">
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => onEdit(child)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" title="Edit">
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => onDelete(child._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </td>
          )}
        </tr>
      ))}
    </>
  );
}

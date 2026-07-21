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
      <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {children.length > 0 ? (
              <button onClick={onToggleExpand} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <span className="w-6" />
            )}
            {category.image ? (
              <img src={category.image} alt={category.name} className="w-8 h-8 rounded-lg object-cover bg-gray-100" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                <FolderTree className="h-4 w-4" />
              </div>
            )}
            <div>
              <div className="font-medium text-gray-900">{category.name}</div>
              <div className="text-[11px] text-gray-400">{children.length} subcategories</div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-gray-500 text-xs font-mono">{category.slug}</td>
        {columns.includes('children') && (
          <td className="px-4 py-3">
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">{children.length}</span>
          </td>
        )}
        {columns.includes('seo') && (
          <td className="px-4 py-3">
            {category.seo?.title ? (
              <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">Configured</span>
            ) : (
              <span className="text-gray-400 text-xs">—</span>
            )}
          </td>
        )}
        {columns.includes('status') && (
          <td className="px-4 py-3">
            <button
              onClick={() => onToggleActive(category._id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                category.isActive ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {category.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              {category.isActive ? 'Active' : 'Inactive'}
            </button>
          </td>
        )}
        {columns.includes('created') && (
          <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
            {new Date(category.createdAt).toLocaleDateString()}
          </td>
        )}
        {columns.includes('actions') && (
          <td className="px-4 py-3">
            <div className="flex items-center justify-end gap-1">
              <button onClick={() => onAddChild(category._id)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors" title="Add subcategory">
                <Plus className="h-4 w-4" />
              </button>
              <button onClick={() => onEdit(category)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors" title="Edit">
                <Edit3 className="h-4 w-4" />
              </button>
              <button onClick={() => onDelete(category._id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </td>
        )}
      </tr>
      {isExpanded && children.map((child) => (
        <tr key={child._id} className="border-b border-gray-50 bg-gray-50/30 hover:bg-gray-100/50 transition-colors">
          <td className="px-4 py-3 pl-12">
            <div className="flex items-center gap-2">
              {child.image ? (
                <img src={child.image} alt={child.name} className="w-6 h-6 rounded-md object-cover bg-gray-100" />
              ) : (
                <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
                  <FolderTree className="h-3 w-3" />
                </div>
              )}
              <span className="font-medium text-gray-700 text-sm">{child.name}</span>
            </div>
          </td>
          <td className="px-4 py-3 text-gray-500 text-xs font-mono">{child.slug}</td>
          {columns.includes('children') && <td className="px-4 py-3"><span className="text-gray-400 text-xs">—</span></td>}
          {columns.includes('seo') && (
            <td className="px-4 py-3">
              {child.seo?.title ? (
                <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">Configured</span>
              ) : (
                <span className="text-gray-400 text-xs">—</span>
              )}
            </td>
          )}
          {columns.includes('status') && (
            <td className="px-4 py-3">
              <span className={`text-xs font-medium ${child.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                {child.isActive ? 'Active' : 'Inactive'}
              </span>
            </td>
          )}
          {columns.includes('created') && (
            <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
              {new Date(child.createdAt).toLocaleDateString()}
            </td>
          )}
          {columns.includes('actions') && (
            <td className="px-4 py-3">
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => onEdit(child)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button onClick={() => onDelete(child._id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </td>
          )}
        </tr>
      ))}
    </>
  );
}

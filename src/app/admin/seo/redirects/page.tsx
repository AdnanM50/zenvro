'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Save, RefreshCw, Trash2, ArrowRight, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

interface Redirect {
  _id: string;
  from: string;
  to: string;
  type: number;
  hits: number;
  isActive: boolean;
  createdAt: string;
}

export default function RedirectsPage() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // New redirect form
  const [showForm, setShowForm] = useState(false);
  const [formFrom, setFormFrom] = useState('');
  const [formTo, setFormTo] = useState('');
  const [formType, setFormType] = useState<number>(301);
  const [formSaving, setFormSaving] = useState(false);

  const fetchRedirects = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/seo/redirects?${params}`, { credentials: 'include' });
      const json = await res.json();
      if (json.success) {
        setRedirects(json.data);
        setTotal(json.meta?.total || 0);
      }
    } catch {
      toast.error('Failed to load redirects');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchRedirects(); }, [fetchRedirects]);

  const handleCreate = async () => {
    if (!formFrom.trim() || !formTo.trim()) {
      toast.error('Both "from" and "to" paths are required');
      return;
    }
    setFormSaving(true);
    try {
      const res = await fetch('/api/admin/seo/redirects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ from: formFrom.trim(), to: formTo.trim(), type: formType }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Redirect created');
        setFormFrom('');
        setFormTo('');
        setFormType(301);
        setShowForm(false);
        fetchRedirects();
      } else {
        toast.error(json.error || 'Failed to create');
      }
    } catch {
      toast.error('Failed to create redirect');
    } finally {
      setFormSaving(false);
    }
  };

  const handleToggle = async (r: Redirect) => {
    try {
      const res = await fetch('/api/admin/seo/redirects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ _id: r._id, isActive: !r.isActive }),
      });
      const json = await res.json();
      if (json.success) {
        setRedirects((prev) => prev.map((rd) => rd._id === r._id ? { ...rd, isActive: !rd.isActive } : rd));
      }
    } catch {
      toast.error('Failed to toggle');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this redirect?')) return;
    try {
      const res = await fetch(`/api/admin/seo/redirects?_id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Redirect deleted');
        fetchRedirects();
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const totalPages = Math.ceil(total / 20) || 1;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Redirects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{total} redirect{total !== 1 ? 's' : ''} configured</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Add Redirect
        </button>
      </div>

      {/* New Redirect Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">New Redirect</h3>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto_auto] gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
              <Input value={formFrom} onChange={(e) => setFormFrom(e.target.value)} placeholder="/old-page" />
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 hidden sm:block mb-2.5" />
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
              <Input value={formTo} onChange={(e) => setFormTo(e.target.value)} placeholder="/new-page" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(Number(e.target.value))}
                className="h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white"
              >
                <option value={301}>301</option>
                <option value={302}>302</option>
                <option value={307}>307</option>
                <option value={308}>308</option>
              </select>
            </div>
            <button
              onClick={handleCreate}
              disabled={formSaving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" /> {formSaving ? '...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search redirects..."
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">From</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">To</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hits</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {redirects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">No redirects found</td>
                </tr>
              ) : (
                redirects.map((r) => (
                  <tr key={r._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-gray-700 dark:text-gray-300 max-w-[200px] truncate">{r.from}</td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-700 dark:text-gray-300 max-w-[200px] truncate">{r.to}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${r.type === 301 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center text-xs text-gray-500">{r.hits}</td>
                    <td className="px-3 py-3 text-center">
                      <button onClick={() => handleToggle(r)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        {r.isActive ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5" />}
                      </button>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button onClick={() => handleDelete(r._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium disabled:opacity-40">Prev</button>
          <span className="text-xs text-gray-500">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}

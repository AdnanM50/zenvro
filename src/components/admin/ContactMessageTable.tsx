'use client';

import React, { useState } from 'react';
import {
  Mail,
  MailOpen,
  Send,
  Trash2,
  CheckCircle2,
  MessageSquare,
  UserRound,
  ShieldAlert,
  Inbox,
  InboxIcon,
} from 'lucide-react';
import type { ContactMessage, ContactMessageStatus } from '@/types';
import {
  useGetContactMessages,
  useGetContactMessageStats,
  useUpdateContactMessage,
  useDeleteContactMessage,
} from '@/hooks';
import DataTable, { ColumnDef } from '@/app/admin/_components/common/DataTable';
import Modal from '@/app/admin/_components/common/Modal';
import ConfirmDialog from '@/app/admin/_components/common/ConfirmDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function formatDate(value: Date | string | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ContactMessageTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ContactMessageStatus>('all');

  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: messagesResponse, isLoading } = useGetContactMessages({
    page,
    limit,
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const { data: statsResponse } = useGetContactMessageStats();

  const messages = messagesResponse?.data || [];
  const meta = messagesResponse?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const stats = statsResponse?.data || { total: 0, new: 0, answered: 0, registered: 0, guest: 0 };

  const updateMutation = useUpdateContactMessage();
  const deleteMutation = useDeleteContactMessage();

  const openAnswerModal = (message: ContactMessage) => {
    setActiveMessage(message);
    setReplyText(message.reply || '');
  };

  const closeAnswerModal = () => {
    setActiveMessage(null);
    setReplyText('');
  };

  const handleSendReply = () => {
    if (!activeMessage) return;
    if (!replyText.trim()) return;
    updateMutation.mutate(
      { _id: activeMessage._id, reply: replyText.trim() },
      { onSettled: closeAnswerModal }
    );
  };

  const handleMarkAnswered = () => {
    if (!activeMessage) return;
    updateMutation.mutate(
      { _id: activeMessage._id, status: 'answered' },
      { onSettled: closeAnswerModal }
    );
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const statusBadge = (status: ContactMessageStatus) => (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
        status === 'new'
          ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/60 dark:text-orange-400 dark:border-orange-800'
          : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/60 dark:text-green-400 dark:border-green-800'
      }`}
    >
      {status === 'new' ? <Mail className="h-3 w-3" /> : <MailOpen className="h-3 w-3" />}
      {status === 'new' ? 'New' : 'Answered'}
    </span>
  );

  const sourceBadge = (isRegistered: boolean) => (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
        isRegistered
          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800'
          : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
      }`}
    >
      {isRegistered ? <UserRound className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
      {isRegistered ? 'Registered' : 'Guest'}
    </span>
  );

  const columns: ColumnDef<ContactMessage>[] = [
    {
      key: 'visitor',
      header: 'Visitor',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-sm shrink-0 border ${
              item.isRegistered
                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
            }`}
          >
            {item.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-gray-900 dark:text-white truncate">{item.name}</div>
            <a
              href={`mailto:${item.email}`}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 truncate block"
            >
              {item.email}
            </a>
          </div>
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      render: (item) => (
        <p className="font-semibold text-gray-800 dark:text-gray-200 max-w-[220px] truncate">
          {item.subject || 'No subject'}
        </p>
      ),
    },
    {
      key: 'message',
      header: 'Message',
      render: (item) => (
        <p className="text-xs text-gray-600 dark:text-gray-300 max-w-md line-clamp-2">{item.message}</p>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      render: (item) => sourceBadge(item.isRegistered),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => statusBadge(item.status),
    },
    {
      key: 'createdAt',
      header: 'Received',
      render: (item) => <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(item.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openAnswerModal(item)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors"
            title={item.status === 'answered' ? 'View / Re-reply' : 'View & Answer'}
          >
            {item.status === 'answered' ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
          </button>
          {item.status === 'new' && (
            <button
              onClick={() =>
                updateMutation.mutate({ _id: item._id, status: 'answered' })
              }
              disabled={updateMutation.isPending}
              className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/40 transition-colors"
              title="Mark as answered"
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setDeleteTarget(item._id)}
            disabled={deleteMutation.isPending}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            title="Delete message"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const statCards = [
    { label: 'Total Messages', value: stats.total, icon: Inbox, color: 'text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800' },
    { label: 'New / Unanswered', value: stats.new, icon: Mail, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/60' },
    { label: 'Answered', value: stats.answered, icon: MailOpen, color: 'text-green-600 bg-green-50 dark:bg-green-950/60' },
    { label: 'Unauthorized (Guests)', value: stats.guest, icon: ShieldAlert, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            Contact Inbox
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            See every visitor who reached out — including unauthorized (guest) users — and answer them directly by email.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-3 shadow-sm"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                  {card.value}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Input
          type="text"
          placeholder="Search by name, email, subject, or message..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-md"
        />
        <div className="flex items-center gap-1.5 flex-wrap">
          {(
            [
              { value: 'all', label: 'All' },
              { value: 'new', label: 'New' },
              { value: 'answered', label: 'Answered' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setStatusFilter(opt.value);
                setPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                statusFilter === opt.value
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={messages}
        keyExtractor={(item) => item._id}
        loading={isLoading}
        emptyMessage="No contact messages found."
        emptyIcon={<InboxIcon className="h-10 w-10 mb-2 opacity-50" />}
        pagination={{
          page: meta.page,
          limit: meta.limit,
          total: meta.total,
          totalPages: meta.totalPages,
          onPageChange: setPage,
          onLimitChange: (l) => {
            setLimit(l);
            setPage(1);
          },
        }}
      />

      {/* View / Answer Modal */}
      <Modal
        isOpen={!!activeMessage}
        onClose={closeAnswerModal}
        title={activeMessage?.status === 'answered' ? 'View & Reply' : 'Answer Message'}
        maxWidth="3xl"
      >
        {activeMessage && (
          <div className="space-y-5">
            {/* Message Meta */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center text-sm shrink-0">
                  {activeMessage.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{activeMessage.name}</div>
                  <a
                    href={`mailto:${activeMessage.email}`}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {activeMessage.email}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {statusBadge(activeMessage.status)}
                {sourceBadge(activeMessage.isRegistered)}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3">
                <span className="text-gray-400 font-semibold block mb-1">Subject</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {activeMessage.subject || 'No subject'}
                </span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3">
                <span className="text-gray-400 font-semibold block mb-1">Received</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {formatDate(activeMessage.createdAt)}
                </span>
              </div>
            </div>

            {/* Original Message */}
            <div className="bg-orange-50/60 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900 rounded-xl p-4">
              <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block mb-2">
                Original Message
              </span>
              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                {activeMessage.message}
              </p>
            </div>

            {/* Reply */}
            <div>
              <Label htmlFor="reply">Your Reply (sent by email)</Label>
              <Textarea
                id="reply"
                rows={5}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here — it will be emailed to the visitor and the message marked as answered."
                className="mt-1.5"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={handleMarkAnswered}
                disabled={updateMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark as Answered
              </button>
              <button
                type="button"
                onClick={handleSendReply}
                disabled={updateMutation.isPending || !replyText.trim()}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                {updateMutation.isPending ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {activeMessage.reply ? 'Send Reply Again' : 'Send Reply'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        description="Are you sure you want to delete this contact message? This action cannot be undone."
      />
    </div>
  );
}

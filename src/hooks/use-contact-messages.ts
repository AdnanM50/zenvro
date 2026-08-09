// ---------------------------------------------------------------------------
// useContactMessage Hooks — TanStack React Query v5 hooks over the contact service
// ---------------------------------------------------------------------------

import { useQueryClient } from '@tanstack/react-query';

import type {
  ContactMessage,
  ContactMessageStats,
  CreateContactMessagePayload,
  ContactMessageListParams,
  UpdateContactMessagePayload,
} from '@/types';
import { useApiGet, useApiPost, useApiPatch, useApiDelete, createQueryKeys } from './use-api';
import {
  getContactMessages,
  getContactMessageStats,
  createContactMessage,
  updateContactMessage,
  deleteContactMessage,
} from '@/services/contact-message.service';

export const contactKeys = createQueryKeys('admin-contact-messages');

export function useGetContactMessages(params: ContactMessageListParams = {}) {
  return useApiGet<ContactMessage[]>({
    queryKey: contactKeys.list(params as Record<string, unknown>),
    queryFn: () => getContactMessages(params),
  });
}

export function useGetContactMessageStats() {
  return useApiGet<ContactMessageStats>({
    queryKey: [contactKeys.all, 'stats'] as const,
    queryFn: () => getContactMessageStats(),
  });
}

export function useCreateContactMessage() {
  return useApiPost<ContactMessage, CreateContactMessagePayload>({
    mutationFn: createContactMessage,
    invalidateKeys: [contactKeys.all, contactKeys.lists()],
    successMessage: 'Message sent — we will get back to you within one working day.',
  });
}

export function useUpdateContactMessage() {
  const queryClient = useQueryClient();
  return useApiPatch<ContactMessage, UpdateContactMessagePayload>({
    mutationFn: updateContactMessage,
    invalidateKeys: [contactKeys.all, contactKeys.lists()],
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [contactKeys.all, 'stats'] });
      },
    },
  });
}

export function useDeleteContactMessage() {
  const queryClient = useQueryClient();
  return useApiDelete<string>({
    mutationFn: deleteContactMessage,
    invalidateKeys: [contactKeys.all, contactKeys.lists()],
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [contactKeys.all, 'stats'] });
      },
    },
  });
}

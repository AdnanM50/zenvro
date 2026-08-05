// ---------------------------------------------------------------------------
// useUser Hooks — TanStack React Query v5 hooks over the admin users service
// ---------------------------------------------------------------------------

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';

import type { PublicUser, UserListParams, ApiSuccessResponse } from '@/types';
import { ApiError } from '@/types';

import * as userApi from '@/services/user.service';
import type { UserStats } from '@/services/user.service';

export const userKeys = {
  all: ['admin-users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: UserListParams) => [...userKeys.lists(), params] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
} as const;

const STALE_TIME = 5 * 60 * 1000;

interface UseGetUsersParams {
  params?: UserListParams;
  options?: Partial<
    Omit<
      UseQueryOptions<ApiSuccessResponse<PublicUser[]>, ApiError>,
      'queryKey' | 'queryFn'
    >
  >;
}

export function useGetUsers({ params = {}, options }: UseGetUsersParams = {}) {
  return useQuery<ApiSuccessResponse<PublicUser[]>, ApiError>({
    queryKey: userKeys.list(params),
    queryFn: () => userApi.getUsers(params),
    staleTime: STALE_TIME,
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

interface UseGetUserStatsParams {
  options?: Partial<
    Omit<
      UseQueryOptions<ApiSuccessResponse<UserStats>, ApiError>,
      'queryKey' | 'queryFn'
    >
  >;
}

export function useGetUserStats({ options }: UseGetUserStatsParams = {}) {
  return useQuery<ApiSuccessResponse<UserStats>, ApiError>({
    queryKey: userKeys.stats(),
    queryFn: () => userApi.getUserStats(),
    staleTime: STALE_TIME,
    ...options,
  });
}

// ── useUpdateUserRole ──────────────────────────────────────────────────────

export function useUpdateUserRole({
  options,
}: {
  options?: Partial<
    Omit<
      UseMutationOptions<
        ApiSuccessResponse<null>,
        ApiError,
        { userId: string; role: 'admin' | 'user' }
      >,
      'mutationFn'
    >
  >;
} = {}) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiSuccessResponse<null>,
    ApiError,
    { userId: string; role: 'admin' | 'user' }
  >({
    mutationFn: (payload) => userApi.updateUserRole(payload),

    onSuccess: (response, variables, onMutateResult, fnContext) => {
      toast.success(response.message || 'User role updated');
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      options?.onSuccess?.(response, variables, onMutateResult, fnContext);
    },

    onError: (error, variables, onMutateResult, fnContext) => {
      toast.error(error.serverMessage || 'Failed to update user role');
      options?.onError?.(error, variables, onMutateResult, fnContext);
    },

    ...options,
  });
}

// ── useUpdateUserStatus ────────────────────────────────────────────────────

export function useUpdateUserStatus({
  options,
}: {
  options?: Partial<
    Omit<
      UseMutationOptions<
        ApiSuccessResponse<null>,
        ApiError,
        { userId: string; status: 'active' | 'inactive' | 'blocked' }
      >,
      'mutationFn'
    >
  >;
} = {}) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiSuccessResponse<null>,
    ApiError,
    { userId: string; status: 'active' | 'inactive' | 'blocked' }
  >({
    mutationFn: (payload) => userApi.updateUserStatus(payload),

    onSuccess: (response, variables, onMutateResult, fnContext) => {
      toast.success(response.message || 'User status updated');
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      options?.onSuccess?.(response, variables, onMutateResult, fnContext);
    },

    onError: (error, variables, onMutateResult, fnContext) => {
      toast.error(error.serverMessage || 'Failed to update user status');
      options?.onError?.(error, variables, onMutateResult, fnContext);
    },

    ...options,
  });
}

// ── useDeleteUser ──────────────────────────────────────────────────────────

export function useDeleteUser({
  options,
}: {
  options?: Partial<
    Omit<
      UseMutationOptions<ApiSuccessResponse<null>, ApiError, string>,
      'mutationFn'
    >
  >;
} = {}) {
  const queryClient = useQueryClient();

  return useMutation<ApiSuccessResponse<null>, ApiError, string>({
    mutationFn: (userId) => userApi.deleteUser(userId),

    onSuccess: (response, variables, onMutateResult, fnContext) => {
      toast.success(response.message || 'User deleted');
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      options?.onSuccess?.(response, variables, onMutateResult, fnContext);
    },

    onError: (error, variables, onMutateResult, fnContext) => {
      toast.error(error.serverMessage || 'Failed to delete user');
      options?.onError?.(error, variables, onMutateResult, fnContext);
    },

    ...options,
  });
}

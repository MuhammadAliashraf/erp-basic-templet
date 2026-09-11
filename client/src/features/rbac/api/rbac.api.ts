import { API_TAGS, apiSlice, providesList } from '@/lib/api';
import type { ListQueryParams, PaginatedResponse } from '@/types/api';

import type {
  AccessPolicy,
  PermissionDefinition,
  PermissionQueryParams,
  PermissionWritePayload,
  Role,
  RoleWritePayload,
} from '../model/rbac.types';

/**
 * RBAC endpoints, injected into the root API slice.
 *
 * Invalidation is the interesting part: any change to a role or to the
 * catalogue also invalidates `AccessPolicy`, because an administrator editing
 * their own role must see their own menus and buttons update immediately rather
 * than after a reload.
 */
export const rbacApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    /* ---------------------------------------------------------------- Policy */

    /**
     * The effective policy for the signed-in user.
     *
     * This is the single source of every grant in the client. Nothing about
     * what the current user may do is compiled into the bundle.
     */
    getAccessPolicy: build.query<AccessPolicy, void>({
      query: () => ({ url: '/rbac/me/policy' }),
      providesTags: [API_TAGS.AccessPolicy],
      // Authorisation is worth a round trip on remount; a stale policy shows
      // controls the server will refuse.
      keepUnusedDataFor: 300,
    }),

    /* ----------------------------------------------------------------- Roles */

    getRoles: build.query<PaginatedResponse<Role>, ListQueryParams>({
      query: (params) => ({ url: '/rbac/roles', params }),
      providesTags: (result) => providesList(result?.data, API_TAGS.Role),
    }),

    /** Unpaginated list, for assignment pickers and the access matrix. */
    getAllRoles: build.query<Role[], void>({
      query: () => ({ url: '/rbac/roles', params: { pageSize: 200 } }),
      transformResponse: (response: PaginatedResponse<Role> | Role[]) =>
        Array.isArray(response) ? response : response.data,
      providesTags: (result) => providesList(result, API_TAGS.Role),
    }),

    getRole: build.query<Role, string>({
      query: (id) => ({ url: `/rbac/roles/${id}` }),
      providesTags: (_result, _error, id) => [{ type: API_TAGS.Role, id }],
    }),

    createRole: build.mutation<Role, RoleWritePayload>({
      query: (body) => ({ url: '/rbac/roles', method: 'POST', body }),
      invalidatesTags: [{ type: API_TAGS.Role, id: 'LIST' }, API_TAGS.AccessPolicy],
    }),

    updateRole: build.mutation<Role, { id: string; changes: Partial<RoleWritePayload> }>({
      query: ({ id, changes }) => ({ url: `/rbac/roles/${id}`, method: 'PATCH', body: changes }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.Role, id },
        { type: API_TAGS.Role, id: 'LIST' },
        API_TAGS.AccessPolicy,
      ],
    }),

    /** Replaces a role's grants wholesale — the matrix always sends the full set. */
    updateRolePermissions: build.mutation<
      Role,
      { id: string; permissions: string[]; deniedPermissions?: string[] }
    >({
      query: ({ id, ...body }) => ({
        url: `/rbac/roles/${id}/permissions`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.Role, id },
        { type: API_TAGS.Role, id: 'LIST' },
        API_TAGS.AccessPolicy,
      ],
    }),

    deleteRole: build.mutation<void, string>({
      query: (id) => ({ url: `/rbac/roles/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: API_TAGS.Role, id },
        { type: API_TAGS.Role, id: 'LIST' },
        API_TAGS.AccessPolicy,
      ],
    }),

    /* ----------------------------------------------------------- Permissions */

    /**
     * The permission catalogue.
     *
     * Returned in full rather than paginated: the assignment matrix needs every
     * definition at once, and a catalogue is a few hundred rows at most.
     */
    getPermissions: build.query<PermissionDefinition[], PermissionQueryParams | void>({
      query: (params) => ({ url: '/rbac/permissions', params: params ?? undefined }),
      transformResponse: (
        response: PaginatedResponse<PermissionDefinition> | PermissionDefinition[],
      ) => (Array.isArray(response) ? response : response.data),
      providesTags: (result) => providesList(result, API_TAGS.Permission),
    }),

    createPermission: build.mutation<PermissionDefinition, PermissionWritePayload>({
      query: (body) => ({ url: '/rbac/permissions', method: 'POST', body }),
      invalidatesTags: [{ type: API_TAGS.Permission, id: 'LIST' }, API_TAGS.AccessPolicy],
    }),

    updatePermission: build.mutation<
      PermissionDefinition,
      { id: string; changes: Partial<PermissionWritePayload> }
    >({
      query: ({ id, changes }) => ({
        url: `/rbac/permissions/${id}`,
        method: 'PATCH',
        body: changes,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.Permission, id },
        { type: API_TAGS.Permission, id: 'LIST' },
        API_TAGS.AccessPolicy,
      ],
    }),

    deletePermission: build.mutation<void, string>({
      query: (id) => ({ url: `/rbac/permissions/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: API_TAGS.Permission, id },
        { type: API_TAGS.Permission, id: 'LIST' },
        API_TAGS.AccessPolicy,
      ],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetAccessPolicyQuery,
  useGetRolesQuery,
  useGetAllRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useUpdateRolePermissionsMutation,
  useDeleteRoleMutation,
  useGetPermissionsQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} = rbacApi;

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiBaseUrl } from '../constants/publicConstants';
import { getCookie } from '../utils/cookies';

export interface PermissionListItem {
  id: number;
  name: string;
  slug?: string | null;
  route_name?: string;
  manager_route?: {
    id: number;
    name: string;
  };
}

export interface RolePermissionPayload {
  permission_id: number;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
  scope: 'all' | 'team' | 'own';
}

export interface CreateRolePayload {
  name: string;
  permissions: RolePermissionPayload[];
}

export interface RolePermissionDetail {
  permission_id: number;
  permission_name: string;
  route_name: string | null;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
  scope: 'all' | 'team' | 'own';
}

export interface RoleDetailResponse {
  status: string;
  data: {
    id: number;
    name: string;
    permissions: RolePermissionDetail[];
  };
}

export interface EditRoleResponse {
  status: string;
  data: {
    role: {
      id: number;
      name: string;
      permissions: RolePermissionDetail[];
    };
    all_permissions: Array<{
      id: number;
      name: string;
      route_name: string | null;
    }>;
  };
}

export interface UpdateRolePayload {
  id: number | string;
  name: string;
  permissions: RolePermissionPayload[];
}

export const managerRolePermissionApi = createApi({
  reducerPath: 'managerRolePermissionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: ApiBaseUrl,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json');
      const token = getCookie("TOKEN");
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Roles', 'Permissions'],
  endpoints: (builder) => ({
    getManagerPermissions: builder.query<PermissionListItem[], void>({
        query: () => '../ma-permissions',
        providesTags: ['Permissions'],
    }),

    getRoles: builder.query<any, void>({
      query: () => 'roles',
      providesTags: ['Roles'],
    }),

    getRoleById: builder.query<RoleDetailResponse, number | string>({
      query: (id) => `roles/${id}`,
      providesTags: ( _result, _error, id) => [{ type: 'Roles', id }],
    }),

    getRoleEditById: builder.query<EditRoleResponse, number | string>({
      query: (id) => `roles/${id}/edit`,
      providesTags: (_result, _error, id) => [{ type: 'Roles', id }],
    }),

    updateRole: builder.mutation<any, UpdateRolePayload>({
      query: ({ id, ...body }) => ({
        url: `roles/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Roles'],
    }),

    deleteRole: builder.mutation<{ status: string; message: string }, number | string>({
      query: (id) => ({
        url: `roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Roles'],
    }),

    createRole: builder.mutation<any, CreateRolePayload>({
      query: (body) => ({
        url: 'roles',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Roles'],
    }),
  }),
});

export const {
  useGetManagerPermissionsQuery,
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useGetRoleEditByIdQuery,
  useDeleteRoleMutation,
  useUpdateRoleMutation,
} = managerRolePermissionApi;
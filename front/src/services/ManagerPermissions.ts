import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie } from '../utils/cookies';
import { ApiBaseUrlM } from '../constants/publicConstants';

export interface PermissionItem {
  id?: number;
  permission_name: string;
  slug: string;
}

export interface CreatePermissionPayload {
  name: string;
  slug: string;
}

export interface UpdatePermissionPayload {
  id: number | string;
  name: string;
  slug: string;
}

export interface EditPermissionResponse {
  status: string;
  data: {
    permission: {
      id: number;
      name: string;
      slug: string;
    };
  };
}

export const ManagerPermissionsApi = createApi({
  reducerPath: 'managerPermissionsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: ApiBaseUrlM,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = getCookie("TOKEN");
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['ManagerPermissions', 'Permissions'],
  endpoints: (builder) => ({

    getPermissions: builder.query<PermissionItem[], void>({
      query: () => 'ma-permissions',
      providesTags: ['ManagerPermissions'],
    }),

    getPermissionById: builder.query<EditPermissionResponse, number | string>({
      query: (id) => `ma-permissions/${id}/edit`,
      providesTags: (_result, _error, id) => [{ type: 'ManagerPermissions', id }],
    }),

    updatePermission: builder.mutation<any, UpdatePermissionPayload>({
      query: ({ id, ...body }) => ({
        url: `ma-permissions/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['ManagerPermissions', 'Permissions'],
    }),

    deletePermission: builder.mutation<{ status: string; message: string }, number | string>({
      query: (id) => ({
        url: `ma-permissions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ManagerPermissions', 'Permissions'],
    }),

    addPermission: builder.mutation<any, CreatePermissionPayload>({
      query: (newPermission) => ({
        url: 'ma-permissions',
        method: 'POST',
        body: newPermission,
      }),
      invalidatesTags: ['ManagerPermissions'],
    }),

  }),
});

export const { 
  useGetPermissionsQuery, 
  useGetPermissionByIdQuery,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  useAddPermissionMutation 
} = ManagerPermissionsApi;
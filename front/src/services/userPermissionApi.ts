import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiBaseUrl } from '../constants/publicConstants';
import { getCookie } from '../utils/cookies';

export interface UserPermissionItem {
  permission_id: number;
  name: string;
  slug: string;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
  scope: 'all' | 'own' | 'team' | string;
}

export interface AuthUserProfileData {
  id: number;
  first_name: string;
  last_name: string;
  role_id: number | null;
  role_name: string | null;
  is_chef: boolean;
  equipe_id: number | null;
  permissions: UserPermissionItem[];
}

export interface AuthUserProfileResponse {
  status: string;
  data: AuthUserProfileData;
}

export const userPermissionApi = createApi({
  reducerPath: 'userPermissionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: ApiBaseUrl,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json');
      const token = getCookie('TOKEN');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
    responseHandler: async (response) => {
      if (response.status === 403 && window.location.pathname !== '/403') {
        window.location.href = '/403';
      }
      return response.json();
    },
  }),
  tagTypes: ['AuthUserPermissions'],
  endpoints: (builder) => ({
    getAuthUserPermissions: builder.query<AuthUserProfileResponse, void>({
      query: () => '/user/profile-permissions',
      providesTags: ['AuthUserPermissions'],
    }),
  }),
});

export const {
  useGetAuthUserPermissionsQuery,
  useLazyGetAuthUserPermissionsQuery,
} = userPermissionApi;
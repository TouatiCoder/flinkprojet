import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiBaseUrl } from '../constants/publicConstants';
import { getCookie } from '../utils/cookies';

export interface RegisterManagerRequest {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
}

export interface RegisterManagerResponse {
  status: string;
  message: string;
  data: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    role_id: number;
    created_at?: string;
    updated_at?: string;
  };
}

export interface LoginRequest {
  email?: string;
  username?: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  token: string;
  user: any;
}

export interface UpdateUserPayload {
  id: number | string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number | string;
  password?: string;
}

export interface EditUserResponse {
  status: string;
  data: {
    user: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
      email: string;
      role_id: number;
      role?: { id: number; name: string };
    };
    roles: Array<{ id: number; name: string }>;
  };
}

export interface UserProfileResponse {
  status: string;
  data: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    // Renvoyés par AuthController@userProfile au même titre que les autres
    // champs ; ils servent à préremplir le formulaire « Edit profile ».
    telephone: string | null;
    avatar: string | null;
    role: string | null;
    permissions: string[];
    allowed_routes: string[];
  };
}

// PUT /me — AuthController@updateProfile.
//
// `nom_complet` est découpé côté serveur en first_name / last_name.
// Les trois champs de mot de passe ne sont envoyés que si l'utilisateur veut
// réellement le changer : `password` est validé avec la règle `confirmed`,
// donc `password_confirmation` est obligatoire dès que `password` est fourni,
// et `current_password` est vérifié contre le hash en base.
export interface UpdateProfilePayload {
  nom_complet: string;
  telephone?: string | null;
  /**
   * Image base64 pour un nouvel upload, chaîne vide pour supprimer la photo,
   * ou l'URL actuelle si elle n'a pas changé. Champ omis = on n'y touche pas.
   */
  avatar?: string | null;
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}

export interface UpdateProfileResponse {
  status: string;
  message: string;
  data: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    telephone: string | null;
    username: string;
    avatar: string | null;
  };
}

export const managerAuthApi = createApi({
  reducerPath: 'managerAuthApi',
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
  tagTypes: ['ManagerUsers', 'Auth'],
  endpoints: (builder) => ({
    getManagerUsers: builder.query<{ status: string; data: any[] }, void>({
      query: () => 'usersM',
      providesTags: ['ManagerUsers'],
    }),

    deleteManagerUser: builder.mutation<any, number | string>({
      query: (id) => ({
        url: `users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ManagerUsers'],
    }),

    registerManager: builder.mutation<RegisterManagerResponse, RegisterManagerRequest>({
      query: (body) => ({
        url: 'register',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ManagerUsers'],
    }),

    loginManager: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    getManagerProfile: builder.query<UserProfileResponse, void>({
      query: () => 'me',
      providesTags: ['Auth'],
    }),

    updateManagerProfile: builder.mutation<UpdateProfileResponse, UpdateProfilePayload>({
      query: (body) => ({
        url: 'me',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),

    getUserById: builder.query<EditUserResponse, number | string>({
      query: (id) => `users/${id}/edit`,
      providesTags: (_result, _error, id) => [{ type: 'ManagerUsers', id }],
    }),

    updateUser: builder.mutation<any, UpdateUserPayload>({
      query: ({ id, ...body }) => ({
        url: `users/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['ManagerUsers'],
    }),

    logoutManager: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: 'logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'ManagerUsers'],
    }),
  }),
});

export const {
  useGetManagerUsersQuery,
  useDeleteManagerUserMutation,
  useRegisterManagerMutation,
  useLoginManagerMutation,
  useGetManagerProfileQuery,
  useUpdateManagerProfileMutation,
  useLogoutManagerMutation,
  useGetUserByIdQuery,
  useUpdateUserMutation
} = managerAuthApi;
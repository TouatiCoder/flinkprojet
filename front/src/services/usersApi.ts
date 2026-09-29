import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie } from '../utils/cookies';
import { ApiBaseUrl } from '../constants/publicConstants';

export interface latestConnexion {
  id: number;
  date_connexion: string;
}

export interface Ville {
  id: number;
  name: string;
  status?: number;
}

export interface Manager {
  id: number;
  name: string;
  role: number | null;
}

export interface UserEditResponse {
  status: string;
  data: {
    user: User;
    telephones: string[];
    villes: Ville[];
    connexions: any[];
    managers: Manager[];
    all_managers: Manager[];
  };
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  slug: string;
  avatar: string;
  email: string;
  tele: string;
  is_verified: string | null;
  etablissements_count: number;
  connexions_count: number;
  publications_count: number;
  created_at: string;
  latest_connexion: null | latestConnexion;
  ville?: Ville | null;
  is_active: string | null;
  ville_id?: number | string | null;
  is_email_verified?: boolean | number;
  is_telephone_verified?: boolean | number;
  total_vues?: number;
  total_click_tele?: number;
  total_click_whatsapp?: number;
  total_favoris?: number;
  total_followers?: number;
  ca?: number;
  total_annonces?: number;
  total_annonces_actives?: number;
  relation_telephones?: RelationTelephone[];
  manager_users_id?: number | null;
  commercial?: string;
  secteur?: string;
  source?: string;
}

interface ApiResponse {
  data: {
    current_page: number;
    data: User[];
    links: [];
    total: number;
    per_page: number;
  };
  total_etablissements: number;
  total_signalements: number;
  total_consommation_solde: number;
  villes: Ville[];
  total_ca?: number;
  total_actives?: number;
  total_bloque?: number;
}

export interface PhoneUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string | null;
}

export interface RelationTelephone {
  telephone_id: number;
  telephone_number?: string;
  usage_count: number;
  users: PhoneUser[];
}

export interface UsersFilterDataResponse {
  status: string;
  data: {
    commerciaux: Array<{ id: string; name: string; avatar?: string | null; role?: string }>;
    secteurs: Array<{ id: string; name: string }>;
    sources: Array<{ id: string; name: string }>;
    villes: Ville[];
  };
}

export interface UsersQueryParams {
  page: number;
  search?: string;
  commercial?: string;
  secteur?: string;
  source?: string;
  verification?: string;
  compte_pro?: string;
  periode?: string;
  start_date?: string;
  end_date?: string;
  ville_id?: string;
  email_verifie?: string;
  telephone_verifie?: string;
}

export const usersApi = createApi({
  reducerPath: 'userApi',
  tagTypes: ['Users', 'UserEdit'],
  baseQuery: fetchBaseQuery({
    baseUrl: ApiBaseUrl,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = getCookie("TOKEN");
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
    responseHandler: async (response) => {
      if (response.status === 403 && window.location.pathname !== '/403') {
        window.location.href = '/403';
      }
      return response.json();
    },
  }),
  endpoints: (builder) => ({
    getUsers: builder.query<ApiResponse, UsersQueryParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '' && value !== 'all') {
            queryParams.set(key, String(value));
          }
        });
        return `users?${queryParams.toString()}`;
      },
      providesTags: ['Users'],
    }),

    getUserEdit: builder.query<UserEditResponse, { id: number | string; search?: string }>({
      query: ({ id, search }) => ({
        url: `usersF/${id}/edit`,
        params: search ? { search } : {},
      }),
      providesTags: (_result, _error, { id }) => [{ type: 'UserEdit', id }],
    }),

    getUsersFilterData: builder.query<UsersFilterDataResponse, void>({
      query: () => '/users/filter-data',
      providesTags: ['Users'],
    }),

    updateUser: builder.mutation<any, { id: number | string; data: any }>({
      query: ({ id, data }) => ({
        url: `usersF/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Users',
        { type: 'UserEdit', id },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserEditQuery,
  useUpdateUserMutation,
  useGetUsersFilterDataQuery,
} = usersApi;
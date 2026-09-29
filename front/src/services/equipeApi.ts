import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie } from '../utils/cookies';
import { ApiBaseUrl } from '../constants/publicConstants';

export interface EquipeActiviteItem {
  id: number;
  name: string;
}

export interface EquipeUserDataItem {
  id: number;
  name: string;
  email: string;
  role: string;
  equipe_id: number | null;
  is_chef: boolean;
}

export interface EquipeMemberItem {
  id: number;
  name: string;
  role: string;
  avatar?: string | null;
}

export interface EquipeChefItem {
  id: number;
  name: string;
  role: string;
  avatar?: string | null;
}

export interface EquipeItem {
  id: number;
  nom: string;
  color: string;
  status: string;
  capacite_leads: number;
  total_leads: number;
  taux_atteinte: number;
  chef: EquipeChefItem | null;
  activite: string;
  activites_json: EquipeActiviteItem[];
  total_membres: number;
  membres_json: EquipeMemberItem[];
  // La colonne `ma_equipes.created_at` existe en base, mais
  // EquipeController@getEquipes ne la renvoie pas encore : le champ est donc
  // optionnel et la fiche équipe affiche « — » tant qu'il est absent.
  created_at?: string | null;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface EquipeListResponse {
  status: string;
  data: {
    current_page: number;
    data: EquipeItem[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export interface EquipeCreateDataResponse {
  status: string;
  data: {
    activites: EquipeActiviteItem[];
    users: EquipeUserDataItem[];
  };
}

export interface CreateEquipePayload {
  nom: string;
  responsable_id?: number | null;
  secteurs?: number[];
  membres?: number[];
  capacite_leads?: number | null;
  color?: string;
}

export const equipeApi = createApi({
  reducerPath: 'equipeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: ApiBaseUrl,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = getCookie('TOKEN');
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

  tagTypes: ['Equipes', 'EquipeCreateData'],

  endpoints: (builder) => ({
    getEquipes: builder.query<
      EquipeListResponse,
      {
        page?: number;
        per_page?: number;
        search?: string;
      } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set('page', String(params.page));
        if (params?.per_page) queryParams.set('per_page', String(params.per_page));
        if (params?.search) queryParams.set('search', params.search);
        const qs = queryParams.toString();
        return `/equipes${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Equipes'],
    }),

    getEquipeCreateData: builder.query<EquipeCreateDataResponse, void>({
      query: () => '/equipes/create-data',
      providesTags: ['EquipeCreateData'],
    }),

    createEquipe: builder.mutation<{ status: string; message: string; data: any }, CreateEquipePayload>({
      query: (data) => ({
        url: '/equipes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Equipes', 'EquipeCreateData'],
    }),
  }),
});

export const {
  useGetEquipesQuery,
  useGetEquipeCreateDataQuery,
  useCreateEquipeMutation,
} = equipeApi;
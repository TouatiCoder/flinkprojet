import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie } from '../utils/cookies';
import { ApiBaseUrl } from '../constants/publicConstants';

import { RelationTelephone } from './usersApi';

export interface GestionnaireUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string | null;
  tele?: string | null;
}

export interface EtablissementEditData {
  id: number;
  nom: string;
  email: string;
  default_phone_number: string;
  ville_id: number;
  status: boolean;
  is_verified: boolean;
}

export interface ManagerItem {
  id: string;
  name: string;
  role?: number | null;
}

export interface EtablissementEditResponse {
  status: string;
  data: {
    etablissement: EtablissementEditData;
    telephones: string[];
    villes: { id: number; name: string }[];
    managers: ManagerItem[];
  };
}

export interface Etablissement {
  id: number;
  nom: string;
  status: number;
  slug: string;
  logo: string;
  email: string;
  siteweb: string;
  is_verified: string | null;
  publications_count: number;
  posts_count?: number;
  consommation_solde?: number | string;
  secteur?: string | null;
  activite?: string | null;
  activites?: string | null;
  ville?: string | null;
  default_phone_number?: string | null;
  phone?: string | null;
  tele?: string | null;
  telephone?: string | null;
  gestionnaires?: GestionnaireUser[];
  relation_telephones?: RelationTelephone[];
  ca_total?: number;
  derniere_activite?: string | null;
  created_at: string;
  total_vues?: number;
  total_click_tele?: number;
  total_click_whatsapp?: number;
  total_favoris?: number;
  total_followers?: number;
  total_annonces?: number;
  total_annonces_actives?: number;
  activites_recentes?: Array<{
    id: number;
    type: string;
    title: string;
    subtitle: string;
    user_name: string | null;
    date: string | null;
  }>;

}

export interface Ville {
  id: number;
  name: string;
  status: number;
}

export interface Activite {
  id: number;
  name: string;
  status: number;
}

interface ApiResponse {
  data: {
    current_page: number;
    data: Etablissement[];
    links: [];
    total: number;
    per_page: number;
  };
  villes: Ville[];
  activites: Activite[];
  total_actives: number;
  total_consommation_solde: string | number;
  total_ca: number;
  total_bloque: number;
}

export const etablissementsApi = createApi({
  reducerPath: 'etablissementsApi',
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

  tagTypes: ['Etablissements', 'EtablissementEdit'],

  endpoints: (builder) => ({
    getEtablissements: builder.query<ApiResponse, {
      page: number;
      search?: string;
      ville_id?: string;
      activite_id?: string;
      statut?: string;
    }>({
      query: ({ page, search, ville_id, activite_id, statut }) => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        if (search) params.set('search', search);
        if (ville_id) params.set('ville_id', ville_id);
        if (activite_id) params.set('activite_id', activite_id);
        if (statut) params.set('statut', statut);
        return `etablissements?${params.toString()}`;
      },
      providesTags: ['Etablissements'],
    }),

    getEtablissementEdit: builder.query<EtablissementEditResponse, { id: number | string; search?: string }>({
      query: ({ id, search }) => ({
        url: `/etablissementsE/${id}/edit`,
        params: search ? { search } : {},
      }),
      providesTags: (_result, _error, { id }) => [{ type: 'EtablissementEdit', id }],
    }),

    updateEtablissement: builder.mutation<any, { id: number | string; data: Partial<EtablissementEditData> }>({
      query: ({ id, data }) => ({
        url: `/etablissementsE/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Etablissements',
        { type: 'EtablissementEdit', id },
      ],
    }),
  }),
});

export const { useGetEtablissementsQuery, useGetEtablissementEditQuery, useUpdateEtablissementMutation } = etablissementsApi;

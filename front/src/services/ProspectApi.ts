import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie } from '../utils/cookies';
import { ApiBaseUrl } from '../constants/publicConstants';
import { VueEnsembleCardData } from '../../src/components/crm/details/tabs/VueEnsembleCards';

export interface ProspectVille {
  id: number;
  name: string;
}

export interface ProspectActivite {
  id: number;
  name: string;
}

export interface ProspectSource {
  id: number;
  name: string;
}

export interface ProspectInteret {
  id: number;
  name: string;
}

export interface ProspectManager {
  id: string;
  name: string;
}

export interface ProspectInteretItem {
  id: number;
  name: string;
  short_name?: string;
}

export interface ProspectItem {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  name_entreprise?: string | null;
  activite_id?: number | null;
  activite_name?: string | null;
  ville_id?: number | null;
  ville_name?: string | null;
  prospect_source_id?: number | null;
  source_name?: string | null;
  manager_users_id?: number | null;
  manager_name?: string | null;
  manager_avatar?: string | null;
  note?: string | null;
  created_at: string;
  updated_at: string;
  activite_actuelle?: any | null;
  derniere_activite?: any | null;
  interets?: ProspectInteretItem[];
  commercial?: {
    id: number | null;
    name: string;
    avatar?: string | null;
  };
  card_id?: number | null;
  ma_pipline_etape_id?: number | null;
  etape_name?: string | null;
  soldes?: Array<{
    type: string;
    label: string;
    montant: number;
  }>;
  montants?: {
    total: number;
    solde_ads: number;
    compte_pro: number;
    renouvellement: number;
  };
  ma_pipline_activites_type_id?: number | null;
  activite_type?: {
    id: number;
    name: string;
    icone?: string | null;
    created_at?: string | null;
  } | null;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface ProspectListResponse {
  status: string;
  data: {
    current_page: number;
    data: ProspectItem[];
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

export interface ProspectCreateDataResponse {
  status: string;
  data: {
    villes: ProspectVille[];
    activites: ProspectActivite[];
    prospect_sources: ProspectSource[];
    sources?: ProspectSource[];
    prospect_interets: ProspectInteret[];
    managers: ProspectManager[];
    default_solde_compte_pro?: number;
  };
}

export interface CreateProspectPayload {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  name_entreprise?: string;
  activite_id?: number | null;
  ville_id?: number | null;
  prospect_source_id?: number | null;
  manager_users_id?: number | null;
  interets?: number[];
  note?: string;
}

export interface FilterResponsableItem {
  id: string;
  name: string;
  avatar?: string | null;
  role?: string;
}

export interface FilterResponsablesResponse {
  status: string;
  data: FilterResponsableItem[];
}

export interface ProspectNoteItem {
  id: number;
  prospect_id: number;
  note: string;
  created_at: string;
  manager_users_id: number;
  author: {
    id: number;
    name: string;
    avatar?: string | null;
  };
}

export interface ProspectNotesResponse {
  status: string;
  data: ProspectNoteItem[];
}

export interface UpdateProspectPayload {
  id: number | string;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string | null;
  name_entreprise?: string | null;
  activite_id?: number | null;
  ville_id?: number | null;
  prospect_source_id?: number | null;
  manager_users_id?: number | null;
}

export interface StatsCardItem {
  actual: number;
  target: number;
  percentage: number;
  label: string;
  unit?: string;
}

export interface ProspectsATraiterStat {
  activites_ouvertes: number;
  total_prospects: number;
  ratio_text: string;
  subtitle: string;
}

export interface RelancesRetardStat {
  total: number;
  subtitle: string;
  total_activites_en_cours: number;
}

export interface ProspectStatsCardsResponse {
  status: string;
  data: {
    periode: {
      key: string;
      label: string;
    };
    users: StatsCardItem;
    comptes_pro: StatsCardItem;
    solde_ads: StatsCardItem;
    prospects_a_traiter: ProspectsATraiterStat;
    relances_en_retard: RelancesRetardStat;
  };
}

export interface StatsCardsQueryParams {
  periode?: 'aujourdhui' | 'semaine' | 'mois' | 'annee' | 'all' | 'custom' | string;
  start_date?: string;
  end_date?: string;
  commercial?: string;
  secteur?: string;
  objectif?: string;
  source?: string;
  etape?: string;
}

export interface PipelineEtapeItem {
  id: number;
  name: string;
  order?: number;
  color?: string;
  score?: number;
}

export const prospectsApi = createApi({
  reducerPath: 'prospectsApi',
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

  tagTypes: ['Prospects', 'ProspectCreateData'],

  endpoints: (builder) => ({
    getProspects: builder.query<
      ProspectListResponse,
      {
        page?: number;
        per_page?: number;
        search?: string;
        statut?: string;
        interet?: string;
        objectif?: string;
        etape?: string;
        source?: string;
        secteur?: string;
        commercial?: string;
        periode?: string;
        start_date?: string;
        end_date?: string;
      }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.set('page', String(params.page));
        if (params.per_page) queryParams.set('per_page', String(params.per_page));
        if (params.search) queryParams.set('search', params.search);
        if (params.statut && params.statut !== 'all') queryParams.set('statut', params.statut);
        if (params.interet && params.interet !== 'all') queryParams.set('interet', params.interet);
        if (params.objectif && params.objectif !== 'all') {
          queryParams.set('objectif', params.objectif);
          queryParams.set('interet', params.objectif);
        }
        if (params.etape && params.etape !== 'all') queryParams.set('etape', params.etape);
        if (params.source && params.source !== 'all') queryParams.set('source', params.source);
        if (params.secteur && params.secteur !== 'all') queryParams.set('secteur', params.secteur);
        if (params.commercial && params.commercial !== 'all') queryParams.set('commercial', params.commercial);

        if (params.periode && params.periode !== 'all') queryParams.set('periode', params.periode);
        if (params.start_date) queryParams.set('start_date', params.start_date);
        if (params.end_date) queryParams.set('end_date', params.end_date);

        const qs = queryParams.toString();
        return `/prospects${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Prospects'],
    }),

    getProspectCreateData: builder.query<
      ProspectCreateDataResponse,
      { search_ville?: string; search_activite?: string } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.search_ville) queryParams.set('search_ville', params.search_ville);
        if (params?.search_activite) queryParams.set('search_activite', params.search_activite);
        const qs = queryParams.toString();
        return `/prospects/create-data${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['ProspectCreateData'],
    }),

    createProspect: builder.mutation<any, CreateProspectPayload>({
      query: (data) => ({
        url: '/prospects',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Prospects'],
    }),

    getFilterResponsables: builder.query<FilterResponsablesResponse, void>({
      query: () => '/prospects/filter-responsables',
      providesTags: ['Prospects'],
    }),

    getProspectNotes: builder.query<
      ProspectNotesResponse,
      { id: number | string; type?: string }
    >({
      query: ({ id, type = 'prospect' }) => `/prospects/${id}/notes?type=${type}`,
      providesTags: (_result, _error, { id }) => [{ type: 'Prospects', id: `NOTES_${id}` }],
    }),

    createProspectNote: builder.mutation<
      any,
      { id: number | string; type?: string; note: string }
    >({
      query: ({ id, type = 'prospect', note }) => ({
        url: `/prospects/${id}/notes`,
        method: 'POST',
        body: { note, type },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Prospects', id: `NOTES_${id}` },
        'Prospects',
      ],
    }),

    updateProspect: builder.mutation<any, UpdateProspectPayload>({
      query: ({ id, ...body }) => ({
        url: `/prospects/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Prospects',
        { type: 'Prospects', id },
      ],
    }),

    getProspectStatsCards: builder.query<ProspectStatsCardsResponse, StatsCardsQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.periode) queryParams.set('periode', params.periode);
        if (params?.start_date) queryParams.set('start_date', params.start_date);
        if (params?.end_date) queryParams.set('end_date', params.end_date);
        if (params?.commercial && params.commercial !== 'all') queryParams.set('commercial', params.commercial);
        if (params?.secteur && params.secteur !== 'all') queryParams.set('secteur', params.secteur);
        if (params?.source && params.source !== 'all') queryParams.set('source', params.source);
        if (params?.objectif && params.objectif !== 'all') queryParams.set('objectif', params.objectif);
        if (params?.etape && params.etape !== 'all') queryParams.set('etape', params.etape);
        const qs = queryParams.toString();
        return `/prospects/stats-cards${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Prospects'],
    }),

    getProspectById: builder.query<{ status: string; data: ProspectItem }, number | string>({
      query: (id) => `/prospects/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Prospects', id }],
    }),

    getPipelineEtapes: builder.query<
      { status: string; current_etape_id?: number; data: any[] },
      { prospect_id?: number; user_id?: number; etab_id?: number; card_id?: number } | number | string | void
    >({
      query: (arg) => {
        if (typeof arg === "object" && arg !== null) {
          const params = new URLSearchParams();
          if (arg.card_id) params.append("card_id", String(arg.card_id));
          if (arg.prospect_id) params.append("prospect_id", String(arg.prospect_id));
          if (arg.user_id) params.append("user_id", String(arg.user_id));
          if (arg.etab_id) params.append("etab_id", String(arg.etab_id));
          return `/prospects/pipeline-etapes?${params.toString()}`;
        }
        return arg ? `/prospects/pipeline-etapes?prospect_id=${arg}` : `/prospects/pipeline-etapes`;
      },
      providesTags: ["Prospects"],
    }),

    updateProspectEtape: builder.mutation<
      any,
      {
        prospectId?: number;
        userId?: number;
        etabId?: number;
        cardId?: number;
        ma_pipline_etape_id: number;
      }
    >({
      query: ({ prospectId, userId, etabId, cardId, ma_pipline_etape_id }) => {
        const targetId = prospectId || userId || etabId || cardId || 0;

        return {
          url: `/prospects/${targetId}/etape`,
          method: "PUT",
          body: {
            ma_pipline_etape_id,
            card_id: cardId,
            user_id: userId,
            etab_id: etabId,
            prospect_id: prospectId,
          },
        };
      },
      invalidatesTags: ["Prospects"],
    }),

    getProspectVueEnsembleCards: builder.query<{ status: string; data: VueEnsembleCardData }, number | string>({
      query: (prospectId) => `/prospects/${prospectId}/vue-ensemble-cards`,
      providesTags: ['Prospects'],
    }),
  }),
});

export const {
  useGetProspectsQuery,
  useGetProspectCreateDataQuery,
  useCreateProspectMutation,
  useGetProspectByIdQuery,
  useGetFilterResponsablesQuery,
  useGetProspectNotesQuery,
  useCreateProspectNoteMutation,
  useUpdateProspectMutation,
  useGetProspectStatsCardsQuery,
  useGetProspectVueEnsembleCardsQuery,
  useGetPipelineEtapesQuery,
  useUpdateProspectEtapeMutation,
} = prospectsApi;
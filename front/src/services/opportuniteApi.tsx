import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie } from '../utils/cookies';
import { ApiBaseUrl } from '../constants/publicConstants';

export interface OpportunityInteretItem {
  id: number;
  name: string;
}

export interface OpportunitySoldeItem {
  type: 'user' | 'pro' | 'ads' | 'renouvellement' | string;
  label: string;
  montant?: number | null;
}

export interface ApiOpportunityCard {
  id: string;
  stage_id: string;
  title: string;
  user_id?: number | null;
  etablissement_id?: number | null;
  prospect_id?: number | null;
  type_user: 'prospect' | 'user' | 'compte_pro';
  type_user_label: string;
  solde: number | null;
  type_solde: string | null;
  position: number;
  interet_id: number | null;
  interet_name: string | null;
  interets?: OpportunityInteretItem[];
  manager_id: number | null;
  manager_name: string;
  manager_avatar?: string | null;
  activite_type_id: number | null;
  activite_name: string | null;
  activite_icone: string | null;
  date_echeance: string | null;
  date_text: string;
  is_date_highlight: boolean;
  sans_objectif?: boolean;
  en_retard?: boolean;
  score?: number;
  source_name?: string | null;
  soldes?: OpportunitySoldeItem[];
  total_solde?: number | null;
}

export interface ApiOpportunityStage {
  id: string;
  name: string;
  order: number;
  color: string;
  score?: number;
  count: number;
  cards: ApiOpportunityCard[];
}

export interface PipelineApiResponse {
  status: string;
  data: {
    pipeline: ApiOpportunityStage[];
    all_cards: ApiOpportunityCard[];
    has_more: boolean;
  };
}

export interface MoveCardPayload {
  card_id: number | string;
  target_etape_id: number | string;
  new_position?: number;
}

export interface ToggleObjectifPayload {
  card_id?: number | null;
  type_user: 'prospect' | 'user' | 'etablissement';
  entity_id: number;
  objectif_type: 'user' | 'pro' | 'ads' | 'renouvellement';
  is_selected: boolean;
  montant?: number | null;
}

export interface ToggleObjectifResponse {
  status: string;
  message: string;
  soldes: OpportunitySoldeItem[];
  statut_opportunite?: string;
}

export interface GetObjectifsResponse {
  status: string;
  data: {
    card_id: number | null;
    opportunite_id: string;
    status: string;
    statut_opportunite?: string;
    etape_id?: number;
    etape_name?: string;
    date_creation: string;
    commercial_name: string;
    soldes: OpportunitySoldeItem[];
    default_pro_montant?: number;
    pending_ads?: boolean;
    pending_pro?: boolean;
  };
}

export interface PipelineFilterDataResponse {
  status: string;
  data: {
    commerciaux: Array<{ id: string; name: string; avatar?: string | null; role?: string }>;
    etapes: Array<{ id: string; name: string }>;
    objectifs: Array<{ id: string; name: string }>;
    secteurs: Array<{ id: string; name: string }>;
    sources: Array<{ id: string; name: string }>;
  };
}

export interface GetPipelineParams {
  commercial?: string;
  etape?: string;
  objectif?: string;
  secteur?: string;
  source?: string;
  periode?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export const opportuniteApi = createApi({
  reducerPath: 'opportuniteApi',
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

  tagTypes: ['Pipeline'],

  endpoints: (builder) => ({
    getPipeline: builder.query<PipelineApiResponse, GetPipelineParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.commercial && params.commercial !== 'all') queryParams.set('commercial', params.commercial);
        if (params?.etape && params.etape !== 'all') queryParams.set('etape', params.etape);
        if (params?.objectif && params.objectif !== 'all') queryParams.set('objectif', params.objectif);
        if (params?.secteur && params.secteur !== 'all') queryParams.set('secteur', params.secteur);
        if (params?.source && params.source !== 'all') queryParams.set('source', params.source);
        if (params?.periode && params.periode !== 'all') queryParams.set('periode', params.periode);
        if (params?.start_date) queryParams.set('start_date', params.start_date);
        if (params?.end_date) queryParams.set('end_date', params.end_date);
        if (params?.search) queryParams.set('search', params.search);

        if (params?.page) queryParams.set('page', String(params.page));
        if (params?.per_page) queryParams.set('per_page', String(params.per_page));

        const qs = queryParams.toString();
        return `/pipeline${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Pipeline'],
    }),

    getPipelineFilterData: builder.query<PipelineFilterDataResponse, void>({
      query: () => '/pipeline/filter-data',
      providesTags: ['Pipeline'],
    }),

    moveCard: builder.mutation<any, MoveCardPayload>({
      query: (data) => ({
        url: '/pipeline/move-card',
        method: 'POST',
        body: {
          card_id: Number(data.card_id),
          target_etape_id: Number(data.target_etape_id),
          new_position: data.new_position ?? 0,
        },
      }),
      invalidatesTags: ['Pipeline'],
    }),

    getObjectifs: builder.query<
      GetObjectifsResponse,
      { type_user: string; entity_id: number }
    >({
      query: ({ type_user, entity_id }) =>
        `/opportunites/details?type_user=${type_user}&entity_id=${entity_id}`,
      providesTags: ['Pipeline'],
    }),

    createNewOpportunite: builder.mutation<
      any,
      {
        type_user: string;
        entity_id: number;
        objectif_type: string;
        is_selected: boolean;
        montant?: number | null;
      }
    >({
      query: (body) => ({
        url: '/opportunites/nouvelle',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Pipeline'],
    }),

    toggleObjectif: builder.mutation<ToggleObjectifResponse, ToggleObjectifPayload>({
      query: (body) => ({
        url: '/opportunites/toggle-objectif',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Pipeline'],
    }),
  }),
});

export const {
  useGetPipelineQuery,
  useGetPipelineFilterDataQuery,
  useMoveCardMutation,
  useGetObjectifsQuery,
  useToggleObjectifMutation,
  useCreateNewOpportuniteMutation,
} = opportuniteApi;
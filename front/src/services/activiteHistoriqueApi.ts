import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "../utils/cookies";
import { ApiBaseUrl } from "../constants/publicConstants";
import { prospectsApi } from "./ProspectApi";
import { opportuniteApi } from "./opportuniteApi";

export interface ActiviteNote {
  id: number;
  note: string;
  subname?: string;
  ma_pipline_activites_types_id: number;
}

export interface ActivityType {
  id: number;
  name: string;
  icone: string | null;
}

export interface CurrentActiviteResponse {
  status: string;
  data: {
    card_id: number;
    type_user?: string;
    date_echeance?: string | null;
    heure?: string | null;
    note_planification?: string | null;
    is_retard?: boolean;
    retard_text?: string | null;
    need_planning: boolean;
    server_time:string;
    server_hour:string;
    server_date:string;
    activite_actuelle?: {
      id: number;
      name: string;
      icone: string | null;
    };
    notes?: ActiviteNote[];
    all_activity_types?: ActivityType[];
    last_historique_id?: number;
  };
}

export interface StoreActivitePayload {
  card_id?: number;
  user_id?: number;
  etab_id?: number;
  prospect_id?: number;
  ma_pipline_activites_types_id: number;
  ma_pipline_activites_notes_id: number;
  note?: string;
}

export interface PlanifierActivitePayload {
  card_id: number;
  user_id?: number;
  etab_id?: number;
  prospect_id?: number;
  ma_pipline_activites_types_id: number;
  date: string;
  heure?: string;
  note?: string;
}

export interface HistoriqueItem {
  id: number;
  type_name: string;
  type_icone: string | null;
  note_label: string;
  user_note: string | null;
  formatted_date: string;
}

export const activiteHistoriqueApi = createApi({
  reducerPath: "activiteHistoriqueApi",
  baseQuery: fetchBaseQuery({
    baseUrl: ApiBaseUrl,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = getCookie("TOKEN");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
    responseHandler: async (response) => {
      if (response.status === 403 && window.location.pathname !== "/403") {
        window.location.href = "/403";
      }
      return response.json();
    },
  }),

  tagTypes: ["CurrentActivite", "ActiviteHistorique"],

  endpoints: (builder) => ({
    getCurrentActivite: builder.query<
      CurrentActiviteResponse,
      { card_id?: number; user_id?: number; etab_id?: number; prospect_id?: number }
    >({
      query: (params) => ({
        url: "/current-activite",
        method: "GET",
        params,
      }),
      providesTags: ["CurrentActivite"],
    }),

    storeActivite: builder.mutation<
      { status: string; message: string; data?: { historique_id: number; need_planning: boolean } },
      StoreActivitePayload
    >({
      query: (data) => ({
        url: "/store-activite",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CurrentActivite", "ActiviteHistorique"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(prospectsApi.util.invalidateTags(["Prospects"]));
          dispatch(opportuniteApi.util.invalidateTags(["Pipeline"]));
        } catch {
          // 
        }
      },
    }),

    getHistoriqueActivites: builder.query<
      { status: string; data: HistoriqueItem[] },
      { user_id?: number; etab_id?: number; prospect_id?: number }
    >({
      query: (params) => ({
        url: "/historique-activites",
        method: "GET",
        params,
      }),
      providesTags: ["ActiviteHistorique"],
    }),

    marquerCommePerdu: builder.mutation<any, { card_id?: number; user_id?: number; etab_id?: number; prospect_id?: number }>({
      query: (body) => ({
        url: "/activite/marquer-perdu",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CurrentActivite", "ActiviteHistorique", "CurrentActivite"],
    }),

    planifierProchaineActivite: builder.mutation<
      { status: string; message: string; data?: { historique_id: number; need_planning: boolean } },
      PlanifierActivitePayload
    >({
      query: (data) => ({
        url: "/planifier-prochaine-activite",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CurrentActivite", "ActiviteHistorique"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(prospectsApi.util.invalidateTags(["Prospects"]));
          dispatch(opportuniteApi.util.invalidateTags(["Pipeline"]));
        } catch {
          // ignore error
        }
      },
    }),
  }),
});

export const {
  useGetCurrentActiviteQuery,
  useStoreActiviteMutation,
  usePlanifierProchaineActiviteMutation,
  useGetHistoriqueActivitesQuery,
  useMarquerCommePerduMutation,
} = activiteHistoriqueApi;
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "../utils/cookies";
import { ApiBaseUrl } from "../constants/publicConstants";

export interface AdsCampaignItem {
  id: number;
  publication_id: number;
  title: string;
  objectif: string;
  montant: number;
  montant_format: string;
  vues: number;
  clics: number;
  ctr: string;
  is_active: boolean;
  status_label: string;
  date_debut: string | null;
  date_fin: string | null;
  periode: string;
}

export interface TransactionItem {
  id: number;
  numero: string;
  product_id: number;
  product_name: string;
  amount: number;
  amount_format: string;
  mode_paiement: string;
  paid: number;
  status_label: string;
  status_color: string;
  billing_date: string | null;
  date_format: string;
}

export interface CompteProItem {
  id: number;
  nom: string;
  logo: string | null;
  activite_id: number | null;
  activite_name: string;
  status: boolean;
  status_label: string;
  status_color: string;
  consommation_solde: number;
  solde_format: string;
  created_at: string;
  date_creation: string;
}

export interface SoldeAdsHistoryItem {
  id: number;
  numero: string;
  product_id: number;
  product_name: string;
  amount: number;
  amount_format: string;
  mode_paiement: string;
  debit: boolean;
  credit: boolean;
  type_mouvement: "Débit" | "Crédit";
  billing_date: string | null;
  date_format: string;
}

export interface AccountActivityParams {
  type?: "user" | "etablissement" | "prospect";
  id: number | string;
}

export const accountActivityApi = createApi({
  reducerPath: "accountActivityApi",
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

  tagTypes: ["AdsHistory", "TransactionsHistory", "ComptesPro", "SoldeAdsHistory"],

  endpoints: (builder) => ({
    getAdsHistory: builder.query<{ status: string; data: AdsCampaignItem[] }, AccountActivityParams>({
      query: (params) => ({
        url: "/activites-compte/ads",
        method: "GET",
        params,
      }),
      providesTags: ["AdsHistory"],
    }),

    getTransactionsHistory: builder.query<{ status: string; data: TransactionItem[] }, AccountActivityParams>({
      query: (params) => ({
        url: "/activites-compte/transactions",
        method: "GET",
        params,
      }),
      providesTags: ["TransactionsHistory"],
    }),

    getComptesPro: builder.query<{ status: string; data: CompteProItem[] }, AccountActivityParams>({
      query: (params) => ({
        url: "/activites-compte/comptes-pro",
        method: "GET",
        params,
      }),
      providesTags: ["ComptesPro"],
    }),

    getSoldeAdsHistory: builder.query<{ status: string; data: SoldeAdsHistoryItem[] }, AccountActivityParams>({
      query: (params) => ({
        url: "/activites-compte/solde-ads",
        method: "GET",
        params,
      }),
      providesTags: ["SoldeAdsHistory"],
    }),
  }),
});

export const {
  useGetAdsHistoryQuery,
  useGetTransactionsHistoryQuery,
  useGetComptesProQuery,
  useGetSoldeAdsHistoryQuery,
} = accountActivityApi;
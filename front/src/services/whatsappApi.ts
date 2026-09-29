import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "../utils/cookies";
import { ApiBaseUrl } from "../constants/publicConstants";
import type {
  WhatsappAudience,
  WhatsappLangue,
  WhatsappStatut,
} from "../components/dashboard/Whatsapp/whatsappTypes";

export interface WhatsappTemplateApi {
  id: number;
  nom: string;
  description: string;
  message: string;
  audiences: WhatsappAudience[];
  type_id: number | null;
  /** Slug du type (« relance », « paiement »…). */
  usage: string | null;
  usage_label: string | null;
  usage_color: string | null;
  langue: WhatsappLangue;
  statut: WhatsappStatut;
  updated_at: string | null;
  updated_by: string;
  /** Présent uniquement sur /carte/{id} : message variables déjà remplacées. */
  message_rendu?: string;
}

export interface TemplatesPourCarteResponse {
  status: string;
  data: {
    /** Déduite de la carte par le backend, jamais envoyée par le front. */
    audience: WhatsappAudience;
    destinataire: {
      nom: string | null;
      telephone: string | null;
    };
    variables: Record<string, string | null>;
    templates: WhatsappTemplateApi[];
  };
}

export interface WhatsappTypeApi {
  id: number;
  name: string;
  slug: string;
  color: string;
}

export interface WhatsappCreateDataResponse {
  status: string;
  data: {
    types: WhatsappTypeApi[];
    audiences: WhatsappAudience[];
    langues: WhatsappLangue[];
  };
}

export interface WhatsappTemplateApiPayload {
  nom: string;
  description?: string | null;
  message: string;
  type_id: number;
  langue?: WhatsappLangue;
  statut?: WhatsappStatut;
  audiences: WhatsappAudience[];
}

export const whatsappApi = createApi({
  reducerPath: "whatsappApi",
  baseQuery: fetchBaseQuery({
    baseUrl: ApiBaseUrl,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = getCookie("TOKEN");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Accept", "application/json");
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

  tagTypes: ["WhatsappTemplates", "WhatsappCreateData"],

  endpoints: (builder) => ({
    getWhatsappTemplates: builder.query<
      { status: string; data: WhatsappTemplateApi[] },
      { statut?: string; langue?: string; audience?: string } | void
    >({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params?.statut) qs.set("statut", params.statut);
        if (params?.langue) qs.set("langue", params.langue);
        if (params?.audience) qs.set("audience", params.audience);
        const suffixe = qs.toString();
        return `/whatsapp/templates${suffixe ? `?${suffixe}` : ""}`;
      },
      providesTags: ["WhatsappTemplates"],
    }),

    getWhatsappCreateData: builder.query<WhatsappCreateDataResponse, void>({
      query: () => "/whatsapp/templates/create-data",
      providesTags: ["WhatsappCreateData"],
    }),

    /**
     * Templates proposés pour une carte du pipeline. Le backend déduit
     * l'audience de la carte et renvoie les messages déjà personnalisés.
     */
    getTemplatesPourCarte: builder.query<TemplatesPourCarteResponse, number>({
      query: (cardId) => `/whatsapp/templates/carte/${cardId}`,
      providesTags: ["WhatsappTemplates"],
    }),

    createWhatsappTemplate: builder.mutation<
      { status: string; message: string; data: WhatsappTemplateApi },
      WhatsappTemplateApiPayload
    >({
      query: (body) => ({
        url: "/whatsapp/templates",
        method: "POST",
        body,
      }),
      invalidatesTags: ["WhatsappTemplates"],
    }),

    updateWhatsappTemplate: builder.mutation<
      { status: string; message: string; data: WhatsappTemplateApi },
      WhatsappTemplateApiPayload & { id: number }
    >({
      query: ({ id, ...body }) => ({
        url: `/whatsapp/templates/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["WhatsappTemplates"],
    }),

    deleteWhatsappTemplate: builder.mutation<{ status: string; message: string }, number>({
      query: (id) => ({
        url: `/whatsapp/templates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["WhatsappTemplates"],
    }),
  }),
});

export const {
  useGetWhatsappTemplatesQuery,
  useGetWhatsappCreateDataQuery,
  useGetTemplatesPourCarteQuery,
  useCreateWhatsappTemplateMutation,
  useUpdateWhatsappTemplateMutation,
  useDeleteWhatsappTemplateMutation,
} = whatsappApi;

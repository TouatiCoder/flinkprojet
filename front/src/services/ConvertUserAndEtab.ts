import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie } from '../utils/cookies';
import { ApiBaseUrl } from '../constants/publicConstants';

export interface ConvertUserPayload {
  user_id: number;
  objectives: string[];
  solde_compte_pro?: number | null;
  solde_ads?: number | null;
}

export interface ConvertEtabPayload {
  etablissement_id: number;
  objectives: string[];
  solde_ads?: number | null;
  solde_renouvellement?: number | null;
}

export interface ConvertApiResponse {
  status: string;
  message: string;
  data: {
    card_id: number;
    user_id?: number;
    etablissement_id?: number;
  };
}

export const convertUserAndEtabApi = createApi({
  reducerPath: 'convertUserAndEtabApi',
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
    convertUser: builder.mutation<ConvertApiResponse, ConvertUserPayload>({
      query: (data) => ({
        url: '/pipeline/convert-user',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Pipeline'],
    }),

    convertEtab: builder.mutation<ConvertApiResponse, ConvertEtabPayload>({
      query: (data) => ({
        url: '/pipeline/convert-etab',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Pipeline'],
    }),
  }),
});

export const {
  useConvertUserMutation,
  useConvertEtabMutation,
} = convertUserAndEtabApi;
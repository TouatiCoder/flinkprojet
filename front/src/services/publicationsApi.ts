import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User } from './usersApi';
import { Etablissement } from './etablissementsApi';
import { getCookie } from '../utils/cookies';
import { ApiBaseUrl } from '../constants/publicConstants';
import { CustomItem } from '../components/buttons/ModalButtonUpdatePublication';
import { Tag } from './tagsApi';

// Define a TypeScript type for the post data
export interface Publication {
  id: number;
  slug: string;
  is_marketplace:boolean;
  tele: string;
  tele_whatsapp: string;
  image_default:string;
  status:number;
  score:number;
  user: User;
  etablissement: Etablissement;
  tags: Tag[];
  created_at: string;
}
interface ApiResponse {
  data: {
    current_page: number;
    data: Publication[];
    links:[];
    total:number;
    per_page: number;
  };
}
interface UpdatePublicationRequest {
  publicationId: string;
  status: string;
  rejectReason: string;
  isMarketplace: boolean;
  tags: (Tag | CustomItem)[];
}

interface ApiUpdateResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// Create an API slice
export const publicationsApi = createApi({
  reducerPath: 'publicationsApi',
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
    
  }), // Example API URL
  
  endpoints: (builder) => ({
    getPublications: builder.query<ApiResponse, {page: number, order:string, status:string}>({
      query: ({page, order, status}) => {
        return `publications?page=${page}&order=${order}&status=${status}` // Endpoint for fetching posts
      } 
    }),
    updatePublication: builder.mutation<ApiUpdateResponse, UpdatePublicationRequest>({
      query: (body) => ({
        url: 'update/publication',
        method: 'PUT',
        body,
      }),
    }),
    deletePublication: builder.mutation<ApiUpdateResponse, String>({
      query: (publicationId) => ({
        url: `delete/publication/${publicationId}`,
        method: 'DELETE',
      }),
    }),
  }),
});

// Export hooks for using the query in components
export const { useGetPublicationsQuery, useUpdatePublicationMutation, useDeletePublicationMutation } = publicationsApi;

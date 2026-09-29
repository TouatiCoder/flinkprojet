import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "../utils/cookies";
import { ApiBaseUrl } from "../constants/publicConstants";

// Define a TypeScript type for the post data
export interface Tag {
  id: number;
  name: string;
  slug: string;
  status: number;
  compteur_search: number;
  compteur_publications: number;
  total_pub_compteur?: number; // Total publication count
  master: number | null; // Parent tag ID (null if root/top-level tag)
  master_tag?: {
    id: number;
    name: string;
    slug: string;
    mngr_is_index?: number;
  } | null; // Master tag info (name, slug, and mngr_is_index)
  parents?: Tag[]; // Array of parent tags in hierarchy order (from root to immediate parent)
  mngr_is_index?: number | boolean; // Manager index flag (0=No, 1=Yes, 2=301 Redirect)
  canonical_parent?: number | boolean; // Is parent canonical flag
  created_at: string;
  updated_at: string;
}
interface ApiResponse {
  data: {
    current_page: number;
    data: Tag[];
    links: [];
    total: number;
    per_page: number;
  };
}

interface UpdateTagRequest {
  tagId: string;
  name: string;
  slug: string;
  status: string;
  master: number | null; // Parent tag ID (null if no parent)
  mngr_is_index?: string | number; // Manager index (0, 1, or 2)
  canonical_parent?: string | number; // Is parent canonical (0 or 1)
}

interface ToggleTagFieldRequest {
  tagId: string;
  field: "mngr_is_index" | "canonical_parent";
  value: string | number; // 0, 1, or 2
}

interface ApiUpdateResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// Create an API slice
export const tagsApi = createApi({
  reducerPath: "tagsApi",
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
      if (response.status === 403 && window.location.pathname !== '/403') {
        window.location.href = '/403';
      }
      return response.json();
    },
    
  }), // Example API URL
  endpoints: (builder) => ({
    getTags: builder.query<
      ApiResponse,
      {
        page: number;
        order: string;
        status: string;
        search?: string;
        exact?: boolean;
      }
    >({
      query: ({ page, order, status, search, exact }) => {
        const searchParam = search
          ? `&search=${encodeURIComponent(search)}`
          : "";
        const exactParam = exact ? `&exact=1` : "";
        console.log(
          `get_tags?page=${page}&order=${order}&status=${status}${searchParam}${exactParam}`
        );
        return `get_tags?page=${page}&order=${order}&status=${status}${searchParam}${exactParam}`;
      },
    }),
    updateTag: builder.mutation<ApiUpdateResponse, UpdateTagRequest>({
      query: (body) => ({
        url: "update/tag",
        method: "PUT",
        body,
      }),
    }),
    toggleTagField: builder.mutation<ApiUpdateResponse, ToggleTagFieldRequest>({
      query: (body) => ({
        url: "toggle/tag",
        method: "PUT",
        body,
      }),
    }),
    deleteTag: builder.mutation<ApiUpdateResponse, String>({
      query: (tagId) => ({
        url: `delete/tag/${tagId}`,
        method: "DELETE",
      }),
    }),
  }),
});

// Export hooks for using the query in components
export const {
  useGetTagsQuery,
  useUpdateTagMutation,
  useToggleTagFieldMutation,
  useDeleteTagMutation,
} = tagsApi;

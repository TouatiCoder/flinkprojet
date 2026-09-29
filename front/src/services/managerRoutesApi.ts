import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie } from '../utils/cookies';
// import { ApiBaseUrl } from '../constants/publicConstants';
import { ApiBaseUrlM } from '../constants/publicConstants';


export interface ManagerRoutesResponse {
  status: string;
  data: string[];
}

export interface CreateRoutePayload {
  name: string;
}

export const managerRoutesApi = createApi({
  reducerPath: 'managerRoutesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: ApiBaseUrlM,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = getCookie("TOKEN");
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['ManagerRoutes'],
  endpoints: (builder) => ({

    getManagerRoutes: builder.query<ManagerRoutesResponse, void>({
      query: () => 'manager-routes',
      providesTags: ['ManagerRoutes'],
    }),

    addManagerRoute: builder.mutation<any, CreateRoutePayload>({
      query: (newRoute) => ({
        url: 'manager-routes',
        method: 'POST',
        body: newRoute,
      }),
      invalidatesTags: ['ManagerRoutes'],
    }),

  }),
});

export const { 
  useGetManagerRoutesQuery, 
  useAddManagerRouteMutation 
} = managerRoutesApi;
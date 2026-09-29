import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiBaseUrl } from '../constants/publicConstants';
// Define a TypeScript type for the post data
interface LoginResponse {
    token: string;
  }
  
  interface LoginRequest {
    username: string;
    password: string;
  }

// Create an API slice
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: ApiBaseUrl }), // Example API URL
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
        query: (credentials) => ({
            url: 'login',
            method: 'POST',
            body: credentials,
        }),
    }),
  }),
});

// Export hooks for using the query in components
export const { useLoginMutation  } = authApi;

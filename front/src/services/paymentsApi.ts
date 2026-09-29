import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie } from '../utils/cookies';
import { ApiBaseUrl } from '../constants/publicConstants';
import { PaymentStatusCode } from './Paymentstatus';

export interface PaymentItem {
  id: string;
  orderDate: string;
  paymentDate: string;
  paymentTime: string;
  reference: string;
  client: string;
  accountType: string;
  product: string;
  amount: number;
  devise: string;
  status: PaymentStatusCode;
  invoice: string | null;
}

export interface PaymentStats {
  totalAmount: number;
  validatedAmount: number;
  validatedPercent: number;
  pendingAmount: number;
  pendingPercent: number;
  refusedAmount: number;
  refusedPercent: number;
  count: number;
}

export interface PaymentListResponse {
  data: PaymentItem[];
  products: string[];
  stats: PaymentStats;
}

export interface UpdatePaymentStatusRequest {
  id: string;
  status: PaymentStatusCode;
}

export interface UpdatePaymentStatusResponse {
  id: string;
  status: PaymentStatusCode;
  message: string;
}

export const paymentsApi = createApi({
  reducerPath: 'paymentsApi',
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

  tagTypes: ['Payments'],

  endpoints: (builder) => ({
    getPayments: builder.query<PaymentListResponse, void>({
      query: () => '/payments',
      providesTags: ['Payments'],
    }),

    updatePaymentStatus: builder.mutation<UpdatePaymentStatusResponse, UpdatePaymentStatusRequest>({
      query: ({ id, status }) => ({
        url: `/payments/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      // Refetches the list so amounts/stats stay in sync with the new status
      invalidatesTags: ['Payments'],
    }),
  }),
});

export const { useGetPaymentsQuery, useUpdatePaymentStatusMutation } = paymentsApi;
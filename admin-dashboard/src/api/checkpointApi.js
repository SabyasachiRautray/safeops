import { baseApi } from "./baseApi";

export const checkpointApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    history: b.query({ query: () => "/checkpoint/history", providesTags: ["history"] }),
    verify: b.mutation({
      query: (formData) => ({ url: "/checkpoint/verify", method: "POST", body: formData }),
      invalidatesTags: ["history", "stats", "incidents", "zones"],
    }),
    monitorFrame: b.mutation({
      query: (formData) => ({ url: "/monitor/frame", method: "POST", body: formData }),
      invalidatesTags: ["incidents", "zones", "stats"],
    }),
  }),
});
export const { useHistoryQuery, useVerifyMutation, useMonitorFrameMutation } = checkpointApi;

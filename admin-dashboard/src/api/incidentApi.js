import { baseApi } from "./baseApi";

export const incidentApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    incidents: b.query({ query: () => "/incidents", providesTags: ["incidents"] }),
    createIncident: b.mutation({
      query: (body) => ({ url: "/incidents", method: "POST", body }),
      invalidatesTags: ["incidents", "zones", "stats"],
    }),
    incidentAction: b.mutation({
      query: ({ id, action }) => ({ url: `/incidents/${id}/${action}`, method: "POST" }),
      invalidatesTags: ["incidents", "zones", "stats"],
    }),
  }),
});
export const { useIncidentsQuery, useCreateIncidentMutation, useIncidentActionMutation } = incidentApi;

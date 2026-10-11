import { baseApi } from "./baseApi";

// Generic CRUD for plants / zones / cameras / users:  useListQuery("zones"), useSaveMutation(), ...
export const resourceApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    list: b.query({ query: (res) => `/${res}`, providesTags: (r, e, res) => [res] }),
    save: b.mutation({
      query: ({ res, id, body }) => ({ url: id ? `/${res}/${id}` : `/${res}`, method: id ? "PUT" : "POST", body }),
      invalidatesTags: (r, e, { res }) => [res, "stats"],
    }),
    remove: b.mutation({
      query: ({ res, id }) => ({ url: `/${res}/${id}`, method: "DELETE" }),
      invalidatesTags: (r, e, { res }) => [res, "stats"],
    }),
  }),
});
export const { useListQuery, useSaveMutation, useRemoveMutation } = resourceApi;

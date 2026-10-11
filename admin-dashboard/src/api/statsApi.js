import { baseApi } from "./baseApi";

export const statsApi = baseApi.injectEndpoints({
  endpoints: (b) => ({ stats: b.query({ query: () => "/stats", providesTags: ["stats"] }) }),
});
export const { useStatsQuery } = statsApi;

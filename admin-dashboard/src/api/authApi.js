import { baseApi } from "./baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    login: b.mutation({ query: (body) => ({ url: "/auth/login", method: "POST", body }) }),
  }),
});
export const { useLoginMutation } = authApi;

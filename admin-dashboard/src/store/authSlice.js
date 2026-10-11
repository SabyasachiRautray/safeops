import { createSlice } from "@reduxjs/toolkit";

const saved = JSON.parse(localStorage.getItem("safeops") || "null");

const authSlice = createSlice({
  name: "auth",
  initialState: saved || { token: null, user: null },
  reducers: {
    setAuth: (_, { payload }) => {
      localStorage.setItem("safeops", JSON.stringify(payload));
      return payload;
    },
    logout: () => {
      localStorage.removeItem("safeops");
      return { token: null, user: null };
    },
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;

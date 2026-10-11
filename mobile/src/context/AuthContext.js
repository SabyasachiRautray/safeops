import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as SecureStore from "expo-secure-store";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null); // { token, user }
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await SecureStore.getItemAsync("session");
      if (s) setSession(JSON.parse(s));
      setReady(true);
    })();
  }, []);

  const login = useCallback(async (s) => {
    await SecureStore.setItemAsync("session", JSON.stringify(s));
    setSession(s);
  }, []);
  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync("session");
    setSession(null);
  }, []);

  return <AuthContext.Provider value={{ session, ready, login, logout }}>{children}</AuthContext.Provider>;
}

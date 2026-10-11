import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import { colors as C } from "../theme/colors";
import { st } from "../theme/styles";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("ravi@safeops.com");
  const [password, setPassword] = useState("worker123");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const go = async () => {
    setBusy(true); setErr("");
    try { await login(await api("/auth/login", null, { method: "POST", body: JSON.stringify({ email, password }) })); }
    catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <View style={[st.center, { backgroundColor: C.bg, padding: 24 }]}>
      <Text style={{ fontSize: 44 }}>🛡️</Text>
      <Text style={{ fontSize: 26, fontWeight: "800", color: C.green }}>SafeOps ID</Text>
      <TextInput style={st.input} value={email} onChangeText={setEmail} autoCapitalize="none" placeholder="Email" />
      <TextInput style={st.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" />
      {!!err && <Text style={{ color: C.red, marginTop: 8 }}>{err}</Text>}
      <Button title={busy ? "…" : "Sign in"} onPress={go} disabled={busy} style={{ width: "100%" }} />
    </View>
  );
}

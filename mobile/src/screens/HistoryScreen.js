import React, { useEffect, useState } from "react";
import { ScrollView, View, Text } from "react-native";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { colors as C } from "../theme/colors";
import { st } from "../theme/styles";

export default function HistoryScreen() {
  const { session } = useAuth();
  const [rows, setRows] = useState([]);
  useEffect(() => { api("/checkpoint/history", session.token).then(setRows).catch(() => {}); }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={st.h}>My recent checks</Text>
      {rows.map((r) => (
        <View key={r.id} style={[st.card, { marginTop: 10, padding: 14, alignItems: "flex-start" }]}>
          <Text style={{ fontWeight: "700", color: r.decision === "allowed" ? C.green : C.red }}>
            {r.decision.toUpperCase()} · {r.Zone?.name}
          </Text>
          <Text style={{ color: C.sub, fontSize: 12 }}>{r.reason} — {new Date(r.createdAt).toLocaleString()}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

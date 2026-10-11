import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import IdCardScreen from "../screens/IdCardScreen";
import SelfCheckScreen from "../screens/SelfCheckScreen";
import HistoryScreen from "../screens/HistoryScreen";
import { colors as C } from "../theme/colors";

const TABS = [
  { key: "id", label: "Profile", Screen: IdCardScreen },
  { key: "check", label: "Check", Screen: SelfCheckScreen },
  { key: "log", label: "History", Screen: HistoryScreen },
];

export default function MainTabs() {
  const { logout } = useAuth();
  const [tab, setTab] = useState("id");
  const Active = TABS.find((item) => item.key === tab).Screen;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}><Active /></View>
      <View style={s.bar}>
        {TABS.map((item) => (
          <TouchableOpacity key={item.key} style={s.tab} onPress={() => setTab(item.key)}>
            <Text style={{ fontSize: 12, fontWeight: tab === item.key ? "800" : "500", color: tab === item.key ? C.green : C.sub }}>{item.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={s.tab} onPress={logout}><Text style={{ color: C.sub, fontSize: 12 }}>Logout</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", borderTopWidth: 1, borderColor: C.line, backgroundColor: "#fff" },
  tab: { flex: 1, alignItems: "center", paddingVertical: 16 },
});

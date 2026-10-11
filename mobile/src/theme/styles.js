import { StyleSheet } from "react-native";
import { colors as C } from "./colors";

export const st = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  h: { fontSize: 22, fontWeight: "800", color: C.text },
  input: { width: "100%", backgroundColor: "#fff", borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 14, marginTop: 12 },
  card: { backgroundColor: C.card, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: C.line, alignItems: "center", width: "100%" },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.line, marginRight: 8, backgroundColor: "#fff" },
});

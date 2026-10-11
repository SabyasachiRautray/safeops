import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import { colors as C } from "../theme/colors";
import { st } from "../theme/styles";

export default function SelfCheckScreen() {
  const { session } = useAuth();
  const [zones, setZones] = useState([]);
  const [zoneId, setZoneId] = useState(null);
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api("/zones", session.token)
      .then((z) => { setZones(z); setZoneId(session.user.zoneId || z[0]?.id); })
      .catch(() => {});
  }, []);

  const run = async (pick) => {
    const r = await pick({ mediaTypes: ["images", "videos"], quality: 0.7, videoMaxDuration: 5 });
    if (r.canceled) return;
    const a = r.assets[0];
    const fd = new FormData();
    fd.append("file", {
      uri: a.uri,
      name: a.fileName || (a.type === "video" ? "check.mp4" : "check.jpg"),
      type: a.mimeType || (a.type === "video" ? "video/mp4" : "image/jpeg"),
    });
    fd.append("zoneId", String(zoneId));
    setBusy(true); setRes(null);
    try { setRes(await api("/checkpoint/verify", session.token, { method: "POST", body: fd })); }
    catch (e) { setRes({ decision: "denied", reason: e.message }); }
    finally { setBusy(false); }
  };
  const camera = async () => {
    const p = await ImagePicker.requestCameraPermissionsAsync();
    if (p.granted) run(ImagePicker.launchCameraAsync);
  };

  const zone = zones.find((x) => x.id === zoneId);
  const ok = res?.decision === "allowed";

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={st.h}>Zone entry check</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
        {zones.map((x) => (
          <TouchableOpacity key={x.id} onPress={() => setZoneId(x.id)} style={[st.chip, zoneId === x.id && { backgroundColor: C.green, borderColor: C.green }]}>
            <Text style={{ color: zoneId === x.id ? "#fff" : C.text }}>{x.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {zone && (
        <View style={st.card}>
          <Text style={{ fontWeight: "700" }}>Safety rules for {zone.name}</Text>
          <Text style={{ color: C.sub, marginTop: 6 }}>Required PPE: {(zone.requiredPpe || []).join(", ") || "none"}</Text>
          {zone.status === "alert" && <Text style={{ color: C.red, fontWeight: "700", marginTop: 6 }}>⚠ Zone under emergency lockdown</Text>}
        </View>
      )}

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button title="📷 Take photo" onPress={camera} style={{ flex: 1 }} />
        <Button title="Upload" onPress={() => run(ImagePicker.launchImageLibraryAsync)} color={C.dark} style={{ flex: 1 }} />
      </View>

      {busy && <ActivityIndicator style={{ marginTop: 24 }} />}
      {res && (
        <View style={[st.card, { marginTop: 20, backgroundColor: ok ? "#ecfdf5" : "#fef2f2" }]}>
          <Text style={{ fontSize: 28, fontWeight: "800", color: ok ? C.green : C.red }}>{ok ? "✅ ACCESS GRANTED" : "⛔ ACCESS DENIED"}</Text>
          <Text style={{ marginTop: 6 }}>{res.reason}</Text>
          {!!res.missing?.length && <Text style={{ color: C.red, marginTop: 6 }}>Missing: {res.missing.join(", ")}</Text>}
          {!!res.unverified?.length && <Text style={{ color: C.amber, marginTop: 6 }}>Not clearly visible: {res.unverified.join(", ")}</Text>}
          {res.annotated && (
            <Image source={{ uri: `data:image/jpeg;base64,${res.annotated}` }} style={{ width: "100%", height: 220, borderRadius: 12, marginTop: 12 }} resizeMode="cover" />
          )}
        </View>
      )}
    </ScrollView>
  );
}

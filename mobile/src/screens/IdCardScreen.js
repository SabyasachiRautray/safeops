import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { colors as C } from "../theme/colors";
import { st } from "../theme/styles";

export default function IdCardScreen() {
  const { session } = useAuth();
  const [badge, setBadge] = useState(null);
  const [me, setMe] = useState(null);
  const [showQr, setShowQr] = useState(false);

  const loadBadge = useCallback(async () => {
    try { setBadge((await api("/auth/badge", session.token)).badgeToken); } catch {}
  }, [session.token]);

  useEffect(() => {
    api("/auth/me", session.token).then(setMe).catch(() => {});
    loadBadge();
    const timer = setInterval(loadBadge, 60000);
    return () => clearInterval(timer);
  }, [loadBadge, session.token]);

  const user = me?.user || me || session.user;
  const zone = me?.zone || user?.Zone;
  const plant = me?.plant || user?.Plant;
  const emergency = zone?.status === "alert";
  const permissionColor = emergency ? C.red : C.amber;

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 28 }}>
      <Text style={{ color: C.green, fontSize: 12, fontWeight: "800", letterSpacing: 1.4, marginBottom: 6 }}>SAFEOPS · WORKER ID</Text>
      <Text style={st.h}>Your profile</Text>

      <View style={[st.card, { alignItems: "flex-start", marginTop: 18, padding: 20 }]}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: "#d1fae5", alignItems: "center", justifyContent: "center", marginRight: 14 }}>
            <Text style={{ color: C.green, fontWeight: "800", fontSize: 21 }}>{(user?.name || "W").trim().charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontSize: 21, fontWeight: "800" }}>{user?.name || "Worker"}</Text>
            <Text style={{ color: C.sub, marginTop: 3 }}>{user?.role || "Employee"}</Text>
          </View>
        </View>
        <InfoRow label="Employee ID" value={user?.employeeCode || "Not available"} />
        <InfoRow label="Plant" value={plant?.name || "Not assigned"} />
        <InfoRow label="Assigned zone" value={zone?.name || "Not assigned"} last />
      </View>

      <View style={{ backgroundColor: emergency ? "#fef2f2" : "#fffbeb", borderColor: emergency ? "#fecaca" : "#fde68a", borderWidth: 1, borderRadius: 16, padding: 17, marginTop: 14 }}>
        <Text style={{ color: permissionColor, fontWeight: "800", fontSize: 15 }}>{emergency ? "ENTRY NOT ALLOWED" : "ENTRY STATUS · CHECK REQUIRED"}</Text>
        <Text style={{ color: C.text, marginTop: 6, lineHeight: 20 }}>
          {emergency ? "Your assigned zone is under emergency alert. Follow site instructions and do not enter." : "Complete the safety check at the gate. Entry is allowed only after the checkpoint approves you."}
        </Text>
      </View>

      <TouchableOpacity onPress={() => setShowQr((current) => !current)} activeOpacity={0.85} style={{ backgroundColor: C.green, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 18 }}>
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>{showQr ? "Hide entry QR" : "Show entry QR"}</Text>
      </TouchableOpacity>

      {showQr && (
        <View style={[st.card, { marginTop: 14, paddingVertical: 24 }]}>
          <Text style={{ color: C.text, fontSize: 16, fontWeight: "800", marginBottom: 18 }}>Your secure badge</Text>
          {badge ? <QRCode value={badge} size={210} /> : <ActivityIndicator color={C.green} />}
          <Text style={{ color: C.sub, fontSize: 12, marginTop: 16, textAlign: "center", lineHeight: 18 }}>Show this code at the zone gate camera. It refreshes every minute.</Text>
        </View>
      )}
    </ScrollView>
  );
}

function InfoRow({ label, value, last }) {
  return (
    <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderTopWidth: 1, borderTopColor: C.line }}>
      <Text style={{ color: C.sub }}>{label}</Text>
      <Text style={{ color: C.text, fontWeight: "700", maxWidth: "58%", textAlign: "right" }}>{value}</Text>
    </View>
  );
}

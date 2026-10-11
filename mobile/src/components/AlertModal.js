import React from "react";
import { Modal, View, Text } from "react-native";
import Button from "./Button";
import { colors as C } from "../theme/colors";
import { st } from "../theme/styles";

// Full-screen red emergency screen shown while the siren is playing.
export default function AlertModal({ alert, onSilence }) {
  return (
    <Modal visible={!!alert} animationType="fade" onRequestClose={() => {}}>
      <View style={[st.center, { backgroundColor: C.red, padding: 24 }]}>
        <Text style={{ fontSize: 72 }}>🚨</Text>
        <Text style={{ color: "#fff", fontSize: 30, fontWeight: "800", textAlign: "center" }}>EMERGENCY</Text>
        <Text style={{ color: "#fff", fontSize: 18, textAlign: "center", marginVertical: 16 }}>{alert?.message}</Text>
        <Text style={{ color: "#fecaca", textAlign: "center" }}>Zone: {alert?.zoneName}. Leave via the nearest exit.</Text>
        <Button title="Silence siren (stay alert)" onPress={onSilence} color="#fff" textColor={C.red} style={{ marginTop: 32 }} />
      </View>
    </Modal>
  );
}

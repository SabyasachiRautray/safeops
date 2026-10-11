import React from "react";
import { View, ActivityIndicator, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import useAlertSocket from "./src/hooks/useAlertSocket";
import LoginScreen from "./src/screens/LoginScreen";
import MainTabs from "./src/navigation/MainTabs";
import AlertModal from "./src/components/AlertModal";
import { colors as C } from "./src/theme/colors";
import { st } from "./src/theme/styles";

function Root() {
  const { session, ready } = useAuth();
  const { alert, silence } = useAlertSocket(session?.token); // realtime siren

  if (!ready) return <View style={st.center}><ActivityIndicator /></View>;
  if (!session) return <LoginScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style="dark" />
      <MainTabs />
      <AlertModal alert={alert} onSilence={silence} />
    </SafeAreaView>
  );
}

export default function App() {
  return <AuthProvider><Root /></AuthProvider>;
}

import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { colors as C } from "../theme/colors";

export default function Button({ title, onPress, color = C.green, disabled, style, textColor = "#fff" }) {
  return (
    <TouchableOpacity
      onPress={onPress} disabled={disabled}
      style={[{ backgroundColor: color, borderRadius: 12, padding: 15, alignItems: "center", marginTop: 12, opacity: disabled ? 0.6 : 1 }, style]}
    >
      <Text style={{ color: textColor, fontWeight: "700" }}>{title}</Text>
    </TouchableOpacity>
  );
}

import React from "react";
import { Text, View } from "react-native";
import { dark } from "yep/themes";

export function DetailsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text
        style={{
          color: dark.text,
          fontFamily: "Manrope-ExtraBold",
          fontSize: 25,
        }}
      >
        Details!
      </Text>
    </View>
  );
}

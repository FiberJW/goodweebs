import { yellowDarkA } from "@radix-ui/colors";
import React from "react";
import { StyleSheet, Platform, View, Text } from "react-native";

import { black } from "yep/colors";
import { Manrope } from "yep/typefaces";

type EpisodesBehindProps = {
  count: number;
};

export function EpisodesBehind({ count }: EpisodesBehindProps) {
  if (count <= 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: yellowDarkA.yellowA10,
    borderRadius: 4,
    height: 16,
    justifyContent: "center",
    left: -4,
    position: "absolute",
    shadowColor: yellowDarkA.yellowA11,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 4,
    top: -4,
    width: 20,
  },
  text: {
    color: black,
    fontFamily: Manrope.semiBold,
    fontSize: 10,
    marginTop: Platform.OS === "android" ? -1 : undefined,
    textAlign: "center",
    textAlignVertical: "center",
  },
});

import React from "react";
import { StyleSheet, View, ViewStyle, Text, Image } from "react-native";

import { Button } from "yep/components/Button";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

interface Properties {
  style?: ViewStyle;
  title: string;
  description: string;
  cta?: { label: string; onPress: () => void };
}

export function EmptyState({ title, description, style, cta }: Properties) {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={require("yep/assets/icons/muted-logo.png")}
        resizeMode="contain"
        style={styles.icon}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {cta ? <Button {...cta} containerStyle={styles.cta} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 16,
    width: "100%",
  },
  cta: { alignSelf: "stretch" },
  description: {
    color: darkTheme.subText,
    fontFamily: Manrope.regular,
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  icon: {
    marginBottom: 24,
    width: 80,
  },
  title: {
    color: darkTheme.text,
    fontFamily: Manrope.semiBold,
    fontSize: 20,
    marginBottom: 16,
    textAlign: "center",
  },
});

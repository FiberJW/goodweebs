import React from "react";
import { StyleSheet, View, ViewStyle, Text } from "react-native";
import { takimoto } from "yep/takimoto";
import { Button } from "yep/components/Button";

type Props = {
  style?: ViewStyle;
  title: string;
  description: string;
  cta?: { label: string; onPress: () => void };
};

export function EmptyState({ title, description, style, cta }: Props) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {cta ? <Button {...cta} /> : null}
    </View>
  );
}

const SugeKnight = takimoto.Image({
  height: 112,
  width: 112,
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  title: {},
  description: {},
});

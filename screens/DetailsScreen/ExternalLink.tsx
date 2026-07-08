import React from "react";
import { Linking, StyleSheet, Text } from "react-native";

import { PressableOpacity } from "yep/components/PressableOpacity";
import { graphql, readFragment } from "yep/graphql/tada";
import type { FragmentOf } from "yep/graphql/tada";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

export const MediaExternalLinkData = graphql(`
  fragment MediaExternalLinkData on MediaExternalLink {
    id
    url
    site
    type
  }
`);

type Props = {
  link: FragmentOf<typeof MediaExternalLinkData>;
};

export function ExternalLink({ link }: Props) {
  const { url, site } = readFragment(MediaExternalLinkData, link);

  return (
    <PressableOpacity
      style={styles.row}
      onPress={() => {
        if (url) Linking.openURL(url);
      }}
    >
      <Text numberOfLines={1} style={styles.site}>
        {site}
      </Text>
      <Text style={styles.chevron}>›</Text>
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  site: {
    flex: 1,
    fontFamily: Manrope.semiBold,
    fontSize: 15,
    color: darkTheme.text,
  },
  chevron: {
    fontFamily: Manrope.regular,
    fontSize: 20,
    color: darkTheme.subHeader,
  },
});

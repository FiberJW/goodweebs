import { fbs } from "fbtee";
import React from "react";
import { Linking, StyleSheet, Text, View } from "react-native";

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

type Link = FragmentOf<typeof MediaExternalLinkData>;

function ExternalLink({ link }: { link: Link }) {
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

const EXTERNAL_LINK_GROUPS = [
  {
    type: "STREAMING",
    label: () => fbs("Watch", "Streaming links group label"),
  },
  { type: "INFO", label: () => fbs("Info", "Info links group label") },
  { type: "SOCIAL", label: () => fbs("Social", "Social links group label") },
] as const;

export function ExternalLinksSection({
  links,
  isManga,
}: {
  links?: Link[];
  isManga: boolean;
}) {
  if (!links?.length) return null;

  // AniList classifies every link as STREAMING / INFO / SOCIAL; null falls to Info.
  const groups = EXTERNAL_LINK_GROUPS.flatMap((group) => {
    const items = links.filter(
      (link) =>
        (readFragment(MediaExternalLinkData, link).type ?? "INFO") ===
        group.type,
    );
    return items.length > 0 ? [{ ...group, items }] : [];
  });

  return (
    <>
      <View style={{ height: 8 }} />
      {groups.map((group) => (
        <View key={group.type}>
          <Text style={styles.externalLinksGroupLabel}>
            {String(
              group.type === "STREAMING" && isManga
                ? fbs(
                    "Read",
                    "Manga streaming links group label (Watch for anime)",
                  )
                : group.label(),
            )}
          </Text>
          <View style={styles.externalLinksCard}>
            {group.items.map((link, i) => (
              <React.Fragment
                key={readFragment(MediaExternalLinkData, link).id}
              >
                {i > 0 ? <View style={styles.externalLinksDivider} /> : null}
                <ExternalLink link={link} />
              </React.Fragment>
            ))}
          </View>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  externalLinksGroupLabel: {
    color: darkTheme.subHeader,
    fontFamily: Manrope.semiBold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: 16,
    marginBottom: 8,
  },
  externalLinksCard: {
    backgroundColor: darkTheme.listItemBackground,
    borderRadius: 14,
    overflow: "hidden",
  },
  externalLinksDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: darkTheme.listItemBorder,
    marginLeft: 16,
  },
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

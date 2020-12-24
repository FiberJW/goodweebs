import React from "react";
import { Linking, Text } from "react-native";

import {
  crunchyrollOrange,
  twitterBlue,
  funimationPurple,
  vrvYellow,
  huluGreen,
  animeLabPurple,
  youtubeRed,
  netflixRed,
  vizRed,
  hboMaxPink,
  tubiOrange,
} from "yep/colors";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { MediaExternalLinkDataFragment } from "yep/graphql/generated";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

export function ExternalLink({ id, url, site }: MediaExternalLinkDataFragment) {
  let backgroundColor = darkTheme.button;
  let textColor = darkTheme.text;

  switch (site) {
    case "Crunchyroll":
      backgroundColor = crunchyrollOrange;
      break;
    case "Twitter":
      backgroundColor = twitterBlue;
      break;
    case "Funimation":
      backgroundColor = funimationPurple;
      break;
    case "VRV":
      backgroundColor = vrvYellow;
      textColor = darkTheme.textInverted;
      break;
    case "Hulu":
      backgroundColor = huluGreen;
      textColor = darkTheme.textInverted;
      break;
    case "AnimeLab":
      backgroundColor = animeLabPurple;
      break;
    case "Youtube":
      backgroundColor = youtubeRed;
      break;
    case "Netflix":
      backgroundColor = netflixRed;
      break;
    case "Viz":
      backgroundColor = vizRed;
      break;
    case "HBO Max":
      backgroundColor = hboMaxPink;
      break;
    case "Tubi TV":
      backgroundColor = tubiOrange;
      break;
    default:
      // TODO: log what other values are being read somewhere so I can pick those off
      backgroundColor = darkTheme.button;
      break;
  }

  return (
    <PressableOpacity
      style={{
        backgroundColor,
        padding: 16,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
      onPress={() => {
        if (url) Linking.openURL(url);
      }}
      borderRadius={8}
    >
      <Text
        style={{
          fontFamily: Manrope.semiBold,
          fontSize: 16,
          color: textColor,
          textAlign: "center",
        }}
      >
        {site}
      </Text>
    </PressableOpacity>
  );
}

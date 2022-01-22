import React from "react";
import { Linking, Text } from "react-native";
import * as Sentry from "sentry-expo";

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
  hidiveBlue,
} from "yep/colors";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { MediaExternalLinkDataFragment } from "yep/graphql/generated";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

export function ExternalLink({ id, url, site }: MediaExternalLinkDataFragment) {
  let color = darkTheme.iconFill;

  switch (site) {
    case "Crunchyroll":
      color = crunchyrollOrange;
      break;
    case "Twitter":
      color = twitterBlue;
      break;
    case "Funimation":
      color = funimationPurple;
      break;
    case "VRV":
      color = vrvYellow;
      break;
    case "Hulu":
      color = huluGreen;
      break;
    case "AnimeLab":
      color = animeLabPurple;
      break;
    case "Youtube":
      color = youtubeRed;
      break;
    case "Netflix":
      color = netflixRed;
      break;
    case "Viz":
      color = vizRed;
      break;
    case "HBO Max":
      color = hboMaxPink;
      break;
    case "Tubi TV":
      color = tubiOrange;
      break;
    case "Official Site":
      color = darkTheme.iconFill;
      break;
    case "Hidive":
      color = hidiveBlue;
      break;
    default:
      Sentry.Browser.captureMessage(`Unknown external link site: ${site}`);
      color = darkTheme.iconFill;
      break;
  }

  return (
    <PressableOpacity
      style={{
        borderColor: color,
        borderWidth: 1,
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
          color,
          textAlign: "center",
        }}
      >
        {site}
      </Text>
    </PressableOpacity>
  );
}

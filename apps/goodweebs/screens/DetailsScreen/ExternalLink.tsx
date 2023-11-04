import chroma from "chroma-js";
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
  instagramPink,
  disneyPlusBlue,
  tiktokPink,
  maxBlue,
  bilibiliBlue,
  iqGreen,
  starPlusOrange,
  amazonPrimeBlue,
} from "yep/colors";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { MediaExternalLinkDataFragment } from "yep/graphql/generated";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

export function ExternalLink({ url, site }: MediaExternalLinkDataFragment) {
  let color = darkTheme.iconFill;

  switch (site.toUpperCase()) {
    case "CRUNCHYROLL":
      color = crunchyrollOrange;
      break;
    case "TWITTER":
      color = twitterBlue;
      break;
    case "FUNIMATION":
      color = funimationPurple;
      break;
    case "VRV":
      color = vrvYellow;
      break;
    case "HULU":
      color = huluGreen;
      break;
    case "ANIMELAB":
      color = animeLabPurple;
      break;
    case "YOUTUBE":
      color = youtubeRed;
      break;
    case "NETFLIX":
      color = netflixRed;
      break;
    case "VIZ":
      color = vizRed;
      break;
    case "HBO MAX":
      color = hboMaxPink;
      break;
    case "MAX":
      color = maxBlue;
      break;
    case "TIKTOK":
      color = tiktokPink;
      break;
    case "TUBI TV":
    case "TUBI":
      color = tubiOrange;
      break;
    case "OFFICIAL SITE":
      color = "#FFC700";
      break;
    case "HIDIVE":
      color = hidiveBlue;
      break;
    case "INSTAGRAM":
      color = instagramPink;
      break;
    case "DISNEY PLUS":
      color = disneyPlusBlue;
      break;
    case "BILIBILI TV":
    case "BILIBILI":
      color = bilibiliBlue;
      break;
    case "IQ":
      color = iqGreen;
      break;
    case "STAR+":
      color = starPlusOrange;
      break;
    case "ADULT SWIM":
      color = "black";
      break;
    case "AMAZON":
    case "AMAZON PRIME":
    case "AMAZON PRIME VIDEO":
      color = amazonPrimeBlue;
      break;
    default:
      Sentry.Browser.captureMessage(`Unknown external link site: ${site}`);
      color = "gray";
      break;
  }

  return (
    <PressableOpacity
      style={{
        borderWidth: 1,
        borderColor: chroma(color).luminance(0.2).hex(),
        backgroundColor: chroma(color).darken(0.75).hex(),
        paddingVertical: 16,
        paddingHorizontal: 24,
        width: "100%",
      }}
      onPress={() => {
        if (url) Linking.openURL(url);
      }}
      borderRadius={16}
    >
      <Text
        style={{
          fontFamily: Manrope.extraBold,
          fontSize: 18,
          color: chroma(color).luminance(0.95).hex(),
        }}
      >
        {site}
      </Text>
      <Text
        numberOfLines={1}
        style={{
          fontFamily: Manrope.semiBold,
          fontSize: 12,
          color: chroma(color).luminance(0.75).hex(),
        }}
      >
        {url}
      </Text>
    </PressableOpacity>
  );
}

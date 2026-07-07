import { yellowDarkA } from "@radix-ui/colors";
import { fbs } from "fbtee";
import React from "react";
import { useWindowDimensions, View } from "react-native";
import RenderHtml from "react-native-render-html";
import showdown from "showdown";

import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

import { Button } from "./Button";

type Props = {
  description: string;
};

const markdownToHtmlConverter = new showdown.Converter();

export function DescriptionRenderer({ description }: Props) {
  const { width } = useWindowDimensions();

  const spoilerRegex = /~!(.*?)!~/gi;

  const hasSpoilers = spoilerRegex.test(description);

  const [showSpoilers, setShowSpoilers] = React.useState(false);

  const html = markdownToHtmlConverter
    .makeHtml(description)
    // Global: a description can hold several spoiler blocks; the previous
    // string-literal replace only unwrapped the first, leaving later blocks
    // with stray <p> tags around the spoiler markers.
    .replace(/<p>~!/g, "~!")
    .replace(/!~<\/p>/g, "!~")
    .replace(
      spoilerRegex,
      showSpoilers
        ? `<p><strong style="color:${yellowDarkA.yellowA9}">${String(
            fbs("Spoiler:", "Spoiler prefix label"),
          )}</strong> $1</p>`
        : ""
    );

  return (
    <View style={{ marginBottom: 16 }}>
      {hasSpoilers && !showSpoilers ? (
        <Button
          label={String(fbs("Show spoilers", "Show spoilers button label"))}
          onPress={() => setShowSpoilers(true)}
          style={{ marginBottom: 8 }}
        />
      ) : null}
      <RenderHtml
        source={{
          html,
        }}
        tagsStyles={tagsStyles}
        contentWidth={width}
      />
    </View>
  );
}

const tagsStyles = {
  p: {
    color: darkTheme.text,
    fontFamily: Manrope.regular,
    fontSize: 16,
  },
  i: {
    color: darkTheme.text,
    fontFamily: Manrope.regular,
    fontSize: 16,
  },
};

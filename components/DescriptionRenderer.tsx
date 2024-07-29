import { yellowDarkA } from "@radix-ui/colors";
import React from "react";
import { useWindowDimensions, View } from "react-native";
import RenderHtml from "react-native-render-html";
import showdown from "showdown";

import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

import { Button } from "./Button";

interface Properties {
  description: string;
}

const markdownToHtmlConverter = new showdown.Converter();

export function DescriptionRenderer({ description }: Properties) {
  const { width } = useWindowDimensions();

  const spoilerRegex = /~!(.*?)!~/gi;

  const hasSpoilers = spoilerRegex.test(description);

  const [showSpoilers, setShowSpoilers] = React.useState(false);

  const html = markdownToHtmlConverter
    .makeHtml(description)
    .replace("<p>~!", "~!")
    .replace("!~</p>", "!~")
    .replaceAll(
      spoilerRegex,
      showSpoilers
        ? `<p><strong style="color:${yellowDarkA.yellowA9}">Spoiler:</strong> $1</p>`
        : ""
    );

  return (
    <View style={{ marginBottom: 16 }}>
      {hasSpoilers && !showSpoilers ? (
        <Button
          label="Show Spoilers"
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

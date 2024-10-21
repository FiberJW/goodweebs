import { yellowDarkA } from "@radix-ui/colors";
import React, { useState } from "react";
import { useWindowDimensions, View } from "react-native";
import RenderHtml from "react-native-render-html";
import { Converter } from "showdown";

import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

import { Button } from "./Button";

type Props = {
  description: string;
};

const markdownToHtmlConverter = new Converter();

export function DescriptionRenderer({ description }: Props) {
  const { width } = useWindowDimensions();

  const spoilerRegex = /~!(.*?)!~/gi;

  const hasSpoilers = spoilerRegex.test(description);

  const [showSpoilers, setShowSpoilers] = useState(false);

  const html = markdownToHtmlConverter
    .makeHtml(description)
    .replace("<p>~!", "~!")
    .replace("!~</p>", "!~")
    .replace(
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

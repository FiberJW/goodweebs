import React from "react";
import { dark } from "yep/themes";
import { takimoto } from "yep/lib/takimoto";

const Container = takimoto.View({
  flex: 1,
  justifyContent: "space-between",
  alignItems: "center",
  padding: 16,
  paddingTop: 88,
});

const Logo = takimoto.Image({
  width: 256,
  height: 159.24,
});

const ButtonGroup = takimoto.View({ width: "100%" });

const ButtonSpacer = takimoto.View({ height: 8 });

const BrandingSpacer = takimoto.View({ height: 16 });

const ButtonTouchable = takimoto.TouchableOpacity({
  backgroundColor: dark.primaryButton,
  padding: 16,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
});

const ButtonLabel = takimoto.Text({
  fontFamily: "Manrope-SemiBold",
  fontSize: 16,
  color: dark.text,
  textAlign: "center",
});

const Tagline = takimoto.Text({
  fontFamily: "Manrope-Regular",
  fontSize: 16,
  color: dark.text,
  textAlign: "center",
  maxWidth: 300,
});

const BrandingGroup = takimoto.View({ alignItems: "center" });

const AniListFootnote = takimoto.Text({
  fontFamily: "Manrope-Regular",
  fontSize: 12.8,
  color: dark.footnote,
  textAlign: "center",
  marginTop: 8,
});

type ButtonProps = {
  label: string;
  onPress: () => void;
};

function Button({ onPress, label }: ButtonProps) {
  return (
    <ButtonTouchable onPress={onPress}>
      <ButtonLabel>{label}</ButtonLabel>
    </ButtonTouchable>
  );
}

export function AuthScreen() {
  return (
    <Container>
      <BrandingGroup>
        <Logo source={require("yep/assets/launch/logo-wrapped-dark.png")} />
        <BrandingSpacer />
        <Tagline>An anime tracking app powered by AniList and Expo.</Tagline>
      </BrandingGroup>
      <ButtonGroup>
        <Button label="Log in" onPress={() => {}} />
        <ButtonSpacer />
        <Button label="Sign up" onPress={() => {}} />
        <AniListFootnote>via AniList</AniListFootnote>
      </ButtonGroup>
    </Container>
  );
}

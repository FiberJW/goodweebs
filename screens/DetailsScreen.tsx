import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";

import { white15 } from "yep/colors";
import { RootStackParamList } from "yep/navigation";
import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";

const Container = takimoto.ScrollView({
  flex: 1,
  padding: 16,
});

const Poster = takimoto.Image({
  height: 186,
  width: 128,
  borderRadius: 4,
  marginRight: 16,
});

const Title = takimoto.Text({
  color: darkTheme.text,
  fontFamily: "Manrope-ExtraBold",
  fontSize: 31.25,
  marginBottom: 16,
});

const AiringText = takimoto.Text({
  color: darkTheme.text,
  fontFamily: "Manrope-Regular",
  fontSize: 12.8,
});

const AiringContainer = takimoto.View({
  width: "100%",
  backgroundColor: darkTheme.navBackground,
  padding: 16,
  borderRadius: 8,
  marginBottom: 16,
});

const InfoRow = takimoto.View({
  flexDirection: "row",
});

const InfoRowSpacer = takimoto.View({
  height: 8,
});

const InfoTable = takimoto.View({
  flex: 1,
});

const InfoContainer = takimoto.View({
  flex: 1,
});

const InfoLabel = takimoto.Text({
  fontFamily: "Manrope-Regular",
  fontSize: 12.8,
  color: darkTheme.text,
  marginBottom: 4,
});

const InfoValue = takimoto.Text({
  fontFamily: "Manrope-SemiBold",
  fontSize: 16,
  color: darkTheme.text,
});

const PosterAndInfoContainer = takimoto.View({
  flexDirection: "row",
  marginBottom: 16,
});

type InfoProps = { label: string; value: string };

function Info({ label, value }: InfoProps) {
  return (
    <InfoContainer>
      <InfoLabel numberOfLines={1}>{label}</InfoLabel>
      <InfoValue numberOfLines={2}>{value}</InfoValue>
    </InfoContainer>
  );
}

const ButtonsRow = takimoto.View({
  flexDirection: "row",
  width: "100%",
  alignItems: "center",
  marginBottom: 16,
});

const ButtonSpacer = takimoto.View({ width: 8 });

const ButtonTouchable = takimoto.TouchableOpacity({
  backgroundColor: white15,
  padding: 8,
  borderRadius: 8,
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
});

const ButtonLabel = takimoto.Text({
  fontSize: 16,
  color: darkTheme.text,
  fontFamily: "Manrope-SemiBold",
  textAlign: "center",
});

const Description = takimoto.Text({
  fontSize: 16,
  color: darkTheme.text,
  fontFamily: "Manrope-Regular",
});

type ButtonProps = { label: string; onPress: () => void };

function Button({ label, onPress }: ButtonProps) {
  return (
    <ButtonTouchable onPress={onPress}>
      <ButtonLabel>{label}</ButtonLabel>
    </ButtonTouchable>
  );
}

type Props = {
  navigation: StackNavigationProp<RootStackParamList>;
};

export function DetailsScreen({ navigation }: Props) {
  return (
    <Container
      showsVerticalScrollIndicator={false}
      alwaysBounceVertical={false}
    >
      <Title numberOfLines={1}>New Game!!</Title>
      <AiringContainer>
        <AiringText>Episode 429 airs in 5 days</AiringText>
      </AiringContainer>
      <PosterAndInfoContainer>
        <Poster
          resizeMode="cover"
          source={{
            uri:
              "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx109020-WRWPZflDSuxa.png",
          }}
        />
        <InfoTable>
          <InfoRow>
            <Info label="Episodes" value="12" />
            <Info label="Genre" value="Slice of Life, Romance, Drama" />
          </InfoRow>
          <InfoRowSpacer />
          <InfoRow>
            <Info label="Score" value="9.3" />
            <Info label="Rank" value="#4" />
          </InfoRow>
        </InfoTable>
      </PosterAndInfoContainer>
      <ButtonsRow>
        <Button label="WATCHING" onPress={() => {}} />
        <ButtonSpacer />
        <Button label="11/23 EP" onPress={() => {}} />
        <ButtonSpacer />
        <Button label="--/10" onPress={() => {}} />
      </ButtonsRow>
      <Description>
        I bought a whole bunch of shungite! Rocks. Do you know what shungite is?
        Anybody know what shungite is? No, not Suge Knight. I think he’s locked
        up in prison. Talking shungite! Anyways, it’s a 2 billion year old..
        like rock, stone that protects against frequencies and unwanted
        frequencies that may be traveling in the air. That's my story, I bought
        a whole bunch of stuff, put them around la casa, little pyramids, stuff
        like that.
      </Description>
    </Container>
  );
}

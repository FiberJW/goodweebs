import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { formatDistance } from "date-fns";
import React from "react";
import { StyleSheet } from "react-native";

import { PosterAndTitle } from "yep/components/PosterAndTitle";
import { PressableOpacity } from "yep/components/PressableOpacity";
import { AiringNotificationFragmentFragment } from "yep/graphql/generated";
import { useNow } from "yep/hooks/helpers";
import { RootStackParamList, TabParamList } from "yep/navigation";
import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { getTitle } from "yep/utils";

type AiringItemProps = {
  notification: AiringNotificationFragmentFragment;
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, "Airing">,
    StackNavigationProp<RootStackParamList>
  >;
};

export function AiringItem({ navigation, notification }: AiringItemProps) {
  const now = useNow();
  const posterUri = notification.media?.coverImage?.large;

  return (
    <PressableOpacity
      style={styles.airingItemContainer}
      onPress={() => {
        navigation.navigate("Details", { id: notification.animeId });
      }}
      borderRadius={8}
    >
      {posterUri ? <PosterAndTitle uri={posterUri} size="tiny" /> : null}
      <AiringItemTextContainer>
        <AiringItemTitle numberOfLines={2}>
          {getTitle(notification.media?.title)}
        </AiringItemTitle>
        <AiringItemText numberOfLines={1}>
          Episode {notification.episode} aired{" "}
          {formatDistance((notification.createdAt ?? 0) * 1000, now, {
            addSuffix: true,
          })}
          .
        </AiringItemText>
      </AiringItemTextContainer>
    </PressableOpacity>
  );
}

export const AiringItemTextContainer = takimoto.View({
  paddingHorizontal: 8,
  flex: 1,
  justifyContent: "space-between",
});

export const AiringItemTitle = takimoto.Text({
  fontFamily: Manrope.semiBold,
  color: darkTheme.text,
  fontSize: 16,
  marginBottom: 4,
});

const styles = StyleSheet.create({
  airingItemContainer: {
    backgroundColor: darkTheme.listItemBackground,
    flexDirection: "row",
    padding: 8,
  },
});

const AiringItemText = takimoto.Text({
  fontFamily: Manrope.regular,
  fontSize: 12.8,
  color: darkTheme.text,
  maxWidth: "100%",
});

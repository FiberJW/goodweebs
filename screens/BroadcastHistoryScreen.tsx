import { useQuery } from "@apollo/react-hooks";
import { StackNavigationProp } from "@react-navigation/stack";
import { formatDistance } from "date-fns";
import React, { useMemo } from "react";
import { RefreshControl } from "react-native";

import { EmptyState } from "yep/components/EmptyState";
import { Header } from "yep/components/Header";
import { PosterAndTitle } from "yep/components/PosterAndTitle";
import {
  GetAnimeNotificationsQuery,
  GetAnimeNotificationsQueryVariables,
  AiringNotificationFragmentFragment,
} from "yep/graphql/generated";
import { GetAnimeNotifications } from "yep/graphql/queries/AnimeNotifications";
import { useNow } from "yep/hooks/helpers";
import { RootStackParamList } from "yep/navigation";
import { getString, StringCase } from "yep/strings";
import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";
import { notEmpty, getTitle } from "yep/utils";

type Props = {
  navigation: StackNavigationProp<RootStackParamList>;
};

export function BroadcastHistoryScreen({ navigation }: Props) {
  const { loading, data, refetch } = useQuery<
    GetAnimeNotificationsQuery,
    GetAnimeNotificationsQueryVariables
  >(GetAnimeNotifications, {
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
  });

  const list = useMemo(
    () =>
      (data?.Page?.notifications ?? []).filter(
        notEmpty
      ) as AiringNotificationFragmentFragment[],
    [data]
  );

  // // TODO: maybe make this better? feels a little dank
  const AiringFlatList = makeAiringFlatList<typeof list[number]>();

  const refreshing = loading;

  return (
    <OuterContainer>
      <Header label={getString("broadcastHistory", StringCase.TITLE)} />
      <InnerContainer>
        <AnimeListContainer>
          <AiringFlatList
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={AnimeListDivider}
            ListEmptyComponent={<EmptyState />}
            data={list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={async () => {
                  await refetch();
                }}
                tintColor={darkTheme.text}
                titleColor={darkTheme.text}
              />
            }
            keyExtractor={(item) => `${item.id}`}
            renderItem={({ item }) => (
              <AiringItem navigation={navigation} notification={item} />
            )}
          />
        </AnimeListContainer>
      </InnerContainer>
    </OuterContainer>
  );
}

type AiringItemProps = {
  notification: AiringNotificationFragmentFragment;
  navigation: StackNavigationProp<RootStackParamList>;
};

function AiringItem({ navigation, notification }: AiringItemProps) {
  const now = useNow();
  const posterUri = notification.media?.coverImage?.large;

  return (
    <AiringItemContainer
      onPress={() => {
        navigation.navigate("Details", { id: notification.animeId });
      }}
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
    </AiringItemContainer>
  );
}

export const AiringItemTextContainer = takimoto.View({
  paddingHorizontal: 8,
  flex: 1,
  justifyContent: "space-between",
});

export const AiringItemTitle = takimoto.Text({
  fontFamily: "Manrope-SemiBold",
  color: darkTheme.text,
  fontSize: 16,
  marginBottom: 4,
});

const AiringItemContainer = takimoto.TouchableOpacity({
  padding: 8,
  borderRadius: 8,
  backgroundColor: darkTheme.listItemBackground,
  flexDirection: "row",
});

const AiringItemText = takimoto.Text({
  fontFamily: "Manrope-Regular",
  fontSize: 12.8,
  color: darkTheme.text,
  maxWidth: "100%",
});

const OuterContainer = takimoto.View({
  flex: 1,
});

const InnerContainer = takimoto.View({
  padding: 16,
  flex: 1,
});

function makeAiringFlatList<T>() {
  return takimoto.FlatList<T>({}, {});
}

const AnimeListDivider = takimoto.View({ height: 8 });

const AnimeListContainer = takimoto.View({
  flex: 1,
});

export const Spinner = takimoto.ActivityIndicator({
  paddingBottom: 16,
});

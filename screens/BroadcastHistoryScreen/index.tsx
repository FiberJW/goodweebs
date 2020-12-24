import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import {
  CompositeNavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useMemo, useState, useCallback } from "react";
import { RefreshControl } from "react-native";

import { EmptyState } from "yep/components/EmptyState";
import { Header } from "yep/components/Header";
import {
  AiringNotificationFragmentFragment,
  useGetAnimeNotificationsQuery,
} from "yep/graphql/generated";
import { RootStackParamList, TabParamList } from "yep/navigation";
import { getString, StringCase } from "yep/strings";
import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";
import { notEmpty } from "yep/utils";

import { AiringItem } from "./AiringItem";

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, "Airing">,
    StackNavigationProp<RootStackParamList>
  >;
};

export function BroadcastHistoryScreen({ navigation }: Props) {
  const [isFirstFocus, setIsFirstFocus] = useState(true);
  const { loading, data, refetch } = useGetAnimeNotificationsQuery({
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

  useFocusEffect(
    useCallback(
      function refetchWhenRefocused() {
        if (isFirstFocus) {
          setIsFirstFocus(false);
          return;
        }

        refetch();
      },
      [isFirstFocus]
    )
  );

  return (
    <OuterContainer>
      <Header label={getString("broadcastHistory", StringCase.TITLE)} />
      <InnerContainer>
        <AnimeListContainer>
          <AiringFlatList
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={AnimeListDivider}
            ListEmptyComponent={() =>
              refreshing ? null : (
                <EmptyState
                  title="No notifications"
                  description="Explore the world of anime by adding some shows to your list!"
                  cta={{
                    label: "Discover new anime",
                    onPress: () => {
                      navigation.navigate("Discover");
                    },
                  }}
                />
              )
            }
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

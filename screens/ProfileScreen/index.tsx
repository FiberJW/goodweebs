import React from "react";

import { AuthButton } from "yep/components/AuthButton";
import { Header } from "yep/components/Header";
import { StringCase, getString } from "yep/strings";

import {
  OuterContainer,
  InnerContainer,
  UserInfoAndStatsContainer,
  Avatar,
  UserInfoRow,
  Username,
  StatsRow,
  Stat,
  StatsRowSpacer,
  ListHeader,
  List,
  ListSpacer,
  Poster,
  Person,
  EverythingButTheCTA,
} from "./styles";

export function ProfileScreen() {
  return (
    <OuterContainer>
      <Header label={getString("profile", StringCase.TITLE)} />
      <InnerContainer showsVerticalScrollIndicator={false}>
        <EverythingButTheCTA>
          <UserInfoAndStatsContainer>
            <UserInfoRow>
              <Avatar
                source={
                  false
                    ? { uri: "" }
                    : require("yep/assets/icons/ui/avatar-placeholder.png")
                }
              />
              <Username numberOfLines={1}>goodweebs_user_7</Username>
            </UserInfoRow>
            <StatsRow>
              <Stat label="Total Anime" value={117} />
              <Stat label="Days Watched" value={44} />
            </StatsRow>
            <StatsRowSpacer />
            <StatsRow>
              <Stat label="Total Manga" value={2} />
              <Stat label="Chapters Read" value={400} />
            </StatsRow>
          </UserInfoAndStatsContainer>
          <ListHeader>Favorite Anime</ListHeader>
          <List
            horizontal
            ItemSeparatorComponent={ListSpacer}
            keyExtractor={(item) => item.id}
            data={[{ id: "1" }, { id: "2" }, { id: "3" }]}
            renderItem={({ item }) => (
              <Poster
                source={{
                  uri:
                    "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx104462-KrVWRvPcR7ci.jpg",
                }}
              />
            )}
          />
          <ListHeader>Favorite Characters</ListHeader>
          <List
            horizontal
            ItemSeparatorComponent={ListSpacer}
            keyExtractor={(item) => item.id}
            data={[{ id: "1" }, { id: "2" }, { id: "3" }]}
            renderItem={({ item }) => (
              <Person
                source={{
                  uri:
                    "https://vignette.wikia.nocookie.net/new-game/images/c/cd/Hajime_98.PNG/revision/latest?cb=20200319114118",
                }}
              />
            )}
          />
        </EverythingButTheCTA>
        <AuthButton label="Log out" onPress={() => {}} />
      </InnerContainer>
    </OuterContainer>
  );
}

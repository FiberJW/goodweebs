import { useLocalSearchParams, useNavigation } from "expo-router";
import { fbs } from "fbtee";
import React, { useEffect } from "react";

import {
  UserProfile,
  useUserProfile,
} from "yep/screens/ProfileScreen/UserProfile";
import { fakeHandle } from "yep/screenshotMode";

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const userId = Number(id);
  const profile = useUserProfile(
    Number.isInteger(userId) && userId > 0 ? userId : undefined,
  );
  const name = fakeHandle(profile.data?.User?.name);

  useEffect(() => {
    navigation.setOptions({
      title: name ?? String(fbs("Profile", "User profile title")),
    });
  }, [name, navigation]);

  return <UserProfile profile={profile} />;
}

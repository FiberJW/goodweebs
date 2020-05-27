import Constants from "expo-constants";
import React from "react";
import { Platform } from "react-native";

import { white } from "yep/colors";

import { Container, Label, SyncTouchable, SyncIcon, Spinner } from "./styles";

type Props = {
  label: string;

  refreshing?: boolean;
  statusBarPadding?: boolean;
  onSyncPress?: () => void;
};

export function Header({
  label,
  statusBarPadding = true,
  onSyncPress,
  refreshing,
}: Props) {
  return (
    <Container
      style={{
        paddingTop:
          Platform.OS === "ios" && statusBarPadding
            ? 16 + Constants.statusBarHeight
            : undefined,
      }}
    >
      <Label>{label}</Label>
      {refreshing ? <Spinner color={white} size="large" /> : null}
      {onSyncPress && !refreshing ? (
        <SyncTouchable onPress={onSyncPress}>
          <SyncIcon source={require("yep/assets/icons/sync.png")} />
        </SyncTouchable>
      ) : null}
    </Container>
  );
}

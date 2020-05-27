import Constants from "expo-constants";
import React from "react";

import { Container, Label, SyncTouchable, SyncIcon } from "./styles";

type Props = {
  label: string;
  statusBarPadding?: boolean;
  onSyncPress?: () => void;
};

export function Header({ label, statusBarPadding = true, onSyncPress }: Props) {
  return (
    <Container
      style={{
        paddingTop: statusBarPadding
          ? 16 + Constants.statusBarHeight
          : undefined,
      }}
    >
      <Label>{label}</Label>
      {onSyncPress ? (
        <SyncTouchable onPress={onSyncPress}>
          <SyncIcon source={require("yep/assets/icons/sync.png")} />
        </SyncTouchable>
      ) : null}
    </Container>
  );
}

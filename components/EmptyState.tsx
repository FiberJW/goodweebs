import React from "react";

import { takimoto } from "yep/takimoto";

export function EmptyState() {
  return (
    <Jail>
      <SugeKnight source={require("yep/assets/SHUNGITE.gif")} />
    </Jail>
  );
}

const SugeKnight = takimoto.Image({
  height: 112,
  width: 112,
});

const Jail = takimoto.View({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
});

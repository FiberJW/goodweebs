import React, { useState } from "react";

import { Header } from "yep/components/Header";
import { SearchBox } from "yep/components/SearchBox";
import { getString, StringCase } from "yep/strings";
import { takimoto } from "yep/takimoto";

export function DiscoverScreen() {
  const [searchTerm, setSearchTerm] = useState("");

  const showSearchResultsView = searchTerm.length > 0;

  return (
    <OuterContainer>
      <Header label={getString("discover", StringCase.TITLE)} />
      <SearchBox
        value={searchTerm}
        onChangeText={(text) => setSearchTerm(text)}
        placeholder="Search anime, manga, and more"
        onCancelPress={() => {
          setSearchTerm("");
        }}
        onClearPress={() => {
          setSearchTerm("");
        }}
      />
      <InnerContainer />
    </OuterContainer>
  );
}

const OuterContainer = takimoto.View({
  flex: 1,
});

const InnerContainer = takimoto.View({
  flex: 1,
  padding: 16,
});

import React, { useState, useRef } from "react";
import { TextInputProps, TextInput } from "react-native";

import { darkTheme } from "yep/themes";

import {
  Container,
  SearchInput,
  SearchIcon,
  SearchInputContainer,
  ClearIcon,
  ClearTouchable,
  CancelLabel,
  CancelTouchable,
} from "./styles";

type Props = TextInputProps & {
  onCancelPress: () => void;
  onClearPress: () => void;
};

export function SearchBox({
  onClearPress,
  onCancelPress,
  ...textInputProps
}: Props) {
  const [isCancelButtonVisible, setIsCancelButtonVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  return (
    <Container>
      <SearchInputContainer>
        <SearchIcon source={require("yep/assets/icons/search.png")} />
        <SearchInput
          {...textInputProps}
          // @ts-ignore
          // TODO: ref works, but i messed up the types
          ref={inputRef}
          onFocus={() => setIsCancelButtonVisible(true)}
          placeholderTextColor={darkTheme.inputPlaceholder}
        />
        {(textInputProps.value?.length ?? 0) > 0 && (
          <ClearTouchable onPress={onClearPress}>
            <ClearIcon source={require("yep/assets/icons/clear.png")} />
          </ClearTouchable>
        )}
      </SearchInputContainer>
      {isCancelButtonVisible && (
        <CancelTouchable
          onPress={() => {
            setIsCancelButtonVisible(false);
            // eslint doesn't understand optional chaining
            inputRef.current?.blur(); // eslint-disable-line
            onCancelPress();
          }}
        >
          <CancelLabel>Cancel</CancelLabel>
        </CancelTouchable>
      )}
    </Container>
  );
}

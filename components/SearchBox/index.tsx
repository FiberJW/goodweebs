import React, { useState, useRef } from "react";
import {
  TextInputProps,
  TextInput,
  StyleSheet,
  View,
  Image,
  Text,
} from "react-native";

import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

import { PressableOpacity } from "../PressableOpacity";

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
    <View style={styles.container}>
      <View style={styles.searchInputContainer}>
        <Image
          style={styles.searchIcon}
          source={require("yep/assets/icons/search.png")}
        />
        <TextInput
          style={styles.searchInput}
          {...textInputProps}
          ref={inputRef}
          keyboardAppearance="dark"
          onFocus={() => setIsCancelButtonVisible(true)}
          placeholderTextColor={darkTheme.inputPlaceholder}
        />
        {(textInputProps.value?.length ?? 0) > 0 && (
          <PressableOpacity onPress={onClearPress}>
            <Image
              style={styles.clearIcon}
              source={require("yep/assets/icons/clear.png")}
            />
          </PressableOpacity>
        )}
      </View>
      {isCancelButtonVisible && (
        <PressableOpacity
          onPress={() => {
            setIsCancelButtonVisible(false);
            // eslint doesn't understand optional chaining
            inputRef.current?.blur(); // eslint-disable-line
            onCancelPress();
          }}
          style={{ marginLeft: 8 }}
        >
          <Text style={styles.cancelLabel}>Cancel</Text>
        </PressableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cancelLabel: {
    color: darkTheme.text,
    fontFamily: Manrope.regular,
    fontSize: 16,
  },
  clearIcon: { height: 16, marginLeft: 8, opacity: 0.4, width: 16 },
  container: {
    alignItems: "center",
    backgroundColor: darkTheme.navBackground,
    flexDirection: "row",
    paddingBottom: 16,
    paddingHorizontal: 16,
    width: "100%",
  },
  searchIcon: {
    height: 16,
    marginRight: 8,
    opacity: 0.4,
    width: 16,
  },
  searchInput: {
    color: darkTheme.text,
    flex: 1,
    fontFamily: Manrope.regular,
    fontSize: 16,
  },
  searchInputContainer: {
    alignItems: "center",
    backgroundColor: darkTheme.background,
    borderRadius: 50,
    flexDirection: "row",
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});

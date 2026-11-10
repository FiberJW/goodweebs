import { Image } from "expo-image";
import { fbs } from "fbtee";
import React, { useState, useRef } from "react";
import {
  TextInputProps,
  TextInput,
  TextInputInstance,
  StyleSheet,
  View,
  Text,
} from "react-native";

import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

import { PressableOpacity } from "../PressableOpacity";

type Props = TextInputProps & {
  onClear: () => void;
};

export function SearchBox({ onClear, ...textInputProps }: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInputInstance>(null);

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
          // Titles are proper nouns ("Yotsuba&!", "Oshi no Ko") — iOS
          // autocorrect mangles them mid-search.
          autoCorrect={false}
          spellCheck={false}
          keyboardAppearance="dark"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={darkTheme.inputPlaceholder}
        />
        {(textInputProps.value?.length ?? 0) > 0 ? (
          <PressableOpacity
            onPress={onClear}
            accessibilityRole="button"
            accessibilityLabel={String(
              fbs("Clear search", "Clear search button accessibility label"),
            )}
            hitSlop={12}
          >
            <Image
              style={styles.clearIcon}
              source={require("yep/assets/icons/clear.png")}
            />
          </PressableOpacity>
        ) : null}
      </View>
      {isFocused || textInputProps.value ? (
        <PressableOpacity
          onPress={() => {
            inputRef.current?.blur();
            onClear();
          }}
          style={{ marginLeft: 8 }}
        >
          <Text style={styles.cancelLabel}>
            {String(fbs("Cancel", "Search box cancel button label"))}
          </Text>
        </PressableOpacity>
      ) : null}
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

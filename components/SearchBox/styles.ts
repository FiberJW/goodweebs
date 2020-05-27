import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";

export const Container = takimoto.View({
  backgroundColor: darkTheme.navBackground,
  paddingHorizontal: 16,
  paddingBottom: 16,
  width: "100%",
  alignItems: "center",
  flexDirection: "row",
});

export const SearchInputContainer = takimoto.View({
  flexDirection: "row",
  backgroundColor: darkTheme.background,
  borderRadius: 8,
  padding: 8,
  alignItems: "center",
  flex: 1,
});

export const SearchInput = takimoto.TextInput({
  color: darkTheme.text,
  fontSize: 16,
  fontFamily: "Manrope-Regular",
  flex: 1,
});

export const SearchIcon = takimoto.Image({
  height: 16,
  opacity: 0.4,
  width: 16,
  marginRight: 8,
});

export const ClearTouchable = takimoto.TouchableOpacity({});

export const ClearIcon = takimoto.Image({
  height: 16,
  opacity: 0.4,
  width: 16,
  marginLeft: 8,
});

export const CancelTouchable = takimoto.TouchableOpacity({ marginLeft: 8 });

export const CancelLabel = takimoto.Text({
  color: darkTheme.text,
  fontSize: 16,
  fontFamily: "Manrope-Regular",
});

import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";

export const Container = takimoto.View({
  backgroundColor: darkTheme.navBackground,
  padding: 16,
  width: "100%",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
});

export const Label = takimoto.Text({
  color: darkTheme.text,
  fontFamily: Manrope.extraBold,
  fontSize: 25,
});

export const SyncIcon = takimoto.Image({
  height: 24,
  width: 24,
});

export const Spinner = takimoto.ActivityIndicator({
  height: 24,
  width: 24,
});

export const SyncTouchable = takimoto.TouchableOpacity({});

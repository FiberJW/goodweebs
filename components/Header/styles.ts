import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";

export const Container = takimoto.Text({
  backgroundColor: darkTheme.navBackground,
  padding: 16,
  width: "100%",
});

export const Label = takimoto.Text({
  color: darkTheme.text,
  fontFamily: "Manrope-ExtraBold",
  fontSize: 25,
});

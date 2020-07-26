import { takimoto } from "yep/takimoto";
import { darkTheme } from "yep/themes";

export const Image = takimoto.Image({
  borderRadius: 4,
  overflow: "hidden",
  backgroundColor: darkTheme.listItemBackground,
});

export const Title = takimoto.Text({
  marginTop: 8,
  fontFamily: "Manrope-Regular",
  fontSize: 12.8,
  textAlign: "center",
  color: darkTheme.text,
});

export const Container = takimoto.TouchableOpacity({
  alignItems: "center",
});

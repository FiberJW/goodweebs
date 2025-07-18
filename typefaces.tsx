import { useFonts } from "yep/hooks/font";

export const Manrope = {
  extraLight: "Manrope-ExtraLight",
  light: "Manrope-Light",
  regular: "Manrope-Regular",
  medium: "Manrope-Medium",
  semiBold: "Manrope-SemiBold",
  bold: "Manrope-Bold",
  extraBold: "Manrope-ExtraBold",
};

export const LINESeedJP = {
  regular: "LINESeedJP-Regular",
  extraBold: "LINESeedJP-ExtraBold",
  bold: "LINESeedJP-Bold",
  thin: "LINESeedJP-Thin",
};

export function useManrope() {
  return useFonts({
    [Manrope.bold]: require("yep/assets/fonts/manrope/Manrope-Bold.otf"),
    [Manrope.extraBold]: require("yep/assets/fonts/manrope/Manrope-ExtraBold.otf"),
    [Manrope.extraLight]: require("yep/assets/fonts/manrope/Manrope-ExtraLight.otf"),
    [Manrope.light]: require("yep/assets/fonts/manrope/Manrope-Light.otf"),
    [Manrope.medium]: require("yep/assets/fonts/manrope/Manrope-Medium.otf"),
    [Manrope.regular]: require("yep/assets/fonts/manrope/Manrope-Regular.otf"),
    [Manrope.semiBold]: require("yep/assets/fonts/manrope/Manrope-SemiBold.otf"),
    [LINESeedJP.regular]: require("yep/assets/fonts/LINESeedJP/LINESeedJP_OTF_Rg.otf"),
    [LINESeedJP.extraBold]: require("yep/assets/fonts/LINESeedJP/LINESeedJP_OTF_Eb.otf"),
    [LINESeedJP.bold]: require("yep/assets/fonts/LINESeedJP/LINESeedJP_OTF_Bd.otf"),
    [LINESeedJP.thin]: require("yep/assets/fonts/LINESeedJP/LINESeedJP_OTF_Th.otf"),
  });
}

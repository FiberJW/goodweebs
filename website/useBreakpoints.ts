import { useWindowDimensions } from "react-native";

export function useBreakpoints() {
  return { isMobile: useWindowDimensions().width <= 700 };
}

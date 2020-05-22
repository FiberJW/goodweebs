import {
  ViewStyle,
  ScaledSize,
  Dimensions,
  ViewProps,
  View,
} from "react-native";
import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  forwardRef,
  FC,
  Ref,
} from "react";

type DeclarativeWindowSizeStyles<StyleT> = {
  "<"?: {
    [value: number]: StyleT;
  };
  "<="?: {
    [value: number]: StyleT;
  };
  ">"?: {
    [value: number]: StyleT;
  };
  ">="?: {
    [value: number]: StyleT;
  };
  "="?: {
    [value: number]: StyleT;
  };
};

type DynamicTakimotoKeys<StyleT> = StyleT & {
  //   hover?: StyleT; // TODO
  //   active?: StyleT; // TODO
  //   focused?: StyleT; // TODO
  //   darkTheme?: StyleT; // TODO
  //   lightTheme?: StyleT; // TODO
  //   portrait?: StyleT; // TODO
  //   landscape?: StyleT; // TODO
  whenWidth?: DeclarativeWindowSizeStyles<StyleT>;
  whenHeight?: DeclarativeWindowSizeStyles<StyleT>;
};

type DimensionsChangeData = {
  window: ScaledSize;
  screen: ScaledSize;
};

export const takimoto = {
  View(style: DynamicTakimotoKeys<ViewStyle>): FC<ViewProps> {
    return forwardRef(function WrappedView(
      { style: styleProp, ...rest }: ViewProps,
      ref: Ref<View>
    ) {
      const [windowSize, setWindowSize] = useState<ScaledSize>(
        Dimensions.get("window")
      );

      const onDimensionsChange = useCallback(
        ({ window }: DimensionsChangeData) => setWindowSize(window),
        []
      );

      useEffect(function manageDimensionsEventListeners() {
        Dimensions.addEventListener("change", onDimensionsChange);

        return () =>
          Dimensions.removeEventListener("change", onDimensionsChange);
      }, []);

      const styles = useMemo(() => {
        const styleCopy = { ...style };
        const styleWithoutExtras = (() => {
          let s = { ...styleCopy };
          delete s.whenHeight;
          delete s.whenWidth;
          return s as ViewStyle;
        })();

        let stylesArray = [styleWithoutExtras];

        for (const operator in styleCopy.whenHeight) {
          if (styleCopy.whenHeight.hasOwnProperty(operator)) {
            const castedOperator = operator as keyof DeclarativeWindowSizeStyles<
              ViewStyle
            >;
            const breakpointBasedStyles = styleCopy.whenHeight[castedOperator];

            if (breakpointBasedStyles) {
              for (const breakpoint in breakpointBasedStyles) {
                const castedBreakpoint = (breakpoint as unknown) as keyof typeof breakpointBasedStyles;
                switch (castedOperator) {
                  case "<":
                    if (windowSize.height < castedBreakpoint)
                      stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                    break;
                  case "<=":
                    if (windowSize.height <= castedBreakpoint)
                      stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                    break;
                  case "=":
                    if (windowSize.height === castedBreakpoint)
                      stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                    break;
                  case ">":
                    if (windowSize.height > castedBreakpoint)
                      stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                    break;
                  case ">=":
                    if (windowSize.height >= castedBreakpoint)
                      stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                    break;
                }
              }
            }
          }
        }

        for (const operator in styleCopy.whenWidth) {
          if (styleCopy.whenWidth.hasOwnProperty(operator)) {
            const castedOperator = operator as keyof DeclarativeWindowSizeStyles<
              ViewStyle
            >;
            const breakpointBasedStyles = styleCopy.whenWidth[castedOperator];

            if (breakpointBasedStyles) {
              for (const breakpoint in breakpointBasedStyles) {
                const castedBreakpoint = (breakpoint as unknown) as keyof typeof breakpointBasedStyles;
                switch (castedOperator) {
                  case "<":
                    if (windowSize.width < castedBreakpoint)
                      stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                    break;
                  case "<=":
                    if (windowSize.width <= castedBreakpoint)
                      stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                    break;
                  case "=":
                    if (windowSize.width === castedBreakpoint)
                      stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                    break;
                  case ">":
                    if (windowSize.width > castedBreakpoint)
                      stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                    break;
                  case ">=":
                    if (windowSize.width >= castedBreakpoint)
                      stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                    break;
                }
              }
            }
          }
        }

        return stylesArray;
      }, [windowSize]);
      return <View {...rest} style={[styles, styleProp]} ref={ref} />;
    });
  },
};

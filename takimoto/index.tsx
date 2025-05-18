import React, { useMemo, FC } from "react";
import {
  ViewStyle,
  ViewProps,
  View,
  TextStyle,
  TextProps,
  Text,
  ImageStyle,
  ImageProps,
  Image,
  ImageBackground,
  ImageBackgroundProps,
  TextInput,
  TextInputProps,
  ScrollView,
  ScrollViewProps,
  FlatList,
  FlatListProps,
  ActivityIndicator,
  ActivityIndicatorProps,
  useWindowDimensions,
} from "react-native";

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

type DynamicKeys<StyleT> = StyleT & {
  whenWidth?: DeclarativeWindowSizeStyles<StyleT>;
  whenHeight?: DeclarativeWindowSizeStyles<StyleT>;
};

function useTakimoto<StyleT>(style: DynamicKeys<StyleT>) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const styles = useMemo(() => {
    const styleCopy = { ...style };
    const styleWithoutExtras = (() => {
      const s = { ...styleCopy };
      delete s.whenHeight;
      delete s.whenWidth;
      return s as StyleT;
    })();

    const stylesArray = [styleWithoutExtras];

    for (const operator in styleCopy.whenHeight) {
      if (styleCopy.whenHeight.hasOwnProperty(operator)) {
        const castedOperator =
          operator as keyof DeclarativeWindowSizeStyles<StyleT>;
        const breakpointBasedStyles = styleCopy.whenHeight[castedOperator];

        if (breakpointBasedStyles) {
          for (const breakpoint in breakpointBasedStyles) {
            const castedBreakpoint =
              breakpoint as unknown as keyof typeof breakpointBasedStyles;
            switch (castedOperator) {
              case "<":
                if (windowHeight < castedBreakpoint)
                  stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                break;
              case "<=":
                if (windowHeight <= castedBreakpoint)
                  stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                break;
              case "=":
                if (windowHeight === castedBreakpoint)
                  stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                break;
              case ">":
                if (windowHeight > castedBreakpoint)
                  stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                break;
              case ">=":
                if (windowHeight >= castedBreakpoint)
                  stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                break;
            }
          }
        }
      }
    }

    for (const operator in styleCopy.whenWidth) {
      if (styleCopy.whenWidth.hasOwnProperty(operator)) {
        const castedOperator =
          operator as keyof DeclarativeWindowSizeStyles<StyleT>;
        const breakpointBasedStyles = styleCopy.whenWidth[castedOperator];

        if (breakpointBasedStyles) {
          for (const breakpoint in breakpointBasedStyles) {
            const castedBreakpoint =
              breakpoint as unknown as keyof typeof breakpointBasedStyles;
            switch (castedOperator) {
              case "<":
                if (windowWidth < castedBreakpoint)
                  stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                break;
              case "<=":
                if (windowWidth <= castedBreakpoint)
                  stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                break;
              case "=":
                if (windowWidth === castedBreakpoint)
                  stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                break;
              case ">":
                if (windowWidth > castedBreakpoint)
                  stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                break;
              case ">=":
                if (windowWidth >= castedBreakpoint)
                  stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                break;
            }
          }
        }
      }
    }

    return stylesArray;
  }, [windowHeight, windowWidth]);

  return styles;
}

export const takimoto = {
  View(style: DynamicKeys<ViewStyle>): FC<ViewProps> {
    return function WrappedView({ style: styleProp, ...rest }: ViewProps) {
      const styles = useTakimoto(style);

      return <View {...rest} style={[styles, styleProp]} />;
    };
  },
  Text(style: DynamicKeys<TextStyle>): FC<TextProps> {
    return function WrappedText({ style: styleProp, ...rest }: TextProps) {
      const styles = useTakimoto(style);

      return <Text {...rest} style={[styles, styleProp]} />;
    };
  },
  Image(style: DynamicKeys<ImageStyle>): FC<ImageProps> {
    return function WrappedImage({ style: styleProp, ...rest }: ImageProps) {
      const styles = useTakimoto(style);

      return <Image {...rest} style={[styles, styleProp]} />;
    };
  },
  ActivityIndicator(style: DynamicKeys<ViewStyle>): FC<ActivityIndicatorProps> {
    return function WrappedActivityIndicator({
      style: styleProp,
      ...rest
    }: ActivityIndicatorProps) {
      const styles = useTakimoto(style);

      return <ActivityIndicator {...rest} style={[styles, styleProp]} />;
    };
  },

  ImageBackground(style: DynamicKeys<ViewStyle>): FC<ImageBackgroundProps> {
    return function WrappedImageBackground({
      style: styleProp,
      ...rest
    }: ImageBackgroundProps) {
      const styles = useTakimoto(style);

      return <ImageBackground {...rest} style={[styles, styleProp]} />;
    };
  },
  ScrollView(
    style: DynamicKeys<ViewStyle>,
    contentContainerStyle: DynamicKeys<ViewStyle> = {}
  ): FC<ScrollViewProps> {
    return function WrappedScrollView({
      style: styleProp,
      contentContainerStyle: contentContainerStyleProp,
      ...rest
    }: ScrollViewProps) {
      const styles = useTakimoto(style);
      const contentContainerStyles = useTakimoto(contentContainerStyle);

      return (
        <ScrollView
          {...rest}
          style={[styles, styleProp]}
          contentContainerStyle={[
            contentContainerStyles,
            contentContainerStyleProp,
          ]}
        />
      );
    };
  },
  FlatList<ItemT>(
    style: DynamicKeys<ViewStyle>,
    contentContainerStyle: DynamicKeys<ViewStyle> = {}
  ): FC<FlatListProps<ItemT>> {
    return function WrappedFlatList({
      style: styleProp,
      contentContainerStyle: contentContainerStyleProp,
      ...rest
    }: FlatListProps<ItemT>) {
      const styles = useTakimoto(style);
      const contentContainerStyles = useTakimoto(contentContainerStyle);

      return (
        <FlatList
          {...rest}
          style={[styles, styleProp]}
          contentContainerStyle={[
            contentContainerStyles,
            contentContainerStyleProp,
          ]}
        />
      );
    };
  },
  TextInput(style: DynamicKeys<TextStyle>): FC<TextInputProps> {
    return function WrappedTextInput({
      style: styleProp,
      ...rest
    }: TextInputProps) {
      const styles = useTakimoto(style);

      return (
        <TextInput
          {...rest}
          style={[styles, styleProp]}
          keyboardAppearance="dark"
        />
      );
    };
  },
};

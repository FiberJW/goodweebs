import React, { useMemo, forwardRef, FC, Ref } from "react";
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

interface DeclarativeWindowSizeStyles<StyleT> {
  "<"?: Record<number, StyleT>;
  "<="?: Record<number, StyleT>;
  ">"?: Record<number, StyleT>;
  ">="?: Record<number, StyleT>;
  "="?: Record<number, StyleT>;
}

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
              case "<": {
                if (windowHeight < castedBreakpoint)
                  stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                break;
              }
              case "<=": {
                if (windowHeight <= castedBreakpoint)
                  stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                break;
              }
              case "=": {
                if (windowHeight === castedBreakpoint)
                  stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                break;
              }
              case ">": {
                if (windowHeight > castedBreakpoint)
                  stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                break;
              }
              case ">=": {
                if (windowHeight >= castedBreakpoint)
                  stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                break;
              }
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
              case "<": {
                if (windowWidth < castedBreakpoint)
                  stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                break;
              }
              case "<=": {
                if (windowWidth <= castedBreakpoint)
                  stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                break;
              }
              case "=": {
                if (windowWidth === castedBreakpoint)
                  stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                break;
              }
              case ">": {
                if (windowWidth > castedBreakpoint)
                  stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                break;
              }
              case ">=": {
                if (windowWidth >= castedBreakpoint)
                  stylesArray.push(breakpointBasedStyles[castedBreakpoint]);
                break;
              }
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
    return forwardRef(function WrappedView(
      { style: styleProperty, ...rest }: ViewProps,
      reference: Ref<View>
    ) {
      const styles = useTakimoto(style);

      return <View {...rest} style={[styles, styleProperty]} ref={reference} />;
    });
  },
  Text(style: DynamicKeys<TextStyle>): FC<TextProps> {
    return forwardRef(function WrappedText(
      { style: styleProperty, ...rest }: TextProps,
      reference: Ref<Text>
    ) {
      const styles = useTakimoto(style);

      return <Text {...rest} style={[styles, styleProperty]} ref={reference} />;
    });
  },
  Image(style: DynamicKeys<ImageStyle>): FC<ImageProps> {
    return forwardRef(function WrappedImage(
      { style: styleProperty, ...rest }: ImageProps,
      reference: Ref<Image>
    ) {
      const styles = useTakimoto(style);

      return <Image {...rest} style={[styles, styleProperty]} ref={reference} />;
    });
  },
  ActivityIndicator(style: DynamicKeys<ViewStyle>): FC<ActivityIndicatorProps> {
    return forwardRef(function WrappedActivityIndicator(
      { style: styleProperty, ...rest }: ActivityIndicatorProps,
      reference: Ref<ActivityIndicator>
    ) {
      const styles = useTakimoto(style);

      return (
        <ActivityIndicator {...rest} style={[styles, styleProperty]} ref={reference} />
      );
    });
  },

  ImageBackground(style: DynamicKeys<ViewStyle>): FC<ImageBackgroundProps> {
    return forwardRef(function WrappedImageBackground(
      { style: styleProperty, ...rest }: ImageBackgroundProps,
      reference: Ref<ImageBackground>
    ) {
      const styles = useTakimoto(style);

      return (
        <ImageBackground {...rest} style={[styles, styleProperty]} ref={reference} />
      );
    });
  },
  ScrollView(
    style: DynamicKeys<ViewStyle>,
    contentContainerStyle: DynamicKeys<ViewStyle> = {}
  ): FC<ScrollViewProps> {
    return forwardRef(function WrappedScrollView(
      {
        style: styleProperty,
        contentContainerStyle: contentContainerStyleProperty,
        ...rest
      }: ScrollViewProps,
      reference: Ref<ScrollView>
    ) {
      const styles = useTakimoto(style);
      const contentContainerStyles = useTakimoto(contentContainerStyle);

      return (
        <ScrollView
          {...rest}
          style={[styles, styleProperty]}
          contentContainerStyle={[
            contentContainerStyles,
            contentContainerStyleProperty,
          ]}
          ref={reference}
        />
      );
    });
  },
  FlatList<ItemT>(
    style: DynamicKeys<ViewStyle>,
    contentContainerStyle: DynamicKeys<ViewStyle> = {}
  ): FC<FlatListProps<ItemT>> {
    return forwardRef(function WrappedFlatList(
      {
        style: styleProperty,
        contentContainerStyle: contentContainerStyleProperty,
        ...rest
      }: FlatListProps<ItemT>,
      reference: Ref<FlatList>
    ) {
      const styles = useTakimoto(style);
      const contentContainerStyles = useTakimoto(contentContainerStyle);

      return (
        <FlatList
          {...rest}
          style={[styles, styleProperty]}
          contentContainerStyle={[
            contentContainerStyles,
            contentContainerStyleProperty,
          ]}
          ref={reference}
        />
      );
    });
  },
  TextInput(style: DynamicKeys<TextStyle>): FC<TextInputProps> {
    return forwardRef(function WrappedTextInput(
      { style: styleProperty, ...rest }: TextInputProps,
      reference: Ref<TextInput>
    ) {
      const styles = useTakimoto(style);

      return <TextInput {...rest} style={[styles, styleProperty]} ref={reference} />;
    });
  },
};

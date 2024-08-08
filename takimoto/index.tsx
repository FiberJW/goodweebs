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
  }, [windowHeight, windowWidth, style]);

  return styles;
}

export const takimoto = {
  View(style: DynamicKeys<ViewStyle>): FC<ViewProps> {
    return forwardRef(function WrappedView(
      { style: styleProp, ...rest }: ViewProps,
      ref: Ref<View>
    ) {
      const styles = useTakimoto(style);

      return <View {...rest} style={[styles, styleProp]} ref={ref} />;
    });
  },
  Text(style: DynamicKeys<TextStyle>): FC<TextProps> {
    return forwardRef(function WrappedText(
      { style: styleProp, ...rest }: TextProps,
      ref: Ref<Text>
    ) {
      const styles = useTakimoto(style);

      return <Text {...rest} style={[styles, styleProp]} ref={ref} />;
    });
  },
  Image(style: DynamicKeys<ImageStyle>): FC<ImageProps> {
    return forwardRef(function WrappedImage(
      { style: styleProp, ...rest }: ImageProps,
      ref: Ref<Image>
    ) {
      const styles = useTakimoto(style);

      return <Image {...rest} style={[styles, styleProp]} ref={ref} />;
    });
  },
  ActivityIndicator(style: DynamicKeys<ViewStyle>): FC<ActivityIndicatorProps> {
    return forwardRef(function WrappedActivityIndicator(
      { style: styleProp, ...rest }: ActivityIndicatorProps,
      ref: Ref<ActivityIndicator>
    ) {
      const styles = useTakimoto(style);

      return (
        <ActivityIndicator {...rest} style={[styles, styleProp]} ref={ref} />
      );
    });
  },

  ImageBackground(style: DynamicKeys<ViewStyle>): FC<ImageBackgroundProps> {
    return forwardRef(function WrappedImageBackground(
      { style: styleProp, ...rest }: ImageBackgroundProps,
      ref: Ref<ImageBackground>
    ) {
      const styles = useTakimoto(style);

      return (
        <ImageBackground {...rest} style={[styles, styleProp]} ref={ref} />
      );
    });
  },
  ScrollView(
    style: DynamicKeys<ViewStyle>,
    contentContainerStyle: DynamicKeys<ViewStyle> = {}
  ): FC<ScrollViewProps> {
    return forwardRef(function WrappedScrollView(
      {
        style: styleProp,
        contentContainerStyle: contentContainerStyleProp,
        ...rest
      }: ScrollViewProps,
      ref: Ref<ScrollView>
    ) {
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
          ref={ref}
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
        style: styleProp,
        contentContainerStyle: contentContainerStyleProp,
        ...rest
      }: FlatListProps<ItemT>,
      ref: Ref<FlatList>
    ) {
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
          ref={ref}
        />
      );
    });
  },
  TextInput(style: DynamicKeys<TextStyle>): FC<TextInputProps> {
    return forwardRef(function WrappedTextInput(
      { style: styleProp, ...rest }: TextInputProps,
      ref: Ref<TextInput>
    ) {
      const styles = useTakimoto(style);

      return (
        <TextInput
          {...rest}
          style={[styles, styleProp]}
          ref={ref}
          keyboardAppearance="dark"
        />
      );
    });
  },
};

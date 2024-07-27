import { FlashList, FlashListProps } from "@shopify/flash-list";
import isArray from "lodash/isArray";
import React, { forwardRef, ForwardedRef, JSX, Children } from "react";

type LazyScrollViewProps = FlashListProps<unknown> & {
  estimatedScrollViewSize?: { height: number; width: number };
  estimatedItemSize: number;
};

export const LazyScrollView = forwardRef(function LazyScrollView(
  props: LazyScrollViewProps,
  ref: ForwardedRef<FlashList<unknown[]>>
): JSX.Element {
  const { children, estimatedScrollViewSize, estimatedItemSize } = props;

  const data = isArray(children) ? children : Children.toArray(children);

  // No specific reason for 2000, just a big number. Roughly 2x the screen size
  const drawDistance = 2000;

  if (estimatedItemSize === undefined) {
    console.warn(
      "LazyScrollView: 'estimatedItemSize' is missing, check FlashList warning for a recommended value."
    );
  }

  return (
    <FlashList
      ref={ref}
      {...props}
      data={data}
      renderItem={({ item }) => item}
      getItemType={(_, index) => {
        // Disables recycling of items by assigning a unique type to each item
        return index;
      }}
      estimatedListSize={estimatedScrollViewSize}
      drawDistance={drawDistance}
    />
  );
});

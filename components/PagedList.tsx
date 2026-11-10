import React, { createContext, use } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  type FlatListProps,
} from "react-native";

import type { PaginatedQuery } from "yep/graphql/pagination";
import { darkTheme } from "yep/themes";

type Props<T> = Omit<
  FlatListProps<T>,
  "data" | "refreshControl" | "onEndReached" | "ListFooterComponent"
> & {
  ListFooterComponent?: React.ReactElement;
  data: readonly T[];
  paging: PaginatedQuery;
  joined?: boolean;
};

const CountContext = createContext(0);

export function PagedList<T>({
  data,
  paging,
  joined = false,
  ListFooterComponent,
  ...rest
}: Props<T>) {
  return (
    <CountContext value={data.length}>
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.5}
        {...rest}
        data={data}
        CellRendererComponent={joined ? JoinedCell : undefined}
        ItemSeparatorComponent={
          joined ? CardDivider : rest.ItemSeparatorComponent
        }
        onEndReached={paging.loadNextPage}
        // eslint-disable-next-line react-doctor/jsx-no-jsx-as-prop -- RefreshControl must be a live element; React Compiler memoizes it
        refreshControl={
          <RefreshControl
            refreshing={paging.isRefetching}
            onRefresh={paging.refresh}
            tintColor={darkTheme.text}
            titleColor={darkTheme.text}
          />
        }
        ListFooterComponent={
          <>
            {paging.isFetchingMore ? (
              <ActivityIndicator
                color={darkTheme.text}
                style={styles.footerSpinner}
              />
            ) : null}
            {ListFooterComponent}
          </>
        }
      />
    </CountContext>
  );
}

function JoinedCell({
  index,
  style,
  onLayout,
  children,
}: React.ComponentProps<
  NonNullable<FlatListProps<unknown>["CellRendererComponent"]>
>) {
  const count = use(CountContext);
  return (
    <View style={[style, joinedCardStyle(index, count)]} onLayout={onLayout}>
      {children}
    </View>
  );
}

export function JoinedCards({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.joined}>
      {React.Children.toArray(children).map((child, index) => (
        <React.Fragment key={(child as React.ReactElement).key ?? index}>
          {index ? <CardDivider /> : null}
          {child}
        </React.Fragment>
      ))}
    </View>
  );
}

function joinedCardStyle(index: number, count: number) {
  return [
    styles.card,
    index === 0 && styles.firstCard,
    index === count - 1 && styles.lastCard,
  ];
}

function CardDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  card: { borderCurve: "continuous", overflow: "hidden" },
  joined: { borderCurve: "continuous", borderRadius: 16, overflow: "hidden" },
  firstCard: { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  lastCard: { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  footerSpinner: { paddingVertical: 16 },
  divider: {
    backgroundColor: darkTheme.listItemBorder,
    height: StyleSheet.hairlineWidth,
  },
});

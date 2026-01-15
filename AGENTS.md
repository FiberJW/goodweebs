# AGENTS.md - Goodweebs Codebase Guide

This document provides essential information for AI coding agents working on the Goodweebs codebase.

## Project Overview

Goodweebs is a React Native mobile app (iOS/Android/Web) built with Expo SDK 54 and React 19. It serves as an AniList client for tracking anime, using GraphQL with Apollo Client.

**Tech Stack**: React Native 0.81.5, Expo SDK 54, TypeScript 5.9 (strict), Expo Router, Apollo Client 3.x, Bun

## Build/Lint/Test Commands

```bash
bun install                 # Install dependencies
bun run start               # Start dev server with tunnel
bun run web                 # Start web development
bun run ios                 # Run on iOS simulator
bun run android             # Run on Android emulator
bun run gql                 # GraphQL codegen (run after modifying graphql/ files)
bun run lint                # ESLint with auto-fix
bunx tsc --noEmit           # TypeScript type checking
bun run build:production    # Build for all platforms (EAS)
bun run build:development   # Development client build
bun run update:production   # Push OTA update
```

**Note**: There is no test suite configured. No Jest, Vitest, or testing commands available.

## Project Structure

```
app/                    # Expo Router screens (file-based routing)
  (tabs)/               # Tab navigator screens
  details/[id].tsx      # Dynamic routes use [param] syntax
components/             # Reusable UI components
containers/             # Container components with data fetching
screens/                # Screen-specific components
graphql/                # GraphQL operations
  client.ts             # Apollo Client setup
  generated.tsx         # Auto-generated types & hooks (DO NOT EDIT)
  fragments/            # GraphQL fragments
  queries/              # GraphQL queries
  mutations/            # GraphQL mutations
hooks/                  # Custom React hooks
takimoto/               # Custom responsive styling system
```

## Code Style Guidelines

### Imports

ESLint enforces strict import ordering with newlines between groups:

```typescript
// 1. External packages (alphabetically)
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text } from "react-native";

// 2. Internal imports using "yep/*" alias (alphabetically)
import { Button } from "yep/components/Button";
import { darkTheme } from "yep/themes";

// 3. Relative imports
import { LocalComponent } from "./LocalComponent";
```

**Path alias**: Use `yep/*` for all non-relative imports (maps to project root).

### TypeScript & Types

- Strict mode enabled - no implicit any
- Define prop types inline using `type Props = {...}`
- Prefer type unions over enums (except for storage keys)

```typescript
type ButtonSize = "normal" | "large" | "small";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean; // Optional props use ?
};

export function Button({ label, onPress, disabled }: Props) {
  // ...
}
```

### Naming Conventions

- **Components/Types**: PascalCase (`AnimeListItem`, `Button`, `Props`)
- **Component files**: PascalCase (`Button.tsx`, `AnimeListItem/index.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAccessToken`, `useNow`)
- **Utility files**: camelCase (`helpers.ts`, `utils.tsx`)
- **Constants**: SCREAMING_SNAKE_CASE (`ANILIST_ACCESS_TOKEN_STORAGE`)

### Component Patterns

```typescript
// Function components (not arrow functions for exports)
export function ComponentName({ prop1, prop2 }: Props) {
  return <View>...</View>;
}

// Styles at bottom of file using StyleSheet.create
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});
```

### Styling

Two approaches: **StyleSheet.create** (standard) and **takimoto** (responsive):

```typescript
const Container = takimoto.View({
  flex: 1,
  padding: 16,
  whenWidth: { "<=": { 700: { padding: 8 } } }, // Mobile breakpoint
});
```

### Error Handling

```typescript
// Try-catch with console.error for debugging
try {
  await someOperation();
} catch (error) {
  console.error(error);
}

// Sentry for production, Toast for user-facing errors
Sentry.captureException(error);
Toast.show(error.message, {
  duration: Toast.durations.LONG,
  position: Toast.positions.TOP,
});
```

### GraphQL

- Queries/mutations in `graphql/queries/` and `graphql/mutations/`
- Run `bun run gql` after changes to regenerate types
- Use generated hooks from `graphql/generated.tsx`

```typescript
import { useGetAnimeQuery } from "yep/graphql/generated";
const { loading, data, refetch } = useGetAnimeQuery({
  variables: { id: animeId },
});
```

## React Compiler

This project uses React Compiler. ESLint enforces `react-compiler/react-compiler: "error"`. Follow React rules strictly: no conditional hooks, stable dependencies, pure render functions.

## Key Files

- `app/_layout.tsx` - Root layout with providers
- `graphql/client.ts` - Apollo Client configuration
- `graphql/generated.tsx` - Auto-generated (DO NOT EDIT)
- `useAccessToken.tsx` - Global auth state
- `themes.ts` - Dark theme colors
- `constants.ts` - App constants

## Common Gotchas

1. Always run `bun run gql` after modifying GraphQL files
2. Use `yep/*` path alias, not relative paths for non-local imports
3. `graphql/generated.tsx` is auto-generated - never edit directly
4. Mobile breakpoint is 700px width
5. Only dark theme is implemented
6. No test framework - manual testing required

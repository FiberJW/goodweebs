# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Goodweebs is a React Native mobile app (iOS/Android/Web) built with Expo SDK 54 and React 19. It serves as an AniList client for tracking anime, using GraphQL with Apollo Client.

**Tech Stack**: React Native 0.81.5, Expo SDK 54, TypeScript 5.9 (strict), Expo Router, Apollo Client 3.x, Bun

## Commands

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

**Note**: No test suite is configured.

## Architecture

```
app/                    # Expo Router screens (file-based routing)
  (tabs)/               # Tab navigator (WATCHING, DISCOVER, PROFILE)
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

## Code Style

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

### TypeScript

- Strict mode enabled - no implicit any
- Define prop types inline using `type Props = {...}`
- Prefer type unions over enums

```typescript
type ButtonSize = "normal" | "large" | "small";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function Button({ label, onPress, disabled }: Props) {
  // ...
}
```

### Components

- Use function declarations (not arrow functions) for exports
- Styles at bottom using `StyleSheet.create`

### Styling

Two approaches: **StyleSheet.create** (standard) and **takimoto** (responsive):

```typescript
const Container = takimoto.View({
  flex: 1,
  padding: 16,
  whenWidth: { "<=": { 700: { padding: 8 } } }, // Mobile breakpoint
});
```

### GraphQL Workflow

1. Add/modify files in `graphql/queries/`, `graphql/mutations/`, or `graphql/fragments/`
2. Run `bun run gql` to regenerate types
3. Use generated hooks from `graphql/generated.tsx`

```typescript
import { useGetAnimeQuery } from "yep/graphql/generated";
const { loading, data, refetch } = useGetAnimeQuery({
  variables: { id: animeId },
});
```

## React Compiler

ESLint enforces `react-compiler/react-compiler: "error"`. Follow React rules strictly: no conditional hooks, stable dependencies, pure render functions.

## Gotchas

- Always run `bun run gql` after modifying GraphQL files
- `graphql/generated.tsx` is auto-generated - never edit directly
- Mobile breakpoint is 700px width
- Only dark theme is implemented
- iOS 16+ required, Android API 35+

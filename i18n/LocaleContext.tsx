// Ensures the synchronous localStorage polyfill is installed before this
// module's body reads it at eval time (this can load before app/_layout).
import "expo-sqlite/localStorage/install";
import { getLocales } from "expo-localization";
import {
  createLocaleContext,
  useLocaleContext as useBaseLocaleContext,
} from "fbtee";
import React, { PropsWithChildren } from "react";

import jaJP from "yep/i18n/translations/ja_JP.json";

export const availableLanguages = new Map([
  ["en_US", "English"],
  ["ja_JP", "日本語 (Japanese)"],
] as const);

const LOCALE_STORAGE_KEY = "LOCALE";

const LocaleContext = createLocaleContext({
  availableLanguages,
  // Persisted choice wins over device locales; fbtee picks the first match.
  clientLocales: [
    localStorage.getItem(LOCALE_STORAGE_KEY),
    ...getLocales().map(({ languageTag }) => languageTag.replace(/-/g, "_")),
  ],
  // Preload the (statically bundled) ja_JP table so booting straight into
  // Japanese renders translated UI — fbtee only calls loadLocale on an
  // interactive setLocale, never for the initial locale.
  translations: { ja_JP: jaJP.ja_JP },
  loadLocale: async (locale: string) => {
    if (locale === "ja_JP") {
      return jaJP.ja_JP;
    }

    return {};
  },
});

// Wrap fbtee's hook so setLocale also persists the choice across reboots.
export function useLocaleContext() {
  const context = useBaseLocaleContext();
  return {
    ...context,
    setLocale: (locale: string) => {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      context.setLocale(locale);
    },
  };
}

type Props = PropsWithChildren;

export function LocaleProvider({ children }: Props) {
  return <LocaleContext>{children}</LocaleContext>;
}

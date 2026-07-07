import { getLocales } from "expo-localization";
import { createLocaleContext, useLocaleContext } from "fbtee";
import React, { PropsWithChildren } from "react";

import jaJP from "yep/i18n/translations/ja_JP.json";

export const availableLanguages = new Map([
  ["en_US", "English"],
  ["ja_JP", "日本語 (Japanese)"],
] as const);

const LocaleContext = createLocaleContext({
  availableLanguages,
  // The OS per-app Language setting (declared via expo-localization's
  // supportedLocales in app.config.ts) surfaces through getLocales(); the OS
  // persists it across reboots, so it's the single source of truth.
  clientLocales: getLocales().map(({ languageTag }) =>
    languageTag.replace(/-/g, "_"),
  ),
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

export { useLocaleContext };

type Props = PropsWithChildren;

export function LocaleProvider({ children }: Props) {
  return <LocaleContext>{children}</LocaleContext>;
}

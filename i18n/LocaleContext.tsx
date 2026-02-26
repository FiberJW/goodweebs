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
  clientLocales: getLocales().map(({ languageTag }) =>
    languageTag.replace(/-/g, "_"),
  ),
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

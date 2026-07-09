import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import * as SecureStore from "expo-secure-store";
import { fbs } from "fbtee";
import React, { useState } from "react";
import {
  Alert,
  View,
  ScrollView,
  StyleSheet,
  Text,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "yep/components/Button";
import { CheckboxRow } from "yep/components/CheckboxRow";
import { PressableOpacity } from "yep/components/PressableOpacity";
import {
  ANILIST_ACCESS_TOKEN_STORAGE,
  DEFAULT_SCORE_FORMAT,
} from "yep/constants";
import { primeAccessToken } from "yep/graphql/client";
import type {
  ScoreFormat,
  UserStaffNameLanguage,
  UserTitleLanguage,
} from "yep/graphql/enums";
import { graphql } from "yep/graphql/tada";
import { GetViewer } from "yep/graphql/viewer";
import { StorageKeys, usePersistedState } from "yep/hooks/helpers";
import {
  availableLanguages,
  useLocaleContext,
} from "yep/i18n/LocaleContext";
import { darkTheme } from "yep/themes";
import { Manrope } from "yep/typefaces";
import { useAccessToken } from "yep/useAccessToken";

const UpdateScoreFormat = graphql(`
  mutation UpdateScoreFormat($scoreFormat: ScoreFormat) {
    UpdateUser(scoreFormat: $scoreFormat) {
      id
      mediaListOptions {
        scoreFormat
      }
    }
  }
`);

// One mutation for both language pickers; the caller passes only the field it
// changes, so the omitted variable leaves the other AniList option untouched.
const UpdateLanguageOptions = graphql(`
  mutation UpdateLanguageOptions(
    $titleLanguage: UserTitleLanguage
    $staffNameLanguage: UserStaffNameLanguage
  ) {
    UpdateUser(
      titleLanguage: $titleLanguage
      staffNameLanguage: $staffNameLanguage
    ) {
      id
      options {
        titleLanguage
        staffNameLanguage
      }
    }
  }
`);

const scoreFormats: ScoreFormat[] = [
  "POINT_100",
  "POINT_10_DECIMAL",
  "POINT_10",
  "POINT_5",
  "POINT_3",
];

const titleLanguages: UserTitleLanguage[] = ["ROMAJI", "ENGLISH", "NATIVE"];
// AniList has no English form for names — only romaji and native.
const staffNameLanguages: UserStaffNameLanguage[] = ["ROMAJI", "NATIVE"];

// The pickers only offer the base languages, but AniList may store a stylised
// (title) or western (name) variant set on the web — collapse to the base so
// the right row highlights.
function baseTitleLanguage(
  language: UserTitleLanguage | null | undefined,
): UserTitleLanguage {
  if (language === "ENGLISH" || language === "ENGLISH_STYLISED") return "ENGLISH";
  if (language === "NATIVE" || language === "NATIVE_STYLISED") return "NATIVE";
  return "ROMAJI";
}

function baseStaffNameLanguage(
  language: UserStaffNameLanguage | null | undefined,
): UserStaffNameLanguage {
  return language === "NATIVE" ? "NATIVE" : "ROMAJI";
}

// Called in render (not module scope) so labels re-resolve on locale change.
function getTitleLanguageLabel(language: UserTitleLanguage) {
  switch (language) {
    case "ENGLISH":
      return String(fbs("English", "English title language label"));
    case "NATIVE":
      return String(fbs("Japanese (native)", "Native title language label"));
    default:
      return String(fbs("Romaji", "Romaji title language label"));
  }
}

function getStaffNameLanguageLabel(language: UserStaffNameLanguage) {
  return language === "NATIVE"
    ? String(fbs("Japanese (native)", "Native name language label"))
    : String(fbs("Romaji", "Romaji name language label"));
}

// Called in render (not module scope) so labels re-resolve on locale change.
function getScoreFormatLabel(format: ScoreFormat) {
  switch (format) {
    case "POINT_100":
      return String(fbs("100 point (55/100)", "100 point score format label"));
    case "POINT_10_DECIMAL":
      return String(
        fbs("10 point decimal (5.5/10)", "10 point decimal score format label"),
      );
    case "POINT_10":
      return String(fbs("10 point (5/10)", "10 point score format label"));
    case "POINT_5":
      return String(fbs("5 star (3/5)", "5 star score format label"));
    case "POINT_3":
      return String(
        fbs("3 point smiley :)", "3 point smiley score format label"),
      );
  }
}

// Optimistic write shared by every picker: highlight the tapped row, run the
// mutation, then clear the pending value so the normalized cache result shows
// through (or reverts on failure — the global onError link toasts).
async function selectWith<T>(
  value: T,
  setPending: (value: T | null) => void,
  run: () => Promise<unknown>,
) {
  setPending(value);
  try {
    await run();
  } catch (error) {
    console.error(error);
  } finally {
    setPending(null);
  }
}

// One selectable list card (section title + radio rows) — shared by the rating,
// title-language, and name-language settings, which differ only in their option
// set, labels, and the mutation each row fires.
function RadioSetting<T extends string>({
  title,
  options,
  selected,
  saving,
  getLabel,
  onSelect,
}: {
  title: string;
  options: readonly T[];
  selected: T;
  saving: boolean;
  getLabel: (option: T) => string;
  onSelect: (option: T) => void;
}) {
  return (
    <View style={{ flexDirection: "column" }}>
      <Text
        style={{
          color: darkTheme.subHeader,
          fontFamily: Manrope.semiBold,
          fontSize: 20,
          marginBottom: 24,
        }}
      >
        {title}
      </Text>
      <View style={styles.radioCard}>
        {options.map((option, index) => {
          const isSelected = selected === option;
          return (
            <PressableOpacity
              key={option}
              // Saving dims every row to 0.4 via the disabled opacity — that's
              // the loading state. The selected row is always disabled but
              // stays full-opacity.
              disabled={saving || isSelected}
              useDisabledOpacity={saving}
              accessibilityState={{ selected: isSelected }}
              style={[styles.radioRow, index > 0 && styles.radioRowSeparator]}
              onPress={() => onSelect(option)}
            >
              <Text
                style={[
                  styles.radioLabel,
                  isSelected && styles.radioLabelSelected,
                ]}
              >
                {getLabel(option)}
              </Text>
              <View
                style={[
                  styles.radioOuter,
                  isSelected && styles.radioOuterSelected,
                ]}
              >
                {isSelected ? <View style={styles.radioInner} /> : null}
              </View>
            </PressableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function Settings() {
  const { locale } = useLocaleContext();

  const [hideScores, setHideScores] = usePersistedState<boolean>(
    StorageKeys.HIDE_SCORES_GLOBAL,
  );
  const [optOutCrashReporting, setOptOutCrashReporting] =
    usePersistedState<boolean>(StorageKeys.OPT_OUT_CRASH_REPORTING);
  const [optOutAnalytics, setOptOutAnalytics] = usePersistedState<boolean>(
    StorageKeys.OPT_OUT_ANALYTICS,
  );
  const [shouldPersistScoreVisibility, setShouldPersistScoreVisibility] =
    usePersistedState<boolean>(StorageKeys.SHOULD_PERSIST_SCORE_VISIBILITY);

  const client = useApolloClient();
  const { setAccessToken, setContinuedWithoutLogin, accessToken } =
    useAccessToken();
  const insets = useSafeAreaInsets();

  // cache-only: profile (the only way here) already fetched the viewer.
  const { data: viewerData } = useQuery(GetViewer, { fetchPolicy: "cache-only" });
  // Changing the format makes AniList recompute every stored score, so cached
  // score fields are stale in the old scale — refetch whatever is on screen.
  const [updateScoreFormat, { loading: savingScoreFormat }] =
    useMutation(UpdateScoreFormat, { refetchQueries: "active" });
  // Optimistic selection: highlight the tapped pill immediately; the mutation
  // response normalizes into User.mediaListOptions, so clearing this after the
  // round trip lands on the same value (or reverts on failure — the global
  // onError link toasts).
  const [pendingScoreFormat, setPendingScoreFormat] =
    useState<ScoreFormat | null>(null);
  const scoreFormat =
    pendingScoreFormat ??
    viewerData?.Viewer?.mediaListOptions?.scoreFormat ??
    DEFAULT_SCORE_FORMAT;

  // Titles/names are chosen client-side from the already-cached
  // { romaji english native } / { full native }, so the mutation just returns
  // the changed options — the normalized User merge re-renders every site. No
  // refetchQueries (unlike score format, nothing server-side is recomputed).
  const [updateLanguageOptions, { loading: savingLanguage }] =
    useMutation(UpdateLanguageOptions);
  const [pendingTitleLanguage, setPendingTitleLanguage] =
    useState<UserTitleLanguage | null>(null);
  const [pendingStaffNameLanguage, setPendingStaffNameLanguage] =
    useState<UserStaffNameLanguage | null>(null);
  const titleLanguage = baseTitleLanguage(
    pendingTitleLanguage ?? viewerData?.Viewer?.options?.titleLanguage,
  );
  const staffNameLanguage = baseStaffNameLanguage(
    pendingStaffNameLanguage ?? viewerData?.Viewer?.options?.staffNameLanguage,
  );

  return (
    <ScrollView
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: insets.bottom + 16 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: "column" }}>
          <Text
            style={{
              color: darkTheme.subHeader,
              fontFamily: Manrope.semiBold,
              fontSize: 20,
              marginBottom: 24,
            }}
          >
            {String(fbs("Display settings", "Display settings section title"))}
          </Text>
          <View style={styles.checkboxGroup}>
            <CheckboxRow
              label={String(
                fbs("Hide scores by default", "Hide scores setting label"),
              )}
              value={hideScores}
              onValueChange={setHideScores}
            />
            <CheckboxRow
              label={String(
                fbs(
                  "Should persist score visibility per anime",
                  "Persist score visibility setting label",
                ),
              )}
              value={shouldPersistScoreVisibility}
              onValueChange={setShouldPersistScoreVisibility}
            />
          </View>
        </View>
        {accessToken ? (
          <RadioSetting
            title={String(fbs("Rating style", "Rating style section title"))}
            options={scoreFormats}
            selected={scoreFormat}
            saving={savingScoreFormat}
            getLabel={getScoreFormatLabel}
            onSelect={(format) =>
              selectWith(format, setPendingScoreFormat, () =>
                updateScoreFormat({ variables: { scoreFormat: format } }),
              )
            }
          />
        ) : null}
        {accessToken ? (
          <RadioSetting
            title={String(fbs("Title language", "Title language section title"))}
            options={titleLanguages}
            selected={titleLanguage}
            // Scope the saving dim to this card — both pickers share one
            // mutation, so an unscoped flag would dim the other one too.
            saving={savingLanguage && pendingTitleLanguage !== null}
            getLabel={getTitleLanguageLabel}
            onSelect={(language) =>
              selectWith(language, setPendingTitleLanguage, () =>
                updateLanguageOptions({ variables: { titleLanguage: language } }),
              )
            }
          />
        ) : null}
        {accessToken ? (
          <RadioSetting
            title={String(fbs("Name language", "Name language section title"))}
            options={staffNameLanguages}
            selected={staffNameLanguage}
            saving={savingLanguage && pendingStaffNameLanguage !== null}
            getLabel={getStaffNameLanguageLabel}
            onSelect={(language) =>
              selectWith(language, setPendingStaffNameLanguage, () =>
                updateLanguageOptions({
                  variables: { staffNameLanguage: language },
                }),
              )
            }
          />
        ) : null}
        <View style={{ flexDirection: "column" }}>
          <Text
            style={{
              color: darkTheme.subHeader,
              fontFamily: Manrope.semiBold,
              fontSize: 20,
              marginBottom: 24,
            }}
          >
            {String(fbs("Language", "Language settings section title"))}
          </Text>
          {/* The app language is the OS per-app Language setting; there's no
              public API to set it from in-app, so this row opens Settings. */}
          <PressableOpacity
            accessibilityRole="button"
            accessibilityHint={String(
              fbs(
                "Opens the system settings where you can change the app language",
                "Language settings row accessibility hint",
              ),
            )}
            style={[styles.radioCard, styles.radioRow]}
            onPress={() => Linking.openSettings()}
          >
            <Text style={styles.radioLabelSelected}>
              {[...availableLanguages].find(([code]) => code === locale)?.[1] ??
                locale}
            </Text>
            <Text style={styles.radioLabel}>
              {String(
                fbs("Change in Settings", "Language change-in-settings hint"),
              )}
            </Text>
          </PressableOpacity>
        </View>
        <View style={{ flexDirection: "column" }}>
          <Text
            style={{
              color: darkTheme.subHeader,
              fontFamily: Manrope.semiBold,
              fontSize: 20,
              marginBottom: 24,
            }}
          >
            {String(fbs("Privacy settings", "Privacy settings section title"))}
          </Text>
          <View style={styles.checkboxGroup}>
            <CheckboxRow
              label={String(
                fbs(
                  "Opt-out of crash reporting",
                  "Crash reporting opt-out setting label",
                ),
              )}
              value={optOutCrashReporting}
              onValueChange={setOptOutCrashReporting}
            />
            <CheckboxRow
              label={String(
                fbs(
                  "Opt-out of session analytics",
                  "Session analytics opt-out setting label",
                ),
              )}
              value={optOutAnalytics}
              onValueChange={setOptOutAnalytics}
            />
          </View>
        </View>
      </View>
      <View style={{ gap: 16, alignItems: "stretch" }}>
        <PressableOpacity
          style={{ alignSelf: "center" }}
          onPress={() => {
            Linking.openURL(
              "https://fiberjw.notion.site/Privacy-Policy-for-Goodweebs-1f70379bbe828028b5eed7413e8184e5?pvs=4",
            );
          }}
        >
          <Text
            style={{
              color: darkTheme.subText,
              fontFamily: Manrope.semiBold,
              fontSize: 16,
            }}
          >
            {String(fbs("Privacy policy", "Privacy policy link label"))}
          </Text>
        </PressableOpacity>
        {accessToken ? (
          <Button
            label={String(fbs("Log out", "Log out button label"))}
            onPress={async () => {
              Alert.alert(
                String(
                  fbs(
                    "Are you sure that you want to log out?",
                    "Log out confirmation message",
                  ),
                ),
                undefined,
                [
                  {
                    style: "cancel",
                    text: String(fbs("Cancel", "Cancel button label")),
                  },
                  {
                    text: String(
                      fbs("Log out", "Log out confirmation button label"),
                    ),
                    style: "destructive",
                    onPress: async () => {
                      await SecureStore.deleteItemAsync(
                        ANILIST_ACCESS_TOKEN_STORAGE,
                      );
                      primeAccessToken(null);
                      // A different account may log in next; a stale viewer id
                      // would fetch the previous user's list.
                      localStorage.removeItem(StorageKeys.ANILIST_VIEWER_ID);
                      // Clearing both flips the Protected guard; RN swaps this
                      // screen (and the tabs) out for auth automatically.
                      setContinuedWithoutLogin(false);
                      setAccessToken(undefined);
                      // clearStore (not resetStore): resetStore refetches every
                      // active query unauthenticated, spraying error toasts
                      // over the login screen.
                      await client.clearStore();
                    },
                  },
                ],
              );
            }}
          />
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  checkboxGroup: {
    flexDirection: "column",
    gap: 16,
  },
  contentContainer: {
    // flexGrow (not flex): the rating-style section makes the page taller
    // than the viewport, and flex: 1 would clip instead of scroll.
    flexGrow: 1,
    gap: 16,
    justifyContent: "space-between",
    padding: 16,
  },
  radioCard: {
    backgroundColor: darkTheme.listItemBackground,
    borderColor: darkTheme.listItemBorder,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  radioRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  radioRowSeparator: {
    borderTopColor: darkTheme.listItemBorder,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  radioLabel: {
    color: darkTheme.subText,
    fontFamily: Manrope.regular,
    fontSize: 16,
  },
  radioLabelSelected: {
    color: darkTheme.text,
    fontFamily: Manrope.semiBold,
  },
  radioOuter: {
    alignItems: "center",
    borderColor: darkTheme.buttonBorder,
    borderRadius: 10,
    borderWidth: 1.5,
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  radioOuterSelected: {
    borderColor: darkTheme.text,
  },
  radioInner: {
    backgroundColor: darkTheme.text,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
});

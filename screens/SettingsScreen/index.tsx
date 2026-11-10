import { useMutation } from "@apollo/client";
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
import type {
  ScoreFormat,
  UserStaffNameLanguage,
  UserTitleLanguage,
} from "yep/graphql/enums";
import { graphql } from "yep/graphql/tada";
import { useViewer } from "yep/graphql/viewer";
import { availableLanguages, useLocaleContext } from "yep/i18n/LocaleContext";
import { ScoreFormatConfig, getScoreFormatLabel } from "yep/score";
import { signOut, useAccessToken } from "yep/session";
import { Settings, usePersistedState } from "yep/storage";
import { useOptOut } from "yep/telemetry";
import { darkTheme } from "yep/themes";
import { resolveNameLanguage, resolveTitleLanguage } from "yep/titleName";
import { Manrope } from "yep/typefaces";

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

const scoreFormats = Object.keys(ScoreFormatConfig) as ScoreFormat[];

const titleLanguages: UserTitleLanguage[] = ["ROMAJI", "ENGLISH", "NATIVE"];
// AniList has no English form for names — only romaji and native.
const staffNameLanguages: UserStaffNameLanguage[] = ["ROMAJI", "NATIVE"];

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
    <SettingsSection title={title}>
      <View style={styles.radioCard}>
        {options.map((option, index) => {
          const isSelected = selected === option;
          return (
            <PressableOpacity
              key={option}
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
    </SettingsSection>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const { locale } = useLocaleContext();

  const [hideScores, setHideScores] = usePersistedState(Settings.hideScores);
  const [optOutCrashReporting, setOptOutCrashReporting] = useOptOut(
    Settings.optOutCrashReporting,
  );
  const [optOutAnalytics, setOptOutAnalytics] = useOptOut(
    Settings.optOutAnalytics,
  );
  const [shouldPersistScoreVisibility, setShouldPersistScoreVisibility] =
    usePersistedState(Settings.persistScoreVisibility);

  const { accessToken } = useAccessToken();
  const insets = useSafeAreaInsets();

  const { viewer, scoreFormat: savedScoreFormat } = useViewer();
  // Changing the format makes AniList recompute every stored score, so cached
  // score fields are stale in the old scale — refetch whatever is on screen.
  const [updateScoreFormat, { loading: savingScoreFormat }] = useMutation(
    UpdateScoreFormat,
    { refetchQueries: "active" },
  );
  const [pendingScoreFormat, setPendingScoreFormat] =
    useState<ScoreFormat | null>(null);
  const scoreFormat = pendingScoreFormat ?? savedScoreFormat;

  const [updateLanguageOptions, { loading: savingLanguage }] = useMutation(
    UpdateLanguageOptions,
  );
  const [pendingTitleLanguage, setPendingTitleLanguage] =
    useState<UserTitleLanguage | null>(null);
  const [pendingStaffNameLanguage, setPendingStaffNameLanguage] =
    useState<UserStaffNameLanguage | null>(null);
  const titleLanguage = resolveTitleLanguage(
    locale,
    pendingTitleLanguage ?? viewer?.options?.titleLanguage,
  );
  const staffNameLanguage = resolveNameLanguage(
    pendingStaffNameLanguage ?? viewer?.options?.staffNameLanguage,
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
        <SettingsSection
          title={String(
            fbs("Display settings", "Display settings section title"),
          )}
        >
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
        </SettingsSection>
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
            title={String(
              fbs("Title language", "Title language section title"),
            )}
            options={titleLanguages}
            selected={titleLanguage}
            saving={savingLanguage && pendingTitleLanguage !== null}
            getLabel={getTitleLanguageLabel}
            onSelect={(language) =>
              selectWith(language, setPendingTitleLanguage, () =>
                updateLanguageOptions({
                  variables: { titleLanguage: language },
                }),
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
        <SettingsSection
          title={String(fbs("Language", "Language settings section title"))}
        >
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
        </SettingsSection>
        <SettingsSection
          title={String(
            fbs("Privacy settings", "Privacy settings section title"),
          )}
        >
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
        </SettingsSection>
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
                    onPress: signOut,
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
  sectionTitle: {
    color: darkTheme.subHeader,
    fontFamily: Manrope.semiBold,
    fontSize: 20,
    marginBottom: 24,
  },
  checkboxGroup: {
    flexDirection: "column",
    gap: 16,
  },
  contentContainer: {
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

import { useState } from "react";

type Setting<T> = { key: string; defaultValue: T };

export function setting<T>(key: string, defaultValue: T): Setting<T> {
  return { key, defaultValue };
}

export const Settings = {
  hideScores: setting("HIDE_SCORES_GLOBAL", true),
  persistScoreVisibility: setting("SHOULD_PERSIST_SCORE_VISIBILITY", true),
  scoreRevealed: setting("SHOW_SCORE_FOR_MEDIA", false),
  optOutCrashReporting: setting("OPT_OUT_CRASH_REPORTING", false),
  optOutAnalytics: setting("OPT_OUT_ANALYTICS", false),
  viewerId: setting<number | null>("ANILIST_VIEWER_ID", null),
};

function storageKey({ key }: Setting<unknown>, id?: string) {
  return id ? `${key}:${id}` : key;
}

export function readSetting<T>(setting: Setting<T>, id?: string): T {
  const data = localStorage.getItem(storageKey(setting, id));
  return data ? JSON.parse(data) : setting.defaultValue;
}

export function removeSetting(setting: Setting<unknown>) {
  localStorage.removeItem(storageKey(setting));
}

export function usePersistedState<T>(
  setting: Setting<T>,
  { id, persist = true }: { id?: string; persist?: boolean } = {},
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() =>
    persist ? readSetting(setting, id) : setting.defaultValue,
  );

  function update(next: T) {
    if (persist) {
      localStorage.setItem(storageKey(setting, id), JSON.stringify(next));
    }
    setValue(next);
  }

  return [value, update];
}

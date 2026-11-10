import { useQuery } from "@apollo/client";
import { useEffect } from "react";

import { graphql } from "yep/graphql/tada";
import { useLocaleContext } from "yep/i18n/LocaleContext";
import { DEFAULT_SCORE_FORMAT } from "yep/score";
import { fakeName } from "yep/screenshotMode";
import { useAccessToken } from "yep/session";
import { Settings, usePersistedState } from "yep/storage";
import {
  getName,
  getTitle,
  type NameInput,
  type TitleInput,
} from "yep/titleName";

const GetViewer = graphql(`
  query GetViewer {
    Viewer {
      id
      unreadNotificationCount
      mediaListOptions {
        scoreFormat
      }
      options {
        titleLanguage
        staffNameLanguage
      }
    }
  }
`);

export function formatUnreadCount(count: number) {
  return count > 99 ? "99+" : `${count}`;
}

export function useViewer() {
  const { accessToken } = useAccessToken();
  const query = useQuery(GetViewer, { skip: !accessToken });
  const viewer = query.data?.Viewer;
  return {
    ...query,
    viewer,
    scoreFormat: viewer?.mediaListOptions?.scoreFormat ?? DEFAULT_SCORE_FORMAT,
  };
}

// The viewer id outlives a launch, so on a cold start the list query can
// fire without waiting for a GetViewer round-trip.
export function useViewerId() {
  const { accessToken } = useAccessToken();
  const { viewer } = useViewer();
  const [persistedId, setPersistedId] = usePersistedState(Settings.viewerId);
  useEffect(() => {
    if (viewer && viewer.id !== persistedId) setPersistedId(viewer.id);
  }, [viewer, persistedId, setPersistedId]);
  return accessToken ? (viewer?.id ?? persistedId ?? undefined) : undefined;
}

export function useGetTitle() {
  const { locale } = useLocaleContext();
  const titleLanguage = useViewer().viewer?.options?.titleLanguage;

  return (title: TitleInput) =>
    fakeName(getTitle(title, locale, titleLanguage));
}

export function useGetName() {
  const staffNameLanguage = useViewer().viewer?.options?.staffNameLanguage;

  return (name: NameInput) => fakeName(getName(name, staffNameLanguage));
}

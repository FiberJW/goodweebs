// AniList ships notification copy as string fragments: airing rows as
// `contexts` (["Episode ", " of ", " aired."]) with the episode and media
// title spliced between them, related-addition rows as a single trailing
// `context`. API copy is English-only; only the title is localized.
type NotificationTextSource = {
  __typename?: string;
  episode?: number | null;
  contexts?: (string | null)[] | null;
  context?: string | null;
};

export function getNotificationText(
  notification: NotificationTextSource,
  title: string,
): string {
  if (notification.__typename === "AiringNotification") {
    const [before, between, after] = notification.contexts ?? [
      "Episode ",
      " of ",
      " aired.",
    ];
    return `${before ?? ""}${notification.episode ?? ""}${between ?? ""}${title}${after ?? ""}`;
  }

  return `${title}${notification.context ?? " was recently added to the site."}`;
}

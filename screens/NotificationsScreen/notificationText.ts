import type { NotificationRowData } from "./NotificationRow";

// AniList ships notification copy as string fragments: airing rows as
// `contexts` (["Episode ", " of ", " aired."]) with the episode and media
// title spliced between them, related-addition rows as a single trailing
// `context`. API copy is English-only; only the title is localized. The row
// type is the discriminated union of both members, so `__typename` narrows it.
export function getNotificationText(
  notification: NotificationRowData,
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

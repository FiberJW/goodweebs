import { MediaTitle, MediaRelation } from "./graphql/generated";

export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined;
}

export function getTitle(
  title: MediaTitle | undefined | null
): string | undefined {
  if (!title) return undefined;

  return (title.english || title.romaji || title.native) ?? undefined;
}

// for making sure TS exhaustively checks switches
export function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here");
}

export function getReadableMediaRelation(mediaRelation: MediaRelation): string {
  switch (mediaRelation) {
    case MediaRelation.Adaptation:
      return "Adapation";
    case MediaRelation.Alternative:
      return "Alternative";
    case MediaRelation.Prequel:
      return "Prequel";
    case MediaRelation.Parent:
      return "Parent";
    case MediaRelation.Sequel:
      return "Sequel";
    case MediaRelation.Character:
      return "Character";
    case MediaRelation.SideStory:
      return "Side story";
    case MediaRelation.Summary:
      return "Summary";
    case MediaRelation.SpinOff:
      return "Spin off";
    case MediaRelation.Other:
      return "Other";
    case MediaRelation.Source:
      return "Source";
    case MediaRelation.Compilation:
      return "Compilation";
    case MediaRelation.Contains:
      return "Contains";
  }
}

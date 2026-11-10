import { fbs } from "fbtee";

import type { ScoreFormat } from "yep/graphql/enums";

export const DEFAULT_SCORE_FORMAT: ScoreFormat = "POINT_10";

// Stepper bounds/step per AniList score format; the server stores raw 0–100
// and interprets `score` in the viewer's format, so no client-side conversion.
// ponytail: POINT_10_DECIMAL steps by 0.5, not 0.1 — 0.1 makes the stepper unusable.
export const ScoreFormatConfig: Record<
  ScoreFormat,
  { max: number; step: number }
> = {
  POINT_100: { max: 100, step: 1 },
  POINT_10_DECIMAL: { max: 10, step: 0.5 },
  POINT_10: { max: 10, step: 1 },
  POINT_5: { max: 5, step: 1 },
  POINT_3: { max: 3, step: 1 },
};

// Matches AniList's own display: denominator for point scales, a star for the
// 5-star scale, and smiley faces (not numbers) for the 3-point scale.
export function isEmojiScore(format: ScoreFormat) {
  return format === "POINT_3";
}

export function formatScore(score: number, format: ScoreFormat): string {
  switch (format) {
    case "POINT_100":
      return `${score}/100`;
    case "POINT_10_DECIMAL":
    case "POINT_10":
      return `${score}/10`;
    case "POINT_5":
      return `${score}/5 ★`;
    case "POINT_3":
      return ["—", "🙁", "😐", "🙂"][score] ?? "🙂";
  }
}

export function getScoreFormatLabel(format: ScoreFormat) {
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

// Throwaway toggle for capturing App Store screenshots without exposing
// third-party cover art / titles (App Store guideline 4.1a). When on, every
// poster/character image is blurred and every media title + character name is
// replaced with an invented one.
//
// ponytail: FLIP BACK TO false BEFORE SHIPPING. Not meant for production —
// this is a manual screenshot aid, not a feature flag.
export const SCREENSHOT_MODE = false;

// px. Enough to obscure art but keep the "it's a cover grid" silhouette.
export const SCREENSHOT_BLUR_RADIUS = SCREENSHOT_MODE ? 64 : 0;

// Invented romaji titles — deliberately not real series (see 4.1a). Compound
// enough that collision with an obscure real anime is unlikely.
const FAKE_NAMES = [
  "Hoshikuzu no Senki",
  "Yozora Drifters",
  "Tsukikage Ronin",
  "Kaze to Hagane",
  "Aoi Kiseki",
  "Ginmaku Kessen",
  "Yoake no Shirube",
  "Ryuusei Cafe",
  "Neko to Kikai",
  "Sora no Kakera",
  "Yukihana Gakuen",
  "Kurogane Symphony",
  "Hikari no Tabibito",
  "Mahoroba Days",
  "Shinkai Elegy",
  "Kirameki Protocol",
];

// Japanese-flavored handles for the profile username.
const FAKE_HANDLES = [
  "yuki_otaku",
  "SoraWatcher",
  "tsuki_no_ken",
  "hoshi_drifter",
  "AoiSenpai",
  "neko_pilot",
  "ryuusei_fan",
  "MahoroReader",
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// Deterministic real->fake so the same title/character reads the same across
// every screen. ponytail: keyed off the display string, not a stable id — two
// spellings of one title could diverge, but for hand-reviewed screenshots
// that's fine.
export function fakeName<T extends string | null | undefined>(real: T): T {
  if (!SCREENSHOT_MODE || !real) return real;
  return FAKE_NAMES[hash(real) % FAKE_NAMES.length] as T;
}

export function fakeHandle<T extends string | null | undefined>(real: T): T {
  if (!SCREENSHOT_MODE || !real) return real;
  return FAKE_HANDLES[hash(real) % FAKE_HANDLES.length] as T;
}

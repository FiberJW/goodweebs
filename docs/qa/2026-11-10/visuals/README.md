# EAS visual evidence

Captured 2026-11-10 from remote EAS simulators, using the original checkout at `3836499` and the cumulative PR stack at `e57b9e9`. The after images include #87, #88 and #89; they are not isolated tests of each PR.

The baseline client is the existing compatible SDK 58 development build with iOS 27.1 SDK. The after client is the fresh SDK 58 build with iOS 27.2 SDK. Each fetched its matching source checkout through a separate task-owned Metro tunnel. No app source changed during capture. PNGs are unretouched; the screenshot tool's orientation option exports landscape captures upright.

## iPhone Duo, iOS 27.1

[EAS session](https://expo.dev/accounts/fiberjw/projects/goodweebs/simulator-sessions/01a1c4d4-244c-7378-bcd8-a2708b31adc1)

Closed: the baseline grid extends beneath the system rail. The after grid keeps all three columns in the content area.

| Before | After |
| --- | --- |
| ![Closed Duo before](duo-closed-before.png) | ![Closed Duo after](duo-closed-after.png) |

Open: three oversized columns become five columns, clear of the rail.

| Before | After |
| --- | --- |
| ![Open Duo before](duo-open-before.png) | ![Open Duo after](duo-open-after.png) |

## iPad mini A17 Pro, iPadOS 26.5

[EAS session](https://expo.dev/accounts/fiberjw/projects/goodweebs/simulator-sessions/01a1c4dd-a7c6-7691-af65-13c1fe49b27b)

Portrait: three columns become five and the native sidebar toggle is available.

| Before | After |
| --- | --- |
| ![iPad portrait before](ipad-portrait-before.png) | ![iPad portrait after](ipad-portrait-after.png) |

Landscape: the updated native navigation opens a sidebar automatically, keeping Discover selected and five columns in the remaining content width. The baseline also rotated on this runtime; this evidence does not claim a previously broken iPad rotation.

| Before | After |
| --- | --- |
| ![iPad landscape before](ipad-landscape-before.png) | ![iPad landscape after](ipad-landscape-after.png) |

Using the native **Hide Sidebar** button returns to tabs and expands the grid to seven columns. Discover stays selected.

![iPad landscape after hiding sidebar](ipad-landscape-tabs-after.png)

## Evidence limits

These are static guest Discover layout checks. Signed-in flows, other screens, narrow multitasking windows, both rotation directions, half-open Duo, Dynamic Type, hardware keyboard, VoiceOver and animation acceptance remain pending. No AniList credentials were retrieved.

Native accessibility trees supplied every tap location. On iPad, the first system dialog was absent from the tree; rebooting through Argent applied its accessibility settings and exposed the dialog. No screenshot pixels supplied tap coordinates.

Both named EAS sessions and task-owned Metro servers were stopped after capture. The main checkout was preserved. Screenshots use the live trending feed, so clocks and some content can change between captures.

See [manifest.json](manifest.json) for exact source SHAs, device runtimes, image dimensions and SHA-256 hashes. Saved-file Argent diffs confirmed pixel changes, with visual inspection used to assess the intended layout. Diff percentages are not pass/fail or quality scores.

## Verify it yourself

Open PR [#87](https://github.com/FiberJW/goodweebs/pull/87), [#88](https://github.com/FiberJW/goodweebs/pull/88), or [#89](https://github.com/FiberJW/goodweebs/pull/89) and scroll to **EAS visual evidence** or **EAS visual smoke test**. Click any screenshot for the original full-resolution PNG.

For a new run, follow the parent audit's build and EAS commands. Compare `3836499` against `support/ipad-navigation`, open **Continue without logging in → OK → Discover**, then fold Duo or rotate iPad. On iPad landscape, choose **Hide Sidebar** to verify the tab-bar view. Expect the same Discover selection, columns that follow the available content width, and no Duo rail overlap.

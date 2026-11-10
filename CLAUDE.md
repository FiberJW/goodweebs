# Verification

- Use remote EAS iOS Simulators for app UI testing and visual evidence, even when a local simulator is available. Read and follow the `eas-simulator` skill. Use a local simulator only when the user explicitly requests it.
- Before starting a session, run `npx --yes eas-cli@latest simulator:availability --json` and require `available: true`. If access is unavailable, report the blocker. Start a named, bounded session with `--platform ios --type argent`; confirm `IN_PROGRESS` with `simulator:get` before interacting.
- Drive the remote device through `npx --yes eas-cli@latest simulator:exec argent run <tool>`, using the device ID from the remote `list-devices`. Verify the current checkout with a compatible development build and a task-owned Metro tunnel, or a fresh matching static build.
- After implementing or fixing something, provide hard proof: real command output, screenshots, recordings, or artifacts. Visible UI changes require a screenshot or recording from the EAS session. Include exact commands, URLs, or clicks and expected results for the user to verify it. State any unverified requirements and why they remain unverified.
- Stop sessions and Metro processes created for the task after collecting evidence, unless the user requested a live preview. Keep `.env.eas-simulator` gitignored and clear its credentials after stopping. Preserve sessions and processes belonging to other work.

# Test account

- Logged-in flows use the AniList test account `goodweebstester`. It is a dummy account; signing in, editing its lists, favorites and follows is fine.
- The credentials are EAS environment variables (`development`, sensitive): `ANILIST_TEST_EMAIL` and `ANILIST_TEST_PASSWORD`. Never write them into a file in this repo; it is public.
- Retrieve them only when the AniList login page is open, using `npx --yes eas-cli@latest env:get development --variable-name <name> --non-interactive`. Capture values in process memory without printing them.
- Argent secret placeholders resolve on the tool-server. A local `~/.argent/secrets.env` does not configure the EAS remote server. Use placeholders when the remote server has a secure secret source; otherwise pass the login sequence JSON through stdin to `simulator:exec argent run run-sequence --args -`, capture its output without displaying typed values, and report only completion counts.
- Enter credentials and submit in one `run-sequence`. The AniList fields are not in the accessibility tree; they are the first two rows of the "form" group. Capture screenshots and recordings only before credential entry or after login has completed. Remove any temporary credential files after use.

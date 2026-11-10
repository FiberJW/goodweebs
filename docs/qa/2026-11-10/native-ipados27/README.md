# Native iPadOS 27 sidebar

**Verified on EAS iPad mini A17 Pro, iPadOS 27.0.** The existing app implementation renders the sidebar to the window edges, including the status-bar area, and places the floating native sidebar toggle at its upper right. This follow-up changes documentation and visual evidence only.

The earlier mini captures used iPadOS 26.5. That generation renders an inset, rounded floating panel. Its outline is system chrome. It was incorrect to treat those captures as the current iPadOS navigation design. Apple explains that sidebars extend to the edges in the 27 releases in the [WWDC26 State of the Union](https://developer.apple.com/videos/play/wwdc2026/102/); an [Apple UIKit engineer also confirms the iPadOS 27 behavior](https://developer.apple.com/forums/thread/832725).

## OS-version comparison

Same app implementation, `555002c`, running in the same compatible development client built with the iOS 27.2 SDK. `UIUserInterfaceStyle` is `Dark`; `UIDesignRequiresCompatibility` is absent. This is an OS-version comparison, not an implementation before/after. Live content and clocks differ.

| iPadOS 26.5 compatibility appearance | iPadOS 27.0 native appearance |
| --- | --- |
| ![26.5 inset sidebar](../sidebar-backdrop/after-sidebar.png) | ![27.0 edge-to-edge sidebar and floating toggle](sidebar.png) |

| 27.0 portrait | After native Hide Sidebar | Restored sidebar |
| --- | --- | --- |
| ![Portrait](portrait.png) | ![Native top tabs](tabs.png) | ![Restored edge-to-edge sidebar](sidebar-restored.png) |

All PNGs are unretouched, full resolution. Argent exported landscape images upright. [The manifest](manifest.json) records runtime, target UDID, source, image dimensions and SHA-256 hashes.

## Actual verification

- Remote `list-devices` confirmed iPad mini A17 Pro, `iOS-27-0`, UDID `67F2767E-ACF7-4AA6-ACA1-8CDB9D4806B7`, state `Booted`.
- Opened the current checkout from its task-owned Metro tunnel on port 8099, then chose **Continue without logging in → OK → Discover**.
- Captured portrait, rotated to landscape, and visually confirmed the full-height native sidebar with a floating upper-right toggle.
- Native inspection identified **Hide Sidebar**, identifier `ToggleSidebar`, as `_UIButtonBarButton`. The app does not draw this control.
- Used that button to return to the native top tabs, then used **Toggle sidebar** to restore the sidebar. Native inspection confirmed Discover remained selected in all four captured states.

Actual assertion output:

```text
PASS: native hide/restore retains Discover
PASS: iPad mini 27.0 verified; four Discover selection checks; native _UIButtonBarButton verified before/after toggle
```

The [EAS session](https://expo.dev/accounts/fiberjw/projects/goodweebs/simulator-sessions/01a1c55e-ba7b-7de1-a475-6f8f8815f3eb) was bootstrapped with the iPhone Duo configuration to select the newer runtime environment. Every app action and PNG explicitly targeted the mini UDID above. The session's default Duo stream is not used as iPad evidence. A direct request for a previously observed mini UDID did not boot on the default EAS environment.

The EAS session and task Metro process were stopped and connection credentials cleared. This verification covers guest Discover and native navigation. Signed-in, accessibility, narrow-window and broader screen acceptance remain outside this follow-up.

## Verify yourself

In EAS, select an environment with iPadOS 27 and inspect remote `list-devices` before choosing the mini. Selecting its name alone previously chose 26.5. Run a compatible development client against this checkout's Metro bundle. Open **Discover**, rotate to landscape, then use the floating upper-right **Hide Sidebar** button and restore it with **Toggle sidebar**. Expect a full-height sidebar extending through the status-bar area and Discover to stay selected.

On 26.5, expect that OS's inset floating panel. Keep the native OS-specific presentation when comparing the compatibility and current-generation captures.

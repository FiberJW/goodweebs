import { Redirect } from "expo-router";

import { canBrowse, useSession } from "yep/session";

// The root Stack stays unmounted (splash up) until the token read finishes, so
// this resolves to the right entry synchronously on first paint — no post-mount
// redirect, no slide-in. Targets match the Stack.Protected guards, so the
// redirect can never point at an unavailable screen (which would loop).
export default function Index() {
  const session = useSession();

  return canBrowse(session) ? (
    <Redirect href="/(tabs)/anime" />
  ) : (
    <Redirect href="/auth" />
  );
}

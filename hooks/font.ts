import { loadAsync, FontSource } from "expo-font";
import { useState, useEffect } from "react";

interface FontMap {
  [name: string]: FontSource;
}

export function useFonts(map: FontMap): boolean {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      if (!loaded) {
        await loadAsync(map);
        setLoaded(true);
      }
    })();
  }, [map, loaded]);

  return loaded;
}

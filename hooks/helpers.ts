import { useRef, useEffect, useState } from "react";

export function useDidMountEffect(func: () => void, deps: any[]) {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) func();
    else didMount.current = true;
  }, deps);
}

export function useNow(interval: "second" | "minute" = "second") {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const handle = setInterval(
      () => setNow(new Date()),
      interval === "second" ? 1 * 1000 : 60 * 1000
    );

    return () => clearInterval(handle);
  }, []);

  return now;
}

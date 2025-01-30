/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Listen for changes in the media query
    mediaQueryList.addEventListener("change", handleChange);

    // Cleanup the listener on component unmount
    return () => mediaQueryList.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}
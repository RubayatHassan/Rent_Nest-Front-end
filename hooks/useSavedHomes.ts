"use client";

import { useCallback, useEffect, useState } from "react";
import { Property } from "../lib/api";
import { getSavedHomes, isHomeSaved, toggleSavedHome } from "../lib/savedHomes";

export function useSavedHomes() {
  const [homes, setHomes] = useState<Property[]>([]);

  const refresh = useCallback(() => setHomes(getSavedHomes()), []);

  useEffect(() => {
    refresh();
    window.addEventListener("rentnest:saved-homes-updated", refresh);
    return () =>
      window.removeEventListener("rentnest:saved-homes-updated", refresh);
  }, [refresh]);

  const toggle = useCallback(
    (property: Property) => {
      toggleSavedHome(property);
      refresh();
    },
    [refresh],
  );

  return { homes, count: homes.length, isSaved: isHomeSaved, toggle, refresh };
}

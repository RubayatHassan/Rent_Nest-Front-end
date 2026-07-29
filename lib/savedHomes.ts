import type { Property } from "./api";

const SAVED_HOMES_KEY = "rentnest.savedHomes";

export function getSavedHomes(): Property[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = JSON.parse(window.localStorage.getItem(SAVED_HOMES_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function isHomeSaved(id: string) {
  return getSavedHomes().some((home) => home.id === id);
}

export function toggleSavedHome(property: Property) {
  const savedHomes = getSavedHomes();
  const next = savedHomes.some((home) => home.id === property.id)
    ? savedHomes.filter((home) => home.id !== property.id)
    : [property, ...savedHomes];
  window.localStorage.setItem(SAVED_HOMES_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("rentnest:saved-homes-updated"));
  return next;
}

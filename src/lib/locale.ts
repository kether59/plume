export type AppLocale = "fr" | "en";

const LOCALE_STORAGE_KEY = "plume-app-locale";
const localeListeners = new Set<() => void>();

export function getAppLocale(): AppLocale {
  if (typeof window === "undefined") return "fr";
  return window.localStorage.getItem(LOCALE_STORAGE_KEY) === "en" ? "en" : "fr";
}

export function saveAppLocale(locale: AppLocale) {
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  document.documentElement.lang = locale;
  for (const listener of localeListeners) listener();
}

export function subscribeToLocale(listener: () => void) {
  localeListeners.add(listener);
  return () => localeListeners.delete(listener);
}

export function getServerLocale(): AppLocale {
  return "fr";
}

/** Registrerer service worker i produksjon og lagrer filene som allerede er lastet, så appen virker uten nett. */
export function registerServiceWorker() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./sw.js");
      const reg = await navigator.serviceWorker.ready;
      const urls = [
        ...["./", "./manifest.webmanifest", "./icon.svg", "./icon-192.png", "./apple-touch-icon.png"].map(
          (u) => new URL(u, location.href).href,
        ),
        ...performance
          .getEntriesByType("resource")
          .map((e) => e.name)
          .filter((u) => u.startsWith(location.origin) && !u.endsWith("/sw.js")),
      ];
      reg.active?.postMessage({ type: "precache", urls: [...new Set(urls)] });
    } catch {
      // Uten service worker virker appen fortsatt med nett.
    }
  });
}

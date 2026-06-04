if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.unregister();
      }
    } catch {
      // ignore errors during unregister
    }

    if (isLocal) {
      return;
    }

    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

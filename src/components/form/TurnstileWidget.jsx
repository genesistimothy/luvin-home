import { useEffect, useRef } from "react";

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let loader = null;

function loadTurnstile() {
  /** @type {any} */
  const browser = window;
  if (browser.turnstile) return Promise.resolve();
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return loader;
}

/**
 * Renders a Turnstile widget when VITE_TURNSTILE_SITE_KEY is configured.
 * The token is single-use; remount with a new key after each submit.
 */
export default function TurnstileWidget({ onToken }) {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const container = useRef(null);
  const callback = useRef(onToken);

  useEffect(() => {
    callback.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!siteKey) return undefined;
    let cancelled = false;
    let widgetId = null;

    loadTurnstile()
      .then(() => {
        if (cancelled || !container.current) return;
        const turnstile = /** @type {any} */ (window).turnstile;
        widgetId = turnstile.render(container.current, {
          sitekey: siteKey,
          callback: (token) => callback.current(token),
          "expired-callback": () => callback.current(""),
          "error-callback": () => callback.current(""),
        });
      })
      .catch(() => callback.current(""));

    return () => {
      cancelled = true;
      const turnstile = /** @type {any} */ (window).turnstile;
      if (widgetId !== null && turnstile) turnstile.remove(widgetId);
    };
  }, [siteKey]);

  if (!siteKey) return null;
  return <div ref={container} className="min-h-[65px]" />;
}

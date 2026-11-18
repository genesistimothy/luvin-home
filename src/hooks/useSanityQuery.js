import { useEffect, useState } from "react";
import { sanityClient } from "../lib/sanityClient";
import { fetchContentRows, supabaseContentEnabled } from "../lib/supabaseContent";

/**
 * Reads a content type from Supabase when VITE_CONTENT_SOURCE=supabase, or the
 * provided GROQ query from Sanity otherwise. A slug returns one object.
 */
export function useSanityQuery(query, params = {}, options = {}) {
  const { type, slug } = options;
  const paramsKey = JSON.stringify(params);
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    let settled = false;
    const controller = new AbortController();
    setState((current) => ({ ...current, loading: true }));

    // Do not leave a page blank forever if the content request hangs.
    const timer = window.setTimeout(() => {
      if (cancelled || settled) return;
      settled = true;
      setState({ data: null, loading: false, error: new Error("Content request timed out") });
    }, 8000);

    const done = (next) => {
      if (cancelled || settled) return;
      settled = true;
      setState(next);
    };
    const fail = (error) => {
      if (cancelled || settled) return;
      settled = true;
      setState({ data: null, loading: false, error });
    };

    if (supabaseContentEnabled && type) {
      fetchContentRows({ type, slug, signal: controller.signal })
        .then((rows) => done({ data: slug ? rows[0] || null : rows, loading: false, error: null }))
        .catch((error) => {
          if (error?.name !== "AbortError") fail(error);
        })
        .finally(() => window.clearTimeout(timer));
    } else if (sanityClient) {
      sanityClient
        .fetch(query, params, { signal: controller.signal })
        .then((data) => done({ data, loading: false, error: null }))
        .catch((error) => {
          if (error?.name !== "AbortError") fail(error);
        })
        .finally(() => window.clearTimeout(timer));
    } else {
      done({ data: null, loading: false, error: null });
      window.clearTimeout(timer);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      controller.abort();
    };
    // paramsKey is the intentional dependency proxy for the params object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, paramsKey, reloadKey, type, slug]);

  return { ...state, refetch: () => setReloadKey((key) => key + 1) };
}

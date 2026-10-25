import { useEffect, useState } from "react";
import { sanityClient } from "../lib/sanityClient";

export function useSanityQuery(query, params = {}) {
  const paramsKey = JSON.stringify(params);
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    if (!sanityClient) {
      setState({ data: null, loading: false, error: null });
      return undefined;
    }

    let cancelled = false;
    let settled = false;
    setState((current) => ({ ...current, loading: true }));

    // Do not leave a page blank forever if the CMS request hangs.
    const timer = window.setTimeout(() => {
      if (cancelled || settled) return;
      settled = true;
      setState({ data: null, loading: false, error: new Error("CMS request timed out") });
    }, 8000);

    sanityClient
      .fetch(query, params)
      .then((data) => {
        if (cancelled || settled) return;
        settled = true;
        setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (cancelled || settled) return;
        settled = true;
        setState({ data: null, loading: false, error });
      })
      .finally(() => window.clearTimeout(timer));

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // paramsKey is the intentional dependency proxy for the params object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, paramsKey, reloadKey]);

  return { ...state, refetch: () => setReloadKey((key) => key + 1) };
}

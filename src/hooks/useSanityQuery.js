import { useEffect, useState } from "react";
import { sanityClient } from "../lib/sanityClient";

export function useSanityQuery(query, params = {}) {
  const paramsKey = JSON.stringify(params);
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    if (!sanityClient) {
      setState({ data: null, loading: false, error: null });
      return undefined;
    }

    let cancelled = false;
    setState((current) => ({ ...current, loading: true }));

    sanityClient
      .fetch(query, params)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });

    return () => {
      cancelled = true;
    };
    // paramsKey is the intentional dependency proxy for the params object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, paramsKey]);

  return state;
}

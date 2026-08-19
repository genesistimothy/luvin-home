import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const SavedProductsContext = createContext(null);

const WISHLIST_KEY = "luvin:wishlist:v1";
const COMPARE_KEY = "luvin:compare:v1";
export const COMPARE_LIMIT = 3;

function readList(key) {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(key, list) {
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // Storage unavailable (private mode, quota) — best-effort only.
  }
}

export function SavedProductsProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => readList(WISHLIST_KEY));
  const [compareIds, setCompareIds] = useState(() => readList(COMPARE_KEY));

  useEffect(() => writeList(WISHLIST_KEY, wishlist), [wishlist]);
  useEffect(() => writeList(COMPARE_KEY, compareIds), [compareIds]);

  const toggleWishlist = useCallback((slug) => {
    setWishlist((current) => (current.includes(slug) ? current.filter((id) => id !== slug) : [...current, slug]));
  }, []);

  const toggleCompare = useCallback((slug) => {
    setCompareIds((current) => {
      if (current.includes(slug)) return current.filter((id) => id !== slug);
      if (current.length >= COMPARE_LIMIT) return current;
      return [...current, slug];
    });
  }, []);

  const removeFromCompare = useCallback((slug) => {
    setCompareIds((current) => current.filter((id) => id !== slug));
  }, []);

  const clearCompare = useCallback(() => setCompareIds([]), []);

  const value = useMemo(
    () => ({
      wishlist,
      isWishlisted: (slug) => wishlist.includes(slug),
      toggleWishlist,
      compareIds,
      isCompared: (slug) => compareIds.includes(slug),
      toggleCompare,
      removeFromCompare,
      clearCompare,
      compareFull: compareIds.length >= COMPARE_LIMIT,
    }),
    [wishlist, compareIds, toggleWishlist, toggleCompare, removeFromCompare, clearCompare]
  );

  return <SavedProductsContext.Provider value={value}>{children}</SavedProductsContext.Provider>;
}

export function useSavedProducts() {
  const context = useContext(SavedProductsContext);
  if (!context) throw new Error("useSavedProducts must be used within SavedProductsProvider");
  return context;
}

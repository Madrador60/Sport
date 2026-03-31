import { useEffect, useMemo, useState } from 'react';

const readStoredFavorites = (storageKey: string): string[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue)
      ? parsedValue.filter((entry): entry is string => typeof entry === 'string')
      : [];
  } catch {
    return [];
  }
};

export const useStoredFavorites = (storageKey: string) => {
  const [favorites, setFavorites] = useState<string[]>(() => readStoredFavorites(storageKey));

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(favorites));
  }, [favorites, storageKey]);

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const toggleFavorite = (value: string) => {
    setFavorites((currentFavorites) =>
      currentFavorites.includes(value)
        ? currentFavorites.filter((entry) => entry !== value)
        : [value, ...currentFavorites],
    );
  };

  const isFavorite = (value: string): boolean => favoriteSet.has(value);

  return {
    favorites,
    favoriteSet,
    isFavorite,
    toggleFavorite,
  };
};

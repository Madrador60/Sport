import { useEffect, useState } from 'react';

const readStoredItems = (storageKey: string): string[] => {
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

export const useRecentItems = (storageKey: string, maxItems: number = 8) => {
  const [items, setItems] = useState<string[]>(() => readStoredItems(storageKey));

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const pushRecentItem = (value: string) => {
    setItems((currentItems) => [value, ...currentItems.filter((entry) => entry !== value)].slice(0, maxItems));
  };

  return {
    items,
    pushRecentItem,
  };
};

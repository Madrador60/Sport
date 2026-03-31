import { useState, useEffect } from 'react';
import { fallbackEvents } from '../data/fallbackEvents';
import { fetchLiveSportsEvents, SPORTS_FALLBACK_NOTICE } from '../services/sportsApi';
import { FlatEvent } from '../types';

export const useSportsData = () => {
  const [events, setEvents] = useState<FlatEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const liveEvents = await fetchLiveSportsEvents(controller.signal);
        if (controller.signal.aborted) return;

        setEvents(liveEvents);
        setNotice(null);
        setLastUpdated(Date.now());
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error('Fetch Error:', err);
        setEvents(fallbackEvents);
        setNotice(SPORTS_FALLBACK_NOTICE);
        setLastUpdated(Date.now());
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, [refreshToken]);

  return {
    events,
    loading,
    isRefreshing,
    lastUpdated,
    notice,
    refresh: () => {
      setIsRefreshing(true);
      setRefreshToken((currentValue) => currentValue + 1);
    },
  };
};

import { useState, useEffect } from 'react';
import { fallbackEvents } from '../data/fallbackEvents';
import { fetchLiveSportsEvents, SPORTS_FALLBACK_NOTICE } from '../services/sportsApi';
import { FlatEvent } from '../types';

export const useSportsData = () => {
  const [events, setEvents] = useState<FlatEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const liveEvents = await fetchLiveSportsEvents(controller.signal);
        if (controller.signal.aborted) return;

        setEvents(liveEvents);
        setNotice(null);
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error('Fetch Error:', err);
        setEvents(fallbackEvents);
        setNotice(SPORTS_FALLBACK_NOTICE);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  return { events, loading, notice };
};

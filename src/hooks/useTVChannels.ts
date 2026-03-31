import { useEffect, useState } from 'react';
import { fallbackTVChannels } from '../data/fallbackTvChannels';
import { fetchFrenchChannels, TV_FALLBACK_NOTICE } from '../services/tvChannelsApi';
import { TVChannel } from '../types';

export const useTVChannels = () => {
  const [channels, setChannels] = useState<TVChannel[]>(fallbackTVChannels);
  const [loading, setLoading] = useState<boolean>(true);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadChannels = async () => {
      try {
        const officialChannels = await fetchFrenchChannels(controller.signal);
        if (controller.signal.aborted) return;

        setChannels(officialChannels);
        setNotice(null);
      } catch (fetchError) {
        if (controller.signal.aborted) return;

        console.error('TV Fetch Error:', fetchError);
        setChannels(fallbackTVChannels);
        setNotice(TV_FALLBACK_NOTICE);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadChannels();
    return () => controller.abort();
  }, []);

  return { channels, loading, notice };
};

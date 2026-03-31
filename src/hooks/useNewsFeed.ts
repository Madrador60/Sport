import { useEffect, useState } from 'react';
import { fallbackNews } from '../data/fallbackNews';
import { fetchFrenchSportsNews, NEWS_FALLBACK_NOTICE } from '../services/newsApi';
import { NewsArticle } from '../types';

export const useNewsFeed = () => {
  const [articles, setArticles] = useState<NewsArticle[]>(fallbackNews);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadNews = async () => {
      try {
        const nextArticles = await fetchFrenchSportsNews(controller.signal);
        if (controller.signal.aborted) return;

        setArticles(nextArticles);
        setNotice(null);
        setLastUpdated(Date.now());
      } catch (fetchError) {
        if (controller.signal.aborted) return;

        console.error('News Fetch Error:', fetchError);
        setArticles(fallbackNews);
        setNotice(NEWS_FALLBACK_NOTICE);
        setLastUpdated(Date.now());
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    loadNews();
    return () => controller.abort();
  }, [refreshToken]);

  return {
    articles,
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

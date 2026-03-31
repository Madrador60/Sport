import {
  Suspense,
  lazy,
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import './App.css';
import { AppHeader } from './components/AppHeader';
import { DashboardHero } from './components/DashboardHero';
import { FavoritesSection } from './components/FavoritesSection';
import {
  FloatingPlayerDock,
  FloatingPlayerState,
} from './components/FloatingPlayerDock';
import { MobileBottomNav } from './components/MobileBottomNav';
import { NewsSection } from './components/NewsSection';
import { RecentViewsSection } from './components/RecentViewsSection';
import { SportsSection } from './components/SportsSection';
import { TonightSpotlight } from './components/TonightSpotlight';
import { TVChannelsSection } from './components/TVChannelsSection';
import { useNewsFeed } from './hooks/useNewsFeed';
import { useRecentItems } from './hooks/useRecentItems';
import { useStoredFavorites } from './hooks/useStoredFavorites';
import { useSportsData } from './hooks/useSportsData';
import { useTVChannels } from './hooks/useTVChannels';
import { AppTab, EventTimeFilter, FlatEvent, NewsArticle, TVChannel } from './types';
import { normalizeSearchableText } from './utils/common';
import { EVENT_TIME_FILTERS, getEventTimeStatus, matchesEventTimeFilter } from './utils/eventStatus';
import { getChannelFavoriteKey, getEventFavoriteKey } from './utils/favorites';
import {
  formatFrenchClockTime,
  formatLastUpdatedLabel,
  getFrenchDateKey,
} from './utils/format';
import { FRENCH_SPORT_FILTER, isFrenchEvent } from './utils/sports';
import { getDefaultTVStream } from './utils/tv';

const SportEventModal = lazy(async () => ({
  default: (await import('./components/SportEventModal')).SportEventModal,
}));
const TVPlayerModal = lazy(async () => ({
  default: (await import('./components/TVPlayerModal')).TVPlayerModal,
}));

const EVENT_FAVORITES_STORAGE_KEY = 'sport-dashboard-event-favorites';
const CHANNEL_FAVORITES_STORAGE_KEY = 'sport-dashboard-channel-favorites';
const EVENT_HISTORY_STORAGE_KEY = 'sport-dashboard-event-history';
const CHANNEL_HISTORY_STORAGE_KEY = 'sport-dashboard-channel-history';
const NEWS_HISTORY_STORAGE_KEY = 'sport-dashboard-news-history';
const ALL_NEWS_CATEGORIES = 'Toutes';

const sortFavoriteEvents = (
  left: FlatEvent,
  right: FlatEvent,
  currentTimeMs: number,
): number => {
  const leftStatus = getEventTimeStatus(left, currentTimeMs);
  const rightStatus = getEventTimeStatus(right, currentTimeMs);
  const statusOrder = {
    live: 0,
    upcoming: 1,
    finished: 2,
  } as const;

  if (statusOrder[leftStatus] !== statusOrder[rightStatus]) {
    return statusOrder[leftStatus] - statusOrder[rightStatus];
  }

  if (leftStatus === 'upcoming') {
    return left.unixTimestamp - right.unixTimestamp;
  }

  return right.unixTimestamp - left.unixTimestamp;
};

function App() {
  const {
    events,
    loading: loadingSports,
    isRefreshing: refreshingSports,
    lastUpdated: sportsLastUpdated,
    notice: sportsNotice,
    refresh: refreshSports,
  } = useSportsData();
  const {
    channels: tvChannels,
    loading: loadingTV,
    isRefreshing: refreshingTV,
    lastUpdated: tvLastUpdated,
    notice: tvNotice,
    refresh: refreshTV,
  } = useTVChannels();
  const {
    articles: newsArticles,
    loading: loadingNews,
    isRefreshing: refreshingNews,
    lastUpdated: newsLastUpdated,
    notice: newsNotice,
    refresh: refreshNews,
  } = useNewsFeed();

  const {
    favorites: favoriteEventKeys,
    favoriteSet: favoriteEventSet,
    toggleFavorite: toggleFavoriteEventKey,
  } = useStoredFavorites(EVENT_FAVORITES_STORAGE_KEY);
  const {
    favorites: favoriteChannelKeys,
    favoriteSet: favoriteChannelSet,
    toggleFavorite: toggleFavoriteChannelKey,
  } = useStoredFavorites(CHANNEL_FAVORITES_STORAGE_KEY);
  const { items: recentEventKeys, pushRecentItem: pushRecentEvent } = useRecentItems(
    EVENT_HISTORY_STORAGE_KEY,
  );
  const { items: recentChannelKeys, pushRecentItem: pushRecentChannel } = useRecentItems(
    CHANNEL_HISTORY_STORAGE_KEY,
  );
  const { items: recentNewsKeys, pushRecentItem: pushRecentNews } = useRecentItems(
    NEWS_HISTORY_STORAGE_KEY,
  );

  const [activeTab, setActiveTab] = useState<AppTab>('sports');
  const [selectedSport, setSelectedSport] = useState('Tous');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<EventTimeFilter>('Tous');
  const [selectedNewsCategory, setSelectedNewsCategory] = useState(ALL_NEWS_CATEGORIES);
  const [showFavoriteEventsOnly, setShowFavoriteEventsOnly] = useState(false);
  const [showFavoriteChannelsOnly, setShowFavoriteChannelsOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<FlatEvent | null>(null);
  const [selectedSportChannel, setSelectedSportChannel] = useState<string | null>(null);
  const [selectedTV, setSelectedTV] = useState<TVChannel | null>(null);
  const [activeTVStream, setActiveTVStream] = useState<string | null>(null);
  const [floatingPlayer, setFloatingPlayer] = useState<FloatingPlayerState | null>(null);
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedSearchQuery = useMemo(
    () => normalizeSearchableText(deferredSearchQuery),
    [deferredSearchQuery],
  );
  const isSearchPending = searchQuery !== deferredSearchQuery;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 60 * 1000);

    return () => window.clearInterval(timer);
  }, []);

  const eventMap = useMemo(
    () => new Map(events.map((event) => [getEventFavoriteKey(event), event])),
    [events],
  );
  const channelMap = useMemo(
    () => new Map(tvChannels.map((channel) => [getChannelFavoriteKey(channel), channel])),
    [tvChannels],
  );
  const newsMap = useMemo(
    () => new Map(newsArticles.map((article) => [article.id, article])),
    [newsArticles],
  );

  const sports = useMemo(() => {
    const sportList = Array.from(new Set(events.map((event) => event.sportType))).sort(
      (left, right) => left.localeCompare(right, 'fr'),
    );

    return ['Tous', FRENCH_SPORT_FILTER, ...sportList];
  }, [events]);

  useEffect(() => {
    if (selectedSport !== 'Tous' && !sports.includes(selectedSport)) {
      setSelectedSport('Tous');
    }
  }, [selectedSport, sports]);

  const newsCategories = useMemo(() => {
    const categories = Array.from(new Set(newsArticles.map((article) => article.category))).sort(
      (left, right) => left.localeCompare(right, 'fr'),
    );

    return [ALL_NEWS_CATEGORIES, ...categories];
  }, [newsArticles]);

  useEffect(() => {
    if (!newsCategories.includes(selectedNewsCategory)) {
      setSelectedNewsCategory(ALL_NEWS_CATEGORIES);
    }
  }, [newsCategories, selectedNewsCategory]);

  const favoriteEvents = useMemo(
    () =>
      events
        .filter((event) => favoriteEventSet.has(getEventFavoriteKey(event)))
        .filter((event) =>
          normalizedSearchQuery.length === 0
            ? true
            : normalizeSearchableText(`${event.match} ${event.sportType}`).includes(
                normalizedSearchQuery,
              ),
        )
        .sort((left, right) => sortFavoriteEvents(left, right, currentTimeMs)),
    [currentTimeMs, events, favoriteEventSet, normalizedSearchQuery],
  );

  const favoriteTVChannels = useMemo(
    () =>
      tvChannels
        .filter((channel) => favoriteChannelSet.has(getChannelFavoriteKey(channel)))
        .filter((channel) =>
          normalizedSearchQuery.length === 0
            ? true
            : normalizeSearchableText(`${channel.name} ${channel.country}`).includes(
                normalizedSearchQuery,
              ),
        )
        .sort((left, right) => left.name.localeCompare(right.name, 'fr')),
    [favoriteChannelSet, normalizedSearchQuery, tvChannels],
  );

  const baseFilteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSport =
        selectedSport === 'Tous' ||
        (selectedSport === FRENCH_SPORT_FILTER
          ? isFrenchEvent(event)
          : event.sportType === selectedSport);
      const matchesSearch =
        normalizedSearchQuery.length === 0 ||
        normalizeSearchableText(`${event.match} ${event.sportType}`).includes(
          normalizedSearchQuery,
        );

      return matchesSport && matchesSearch;
    });
  }, [events, normalizedSearchQuery, selectedSport]);

  const sportsScopedEvents = useMemo(
    () =>
      showFavoriteEventsOnly
        ? baseFilteredEvents.filter((event) => favoriteEventSet.has(getEventFavoriteKey(event)))
        : baseFilteredEvents,
    [baseFilteredEvents, favoriteEventSet, showFavoriteEventsOnly],
  );

  const eventTimeCounts = useMemo(
    () =>
      EVENT_TIME_FILTERS.reduce<Record<EventTimeFilter, number>>((counts, filter) => {
        counts[filter] = sportsScopedEvents.filter((event) =>
          matchesEventTimeFilter(event, filter, currentTimeMs),
        ).length;

        return counts;
      }, {} as Record<EventTimeFilter, number>),
    [sportsScopedEvents, currentTimeMs],
  );

  const filteredEvents = useMemo(
    () =>
      sportsScopedEvents
        .filter((event) => matchesEventTimeFilter(event, selectedTimeFilter, currentTimeMs))
        .sort((left, right) => right.unixTimestamp - left.unixTimestamp),
    [sportsScopedEvents, currentTimeMs, selectedTimeFilter],
  );

  const baseFilteredTV = useMemo(() => {
    return tvChannels.filter((channel) =>
      normalizeSearchableText(`${channel.name} ${channel.country}`).includes(
        normalizedSearchQuery,
      ),
    );
  }, [normalizedSearchQuery, tvChannels]);

  const filteredTV = useMemo(() => {
    const scopedChannels = showFavoriteChannelsOnly
      ? baseFilteredTV.filter((channel) => favoriteChannelSet.has(getChannelFavoriteKey(channel)))
      : baseFilteredTV;

    return [...scopedChannels].sort((left, right) => {
      const leftFavorite = favoriteChannelSet.has(getChannelFavoriteKey(left));
      const rightFavorite = favoriteChannelSet.has(getChannelFavoriteKey(right));

      if (leftFavorite !== rightFavorite) {
        return leftFavorite ? -1 : 1;
      }

      return left.name.localeCompare(right.name, 'fr');
    });
  }, [baseFilteredTV, favoriteChannelSet, showFavoriteChannelsOnly]);

  const baseFilteredNews = useMemo(
    () =>
      newsArticles.filter((article) =>
        normalizedSearchQuery.length === 0
          ? true
          : normalizeSearchableText(
              `${article.title} ${article.summary} ${article.category} ${article.author ?? ''}`,
            ).includes(normalizedSearchQuery),
      ),
    [newsArticles, normalizedSearchQuery],
  );

  const newsCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      [ALL_NEWS_CATEGORIES]: baseFilteredNews.length,
    };

    newsCategories.forEach((category) => {
      if (category === ALL_NEWS_CATEGORIES) {
        return;
      }

      counts[category] = baseFilteredNews.filter((article) => article.category === category).length;
    });

    return counts;
  }, [baseFilteredNews, newsCategories]);

  const filteredNews = useMemo(
    () =>
      [...baseFilteredNews]
        .filter((article) =>
          selectedNewsCategory === ALL_NEWS_CATEGORIES
            ? true
            : article.category === selectedNewsCategory,
        )
        .sort((left, right) => right.publishedTimestamp - left.publishedTimestamp),
    [baseFilteredNews, selectedNewsCategory],
  );

  const liveEvents = useMemo(
    () =>
      [...events]
        .filter((event) => getEventTimeStatus(event, currentTimeMs) === 'live')
        .sort((left, right) => right.unixTimestamp - left.unixTimestamp),
    [currentTimeMs, events],
  );

  const upcomingEvents = useMemo(
    () =>
      [...events]
        .filter((event) => getEventTimeStatus(event, currentTimeMs) === 'upcoming')
        .sort((left, right) => left.unixTimestamp - right.unixTimestamp),
    [currentTimeMs, events],
  );

  const tonightEvents = useMemo(() => {
    const currentDateKey = getFrenchDateKey(currentTimeMs);
    const todayEvents = events.filter(
      (event) => getFrenchDateKey(event.unixTimestamp * 1000) === currentDateKey,
    );
    const tonightLive = todayEvents
      .filter((event) => getEventTimeStatus(event, currentTimeMs) === 'live')
      .sort((left, right) => right.unixTimestamp - left.unixTimestamp);
    const tonightUpcoming = todayEvents
      .filter((event) => getEventTimeStatus(event, currentTimeMs) === 'upcoming')
      .sort((left, right) => left.unixTimestamp - right.unixTimestamp);
    const highlightedEvents = [...tonightLive.slice(0, 2), ...tonightUpcoming.slice(0, 4)];

    if (highlightedEvents.length > 0) {
      return highlightedEvents.slice(0, 5);
    }

    return upcomingEvents.slice(0, 5);
  }, [currentTimeMs, events, upcomingEvents]);

  const recentEvents = useMemo(
    () =>
      recentEventKeys
        .map((key) => eventMap.get(key))
        .filter((event): event is FlatEvent => Boolean(event))
        .slice(0, 4),
    [eventMap, recentEventKeys],
  );

  const recentTVChannels = useMemo(
    () =>
      recentChannelKeys
        .map((key) => channelMap.get(key))
        .filter((channel): channel is TVChannel => Boolean(channel))
        .slice(0, 4),
    [channelMap, recentChannelKeys],
  );
  const recentNewsArticles = useMemo(
    () =>
      recentNewsKeys
        .map((key) => newsMap.get(key))
        .filter((article): article is NewsArticle => Boolean(article))
        .slice(0, 4),
    [newsMap, recentNewsKeys],
  );

  const quickSportEvent =
    liveEvents[0] ?? upcomingEvents[0] ?? filteredEvents[0] ?? events[0] ?? null;
  const quickTVChannel =
    tvChannels.find((channel) => favoriteChannelSet.has(getChannelFavoriteKey(channel))) ??
    filteredTV[0] ??
    tvChannels[0] ??
    null;
  const quickNewsArticle = filteredNews[0] ?? newsArticles[0] ?? null;
  const quickFavoriteEvent = favoriteEvents[0] ?? null;
  const quickFavoriteChannel = favoriteTVChannels[0] ?? null;

  const favoriteChannelsCount = favoriteChannelKeys.length;
  const favoriteEventsCount = favoriteEventKeys.length;
  const totalFavoriteCount = favoriteChannelsCount + favoriteEventsCount;
  const currentFrenchDateKey = getFrenchDateKey(currentTimeMs);
  const todayNewsCount = filteredNews.filter(
    (article) => getFrenchDateKey(article.publishedTimestamp) === currentFrenchDateKey,
  ).length;
  const breakingNewsCount = filteredNews.filter(
    (article) => currentTimeMs - article.publishedTimestamp <= 6 * 60 * 60 * 1000,
  ).length;
  const combinedLastUpdated = [sportsLastUpdated, tvLastUpdated, newsLastUpdated].reduce<number | null>(
    (latestTimestamp, currentTimestamp) => {
      if (!currentTimestamp) {
        return latestTimestamp;
      }

      return latestTimestamp ? Math.max(latestTimestamp, currentTimestamp) : currentTimestamp;
    },
    null,
  );
  const activeLastUpdated =
    activeTab === 'sports'
      ? sportsLastUpdated
      : activeTab === 'tv'
        ? tvLastUpdated
        : activeTab === 'news'
          ? newsLastUpdated
          : combinedLastUpdated;
  const activeRefreshing =
    activeTab === 'sports'
      ? refreshingSports
      : activeTab === 'tv'
        ? refreshingTV
        : activeTab === 'news'
          ? refreshingNews
          : refreshingSports || refreshingTV || refreshingNews;
  const searchPlaceholder = 'On regarde quoi ?';
  const newsCategoryCount = Math.max(newsCategories.length - 1, 0);

  const heroTitle =
    activeTab === 'sports'
      ? 'On regarde quoi ce soir ?'
      : activeTab === 'tv'
        ? 'Les chaines FR toujours sous la main'
        : activeTab === 'news'
          ? 'Les actus sport FR du moment'
          : 'Tes favoris toujours prets';
  const heroDescription =
    activeTab === 'sports'
      ? 'Passe direct aux lives, garde tes favoris en memoire et rafraichis les matchs sans recharger la page.'
      : activeTab === 'tv'
        ? 'Lance une chaine directement dans le site, retrouve tes favoris et garde une interface propre sur mobile comme sur ordi.'
        : activeTab === 'news'
          ? 'Retrouve les dernieres actualites sportives en francais, triees du plus recent au plus ancien, avec un acces rapide a la source.'
          : 'Tout ce que tu as aime est range ici, avec acces direct aux matchs et chaines que tu veux retrouver en premier.';
  const heroBadge =
    activeTab === 'sports'
      ? 'Dashboard live'
      : activeTab === 'tv'
        ? 'Dashboard TV'
        : activeTab === 'news'
          ? 'Actualites FR'
          : 'Mes favoris';
  const heroPrimaryActionLabel =
    activeTab === 'sports'
      ? liveEvents.length > 0
        ? 'Direct maintenant'
        : quickSportEvent
          ? 'Voir le prochain match'
          : 'Pas de direct'
      : activeTab === 'tv'
        ? quickTVChannel && favoriteChannelSet.has(getChannelFavoriteKey(quickTVChannel))
          ? 'Lancer ma chaine'
          : quickTVChannel
            ? 'Ouvrir une chaine'
            : 'Pas de chaine'
        : activeTab === 'news'
          ? quickNewsArticle
            ? 'Lire la une'
            : 'Pas d actu'
        : quickFavoriteEvent || quickFavoriteChannel
          ? 'Ouvrir un favori'
          : 'Pas de favori';
  const heroMetrics =
    activeTab === 'sports'
      ? [
          {
            label: 'En direct',
            value: String(liveEvents.length),
            hint: 'Matchs disponibles maintenant',
          },
          {
            label: 'Ce soir',
            value: String(tonightEvents.length),
            hint: 'Affiches mises en avant',
          },
          {
            label: 'Favoris',
            value: String(totalFavoriteCount),
            hint: 'Sports et TV gardes en memoire',
          },
        ]
      : activeTab === 'tv'
        ? [
            {
              label: 'Chaines FR',
              value: String(tvChannels.length),
              hint: 'Disponibles dans la liste actuelle',
            },
            {
              label: 'Favoris',
              value: String(favoriteChannelsCount),
              hint: 'Chaines gardees sous la main',
            },
              {
                label: 'Derniere maj',
                value: activeLastUpdated ? formatFrenchClockTime(activeLastUpdated) : '--:--',
                hint: 'Heure FR de mise a jour',
              },
            ]
          : activeTab === 'news'
            ? [
                {
                  label: "Aujourd'hui",
                  value: String(todayNewsCount),
                  hint: 'Articles publies sur la journee',
                },
                {
                  label: 'Dernieres 6 h',
                  value: String(breakingNewsCount),
                  hint: 'Actualites les plus recentes',
                },
                {
                  label: 'Themes',
                  value: String(newsCategoryCount),
                  hint: 'Categories disponibles en filtrage',
                },
              ]
          : [
              {
                label: 'Matchs favoris',
                value: String(favoriteEvents.length),
                hint: 'Gardes pour y revenir vite',
              },
              {
                label: 'Chaines favorites',
                value: String(favoriteTVChannels.length),
                hint: 'Toujours sous la main',
              },
              {
                label: 'Vus recemment',
                value: String(recentEvents.length + recentTVChannels.length + recentNewsArticles.length),
                hint: 'Matchs, TV et actus gardes en memoire',
              },
            ];

  const isFavoriteEvent = (event: FlatEvent): boolean =>
    favoriteEventSet.has(getEventFavoriteKey(event));
  const isFavoriteChannel = (channel: TVChannel): boolean =>
    favoriteChannelSet.has(getChannelFavoriteKey(channel));

  const toggleEventFavorite = (event: FlatEvent) => {
    toggleFavoriteEventKey(getEventFavoriteKey(event));
  };

  const toggleChannelFavorite = (channel: TVChannel) => {
    toggleFavoriteChannelKey(getChannelFavoriteKey(channel));
  };

  const openEventViewer = (event: FlatEvent, preferredChannel?: string | null) => {
    pushRecentEvent(getEventFavoriteKey(event));
    setFloatingPlayer(null);
    setSelectedSportChannel(preferredChannel ?? event.channels[0] ?? null);
    setSelectedEvent(event);
  };

  const openTVViewer = (channel: TVChannel, preferredStream?: string | null) => {
    pushRecentChannel(getChannelFavoriteKey(channel));
    setFloatingPlayer(null);
    setSelectedTV(channel);
    setActiveTVStream(preferredStream ?? getDefaultTVStream(channel));
  };

  const openNewsArticle = (article: NewsArticle) => {
    pushRecentNews(article.id);
    window.open(article.link, '_blank', 'noopener,noreferrer');
  };

  const closeTVPlayer = () => {
    setSelectedTV(null);
    setActiveTVStream(null);
  };

  const minimizeSportPlayer = (channel: string) => {
    if (!selectedEvent) {
      return;
    }

    setFloatingPlayer({
      kind: 'sport',
      activeSource: channel,
      event: selectedEvent,
    });
    setSelectedSportChannel(channel);
    setSelectedEvent(null);
  };

  const minimizeTVPlayer = (stream: string) => {
    if (!selectedTV) {
      return;
    }

    setFloatingPlayer({
      kind: 'tv',
      activeSource: stream,
      channel: selectedTV,
    });
    closeTVPlayer();
  };

  const restoreFloatingPlayer = () => {
    if (!floatingPlayer) {
      return;
    }

    if (floatingPlayer.kind === 'sport') {
      openEventViewer(floatingPlayer.event, floatingPlayer.activeSource);
    } else {
      openTVViewer(floatingPlayer.channel, floatingPlayer.activeSource);
    }

    setFloatingPlayer(null);
  };

  const focusSearch = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(() => {
      document.querySelector<HTMLInputElement>('.search-input')?.focus();
    }, 120);
  };

  const handleTabChange = (tab: AppTab) => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  const handleQuickAction = () => {
    if (activeTab === 'sports') {
      if (quickSportEvent) {
        openEventViewer(quickSportEvent);
      }

      return;
    }

    if (activeTab === 'tv') {
      if (quickTVChannel) {
        openTVViewer(quickTVChannel);
      }

      return;
    }

    if (activeTab === 'news') {
      if (quickNewsArticle) {
        openNewsArticle(quickNewsArticle);
      }

      return;
    }

    if (quickFavoriteEvent) {
      openEventViewer(quickFavoriteEvent);
      return;
    }

    if (quickFavoriteChannel) {
      openTVViewer(quickFavoriteChannel);
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'sports') {
      refreshSports();
      return;
    }

    if (activeTab === 'tv') {
      refreshTV();
      return;
    }

    if (activeTab === 'news') {
      refreshNews();
      return;
    }

    refreshSports();
    refreshTV();
    refreshNews();
  };

  return (
    <div className="app">
      <AppHeader
        activeTab={activeTab}
        isSearchPending={isSearchPending}
        searchQuery={searchQuery}
        searchPlaceholder={searchPlaceholder}
        onClearSearch={() => setSearchQuery('')}
        onSearchChange={setSearchQuery}
        onTabChange={handleTabChange}
      />

      <main className="container">
        <DashboardHero
          badge={heroBadge}
          description={heroDescription}
          lastUpdatedLabel={formatLastUpdatedLabel(activeLastUpdated)}
          metrics={heroMetrics}
          primaryActionLabel={heroPrimaryActionLabel}
          title={heroTitle}
          onFocusSearch={focusSearch}
          onPrimaryAction={handleQuickAction}
          onRefresh={handleRefresh}
          refreshing={activeRefreshing}
        />

        {activeTab === 'sports' ? (
          <>
            <TonightSpotlight
              currentTimeMs={currentTimeMs}
              events={tonightEvents}
              onOpenEvent={openEventViewer}
            />
            <SportsSection
              events={filteredEvents}
              eventTimeCounts={eventTimeCounts}
              favoriteCount={favoriteEventsCount}
              favoritesOnly={showFavoriteEventsOnly}
              loading={loadingSports}
              notice={sportsNotice}
              currentTimeMs={currentTimeMs}
              isFavoriteEvent={isFavoriteEvent}
              isRefreshing={refreshingSports}
              lastUpdated={sportsLastUpdated}
              searchQuery={searchQuery}
              selectedSport={selectedSport}
              selectedTimeFilter={selectedTimeFilter}
              sports={sports}
              timeFilters={EVENT_TIME_FILTERS}
              totalEvents={events.length}
              onOpenEvent={openEventViewer}
              onRefresh={refreshSports}
              onSportChange={setSelectedSport}
              onTimeFilterChange={setSelectedTimeFilter}
              onToggleFavorite={toggleEventFavorite}
              onToggleFavoritesOnly={() => setShowFavoriteEventsOnly((value) => !value)}
            />
          </>
        ) : activeTab === 'tv' ? (
          <TVChannelsSection
            channels={filteredTV}
            favoriteCount={favoriteChannelsCount}
            favoritesOnly={showFavoriteChannelsOnly}
            loading={loadingTV}
            notice={tvNotice}
            isFavoriteChannel={isFavoriteChannel}
            isRefreshing={refreshingTV}
            lastUpdated={tvLastUpdated}
            searchQuery={searchQuery}
            totalChannels={tvChannels.length}
            onOpenChannel={openTVViewer}
            onRefresh={refreshTV}
            onToggleFavorite={toggleChannelFavorite}
            onToggleFavoritesOnly={() => setShowFavoriteChannelsOnly((value) => !value)}
          />
        ) : activeTab === 'news' ? (
          <NewsSection
            articles={filteredNews}
            categories={newsCategories}
            categoryCounts={newsCategoryCounts}
            currentTimeMs={currentTimeMs}
            loading={loadingNews}
            notice={newsNotice}
            isRefreshing={refreshingNews}
            lastUpdated={newsLastUpdated}
            searchQuery={searchQuery}
            selectedCategory={selectedNewsCategory}
            totalArticles={newsArticles.length}
            onCategoryChange={setSelectedNewsCategory}
            onOpenArticle={openNewsArticle}
            onRefresh={refreshNews}
          />
        ) : (
          <FavoritesSection
            channels={favoriteTVChannels}
            currentTimeMs={currentTimeMs}
            events={favoriteEvents}
            searchQuery={searchQuery}
            onOpenChannel={openTVViewer}
            onOpenEvent={openEventViewer}
            onToggleChannelFavorite={toggleChannelFavorite}
            onToggleEventFavorite={toggleEventFavorite}
          />
        )}

        <RecentViewsSection
          articles={recentNewsArticles}
          channels={recentTVChannels}
          currentTimeMs={currentTimeMs}
          events={recentEvents}
          onOpenArticle={openNewsArticle}
          onOpenChannel={openTVViewer}
          onOpenEvent={openEventViewer}
        />
      </main>

      <MobileBottomNav
        activeTab={activeTab}
        quickActionDisabled={
          activeTab === 'sports'
            ? !quickSportEvent
            : activeTab === 'tv'
              ? !quickTVChannel
              : activeTab === 'news'
                ? !quickNewsArticle
                : !quickFavoriteEvent && !quickFavoriteChannel
        }
        quickActionLabel={
          activeTab === 'sports'
            ? 'Direct'
            : activeTab === 'tv'
              ? 'Lancer'
              : activeTab === 'news'
                ? 'A la une'
                : 'Ouvrir'
        }
        onFocusSearch={focusSearch}
        onQuickAction={handleQuickAction}
        onTabChange={handleTabChange}
      />

      {floatingPlayer ? (
        <FloatingPlayerDock
          player={floatingPlayer}
          onClose={() => setFloatingPlayer(null)}
          onRestore={restoreFloatingPlayer}
        />
      ) : null}

      <Suspense fallback={null}>
        {selectedEvent ? (
          <SportEventModal
            event={selectedEvent}
            initialChannel={selectedSportChannel}
            onClose={() => setSelectedEvent(null)}
            onMinimize={minimizeSportPlayer}
            onSelectChannel={setSelectedSportChannel}
          />
        ) : null}
        {selectedTV ? (
          <TVPlayerModal
            activeStream={activeTVStream}
            channel={selectedTV}
            onClose={closeTVPlayer}
            onMinimize={minimizeTVPlayer}
            onSelectStream={setActiveTVStream}
          />
        ) : null}
      </Suspense>
    </div>
  );
}

export default App;

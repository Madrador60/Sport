import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import './App.css';
import { AppHeader } from './components/AppHeader';
import { SportEventModal } from './components/SportEventModal';
import { SportsSection } from './components/SportsSection';
import { TVChannelsSection } from './components/TVChannelsSection';
import { TVPlayerModal } from './components/TVPlayerModal';
import { useSportsData } from './hooks/useSportsData';
import { useTVChannels } from './hooks/useTVChannels';
import { AppTab, FlatEvent, TVChannel } from './types';
import { normalizeSearchableText } from './utils/common';
import { getDefaultTVStream } from './utils/tv';

function App() {
  const { events, loading: loadingSports, notice: sportsNotice } = useSportsData();
  const { channels: tvChannels, loading: loadingTV, notice: tvNotice } = useTVChannels();

  const [activeTab, setActiveTab] = useState<AppTab>('sports');
  const [selectedSport, setSelectedSport] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<FlatEvent | null>(null);
  const [selectedTV, setSelectedTV] = useState<TVChannel | null>(null);
  const [activeTVStream, setActiveTVStream] = useState<string | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedSearchQuery = useMemo(
    () => normalizeSearchableText(deferredSearchQuery),
    [deferredSearchQuery],
  );
  const isSearchPending = searchQuery !== deferredSearchQuery;

  const sports = useMemo(() => {
    const sportList = Array.from(new Set(events.map((event) => event.sportType))).sort(
      (left, right) => left.localeCompare(right, 'fr'),
    );

    return ['Tous', ...sportList];
  }, [events]);

  useEffect(() => {
    if (selectedSport !== 'Tous' && !sports.includes(selectedSport)) {
      setSelectedSport('Tous');
    }
  }, [selectedSport, sports]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSport = selectedSport === 'Tous' || event.sportType === selectedSport;
      const matchesSearch =
        normalizedSearchQuery.length === 0 ||
        normalizeSearchableText(`${event.match} ${event.sportType}`).includes(
          normalizedSearchQuery,
        );

      return matchesSport && matchesSearch;
    });
  }, [events, normalizedSearchQuery, selectedSport]);

  const filteredTV = useMemo(() => {
    return tvChannels.filter((channel) =>
      normalizeSearchableText(`${channel.name} ${channel.country}`).includes(
        normalizedSearchQuery,
      ),
    );
  }, [normalizedSearchQuery, tvChannels]);

  const openTVPlayer = (channel: TVChannel) => {
    setSelectedTV(channel);
    setActiveTVStream(getDefaultTVStream(channel));
  };

  const closeTVPlayer = () => {
    setSelectedTV(null);
    setActiveTVStream(null);
  };

  const searchPlaceholder =
    activeTab === 'sports'
      ? 'Rechercher un match ou un sport'
      : 'Rechercher une chaine TV';

  return (
    <div className="app">
      <AppHeader
        activeTab={activeTab}
        isSearchPending={isSearchPending}
        searchQuery={searchQuery}
        searchPlaceholder={searchPlaceholder}
        onClearSearch={() => setSearchQuery('')}
        onSearchChange={setSearchQuery}
        onTabChange={setActiveTab}
      />

      <main className="container">
        {activeTab === 'sports' ? (
          <SportsSection
            events={filteredEvents}
            loading={loadingSports}
            notice={sportsNotice}
            searchQuery={searchQuery}
            selectedSport={selectedSport}
            sports={sports}
            totalEvents={events.length}
            onOpenEvent={setSelectedEvent}
            onSportChange={setSelectedSport}
          />
        ) : (
          <TVChannelsSection
            channels={filteredTV}
            loading={loadingTV}
            notice={tvNotice}
            searchQuery={searchQuery}
            totalChannels={tvChannels.length}
            onOpenChannel={openTVPlayer}
          />
        )}
      </main>

      <SportEventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      <TVPlayerModal
        activeStream={activeTVStream}
        channel={selectedTV}
        onClose={closeTVPlayer}
        onSelectStream={setActiveTVStream}
      />
    </div>
  );
}

export default App;

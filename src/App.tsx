import { useMemo, useState } from 'react';
import './App.css';
import { AppHeader } from './components/AppHeader';
import { SportEventModal } from './components/SportEventModal';
import { SportsSection } from './components/SportsSection';
import { TVChannelsSection } from './components/TVChannelsSection';
import { TVPlayerModal } from './components/TVPlayerModal';
import { useSportsData } from './hooks/useSportsData';
import { useTVChannels } from './hooks/useTVChannels';
import { AppTab, FlatEvent, TVChannel } from './types';
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
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const sports = useMemo(() => {
    const sportList = Array.from(new Set(events.map((event) => event.sportType))).sort(
      (left, right) => left.localeCompare(right, 'fr'),
    );

    return ['Tous', ...sportList];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSport = selectedSport === 'Tous' || event.sportType === selectedSport;
      const matchesSearch =
        normalizedSearchQuery.length === 0 ||
        event.match.toLowerCase().includes(normalizedSearchQuery);

      return matchesSport && matchesSearch;
    });
  }, [events, normalizedSearchQuery, selectedSport]);

  const filteredTV = useMemo(() => {
    return tvChannels.filter((channel) =>
      channel.name.toLowerCase().includes(normalizedSearchQuery),
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

  return (
    <div className="app">
      <AppHeader
        activeTab={activeTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onTabChange={setActiveTab}
      />

      <main className="container">
        {activeTab === 'sports' ? (
          <SportsSection
            events={filteredEvents}
            loading={loadingSports}
            notice={sportsNotice}
            selectedSport={selectedSport}
            sports={sports}
            onOpenEvent={setSelectedEvent}
            onSportChange={setSelectedSport}
          />
        ) : (
          <TVChannelsSection
            channels={filteredTV}
            loading={loadingTV}
            notice={tvNotice}
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

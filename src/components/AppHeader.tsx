import { useEffect, useState } from 'react';
import { AppTab } from '../types';

const HEADER_CLOCK_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

const formatHeaderTime = (): string => HEADER_CLOCK_FORMATTER.format(new Date());

type AppHeaderProps = {
  activeTab: AppTab;
  isSearchPending: boolean;
  searchQuery: string;
  searchPlaceholder: string;
  onClearSearch: () => void;
  onSearchChange: (value: string) => void;
  onTabChange: (tab: AppTab) => void;
};

export const AppHeader = ({
  activeTab,
  isSearchPending,
  searchQuery,
  searchPlaceholder,
  onClearSearch,
  onSearchChange,
  onTabChange,
}: AppHeaderProps) => {
  const [currentTime, setCurrentTime] = useState(() => formatHeaderTime());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(formatHeaderTime());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="header">
      <div className="header-copy">
        <div className="logo">LiveStream Sports</div>
        <p className="header-subtitle">Matchs, chaines FR et actus sport dans une interface plus rapide.</p>
      </div>

      <div className="header-clock-shell" aria-label={`Heure de Paris ${currentTime}`}>
        <span className="header-clock-label">Heure FR</span>
        <span className="header-clock-time">{currentTime}</span>
      </div>

      <div className="header-actions">
        <div className="tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'sports' ? 'active' : ''}`}
            aria-pressed={activeTab === 'sports'}
            onClick={() => onTabChange('sports')}
          >
            Matchs
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'tv' ? 'active' : ''}`}
            aria-pressed={activeTab === 'tv'}
            onClick={() => onTabChange('tv')}
          >
            TV FR
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'news' ? 'active' : ''}`}
            aria-pressed={activeTab === 'news'}
            onClick={() => onTabChange('news')}
          >
            Actualites
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            aria-pressed={activeTab === 'favorites'}
            onClick={() => onTabChange('favorites')}
          >
            Favoris
          </button>
        </div>

        <div className="search-shell">
          <input
            type="search"
            placeholder={searchPlaceholder}
            className={`search-input ${isSearchPending ? 'search-input-pending' : ''}`}
            aria-label={searchPlaceholder}
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          {searchQuery ? (
            <button
              type="button"
              className="search-clear-btn"
              aria-label="Effacer la recherche"
              onClick={onClearSearch}
            >
              Effacer
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
};

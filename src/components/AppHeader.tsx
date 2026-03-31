import { AppTab } from '../types';

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
}: AppHeaderProps) => (
  <header className="header">
    <div className="header-copy">
      <div className="logo">LiveStream Sports</div>
      <p className="header-subtitle">Matchs et chaines FR dans une interface plus rapide.</p>
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

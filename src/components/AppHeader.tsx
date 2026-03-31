import { AppTab } from '../types';

type AppHeaderProps = {
  activeTab: AppTab;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onTabChange: (tab: AppTab) => void;
};

export const AppHeader = ({
  activeTab,
  searchQuery,
  onSearchChange,
  onTabChange,
}: AppHeaderProps) => (
  <header className="header">
    <div className="logo">LiveStream Sports</div>
    <div className="header-actions">
      <div className="tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'sports' ? 'active' : ''}`}
          onClick={() => onTabChange('sports')}
        >
          Matchs
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'tv' ? 'active' : ''}`}
          onClick={() => onTabChange('tv')}
        >
          TV FR
        </button>
      </div>
      <input
        type="text"
        placeholder="Rechercher..."
        className="search-input"
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </div>
  </header>
);


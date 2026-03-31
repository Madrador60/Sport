import { AppTab } from '../types';

type MobileBottomNavProps = {
  activeTab: AppTab;
  quickActionDisabled: boolean;
  quickActionLabel: string;
  onFocusSearch: () => void;
  onQuickAction: () => void;
  onTabChange: (tab: AppTab) => void;
};

export const MobileBottomNav = ({
  activeTab,
  quickActionDisabled,
  quickActionLabel,
  onFocusSearch,
  onQuickAction,
  onTabChange,
}: MobileBottomNavProps) => (
  <nav className="mobile-bottom-nav" aria-label="Navigation rapide">
    <button
      type="button"
      className={`mobile-nav-btn ${activeTab === 'sports' ? 'active' : ''}`}
      aria-pressed={activeTab === 'sports'}
      onClick={() => onTabChange('sports')}
    >
      Matchs
    </button>
    <button
      type="button"
      className={`mobile-nav-btn ${activeTab === 'tv' ? 'active' : ''}`}
      aria-pressed={activeTab === 'tv'}
      onClick={() => onTabChange('tv')}
    >
      TV FR
    </button>
    <button
      type="button"
      className={`mobile-nav-btn ${activeTab === 'news' ? 'active' : ''}`}
      aria-pressed={activeTab === 'news'}
      onClick={() => onTabChange('news')}
    >
      Actus
    </button>
    <button
      type="button"
      className={`mobile-nav-btn ${activeTab === 'favorites' ? 'active' : ''}`}
      aria-pressed={activeTab === 'favorites'}
      onClick={() => onTabChange('favorites')}
    >
      Favoris
    </button>
    <button
      type="button"
      className="mobile-nav-btn mobile-nav-btn-accent"
      disabled={quickActionDisabled}
      onClick={onQuickAction}
    >
      {quickActionLabel}
    </button>
    <button type="button" className="mobile-nav-btn" onClick={onFocusSearch}>
      Recherche
    </button>
  </nav>
);

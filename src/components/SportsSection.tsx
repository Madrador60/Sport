import { SectionIntro } from './common/SectionIntro';
import { FavoriteToggleButton } from './common/FavoriteToggleButton';
import { LoadingCardGrid } from './common/LoadingCardGrid';
import { EventTimeFilter, FlatEvent } from '../types';
import { getEventFavoriteKey } from '../utils/favorites';
import { formatEventDateLabel, formatLastUpdatedLabel } from '../utils/format';
import { getEventTimeStatus, getEventTimeStatusLabel } from '../utils/eventStatus';
import { FRENCH_SPORT_FILTER } from '../utils/sports';

type SportsSectionProps = {
  events: FlatEvent[];
  eventTimeCounts: Record<EventTimeFilter, number>;
  favoriteCount: number;
  favoritesOnly: boolean;
  loading: boolean;
  notice: string | null;
  currentTimeMs: number;
  isRefreshing: boolean;
  isFavoriteEvent: (event: FlatEvent) => boolean;
  lastUpdated: number | null;
  searchQuery: string;
  selectedSport: string;
  selectedTimeFilter: EventTimeFilter;
  sports: string[];
  timeFilters: EventTimeFilter[];
  totalEvents: number;
  onOpenEvent: (event: FlatEvent) => void;
  onRefresh: () => void;
  onSportChange: (sport: string) => void;
  onToggleFavorite: (event: FlatEvent) => void;
  onToggleFavoritesOnly: () => void;
  onTimeFilterChange: (filter: EventTimeFilter) => void;
};

export const SportsSection = ({
  events,
  eventTimeCounts,
  favoriteCount,
  favoritesOnly,
  loading,
  notice,
  currentTimeMs,
  isRefreshing,
  isFavoriteEvent,
  lastUpdated,
  searchQuery,
  selectedSport,
  selectedTimeFilter,
  sports,
  timeFilters,
  totalEvents,
  onOpenEvent,
  onRefresh,
  onSportChange,
  onToggleFavorite,
  onToggleFavoritesOnly,
  onTimeFilterChange,
}: SportsSectionProps) => {
  const resultLabel = `${events.length} match${events.length > 1 ? 's' : ''}`;
  const availableSportCount = sports.filter(
    (sport) => sport !== 'Tous' && sport !== FRENCH_SPORT_FILTER,
  ).length;
  const searchContext =
    selectedSport === 'Tous'
      ? 'dans tous les sports'
      : selectedSport === FRENCH_SPORT_FILTER
        ? 'dans la selection francaise'
        : `dans ${selectedSport.toLowerCase()}`;
  const description = searchQuery
    ? `Resultats filtres pour "${searchQuery}" ${searchContext}.`
    : 'Repere rapidement les matchs en direct, ceux qui arrivent bientot ou ceux deja termines.';
  const metaParts = [
    `${totalEvents} match${totalEvents > 1 ? 's' : ''} charges`,
    selectedSport === 'Tous'
      ? `${availableSportCount} sports disponibles`
      : selectedSport === FRENCH_SPORT_FILTER
        ? 'Selection : Francais'
        : `Sport : ${selectedSport}`,
    `Statut : ${selectedTimeFilter}`,
    `Favoris : ${favoriteCount}`,
  ];
  const emptyStateLabel =
    favoritesOnly
      ? 'Aucun favori ne correspond aux filtres actuels.'
      : selectedTimeFilter === 'Tous'
      ? selectedSport === FRENCH_SPORT_FILTER
        ? 'Aucun evenement francais ne correspond a votre recherche.'
        : 'Aucun evenement ne correspond a votre recherche.'
      : `Aucun evenement ${selectedTimeFilter.toLowerCase()} pour le filtre actuel.`;

  return (
    <>
      <SectionIntro
        eyebrow="Direct sportif"
        title="Matchs en direct"
        description={description}
        badge={loading ? 'Mise a jour...' : resultLabel}
        meta={metaParts.join(' - ')}
      />

      {notice && <div className="notice-banner">{notice}</div>}

      <div className="section-toolbar">
        <div className="section-toolbar-actions">
          <button type="button" className="toolbar-btn" disabled={isRefreshing} onClick={onRefresh}>
            {isRefreshing ? 'Actualisation...' : 'Rafraichir'}
          </button>
          <button
            type="button"
            className={`toolbar-btn ${favoritesOnly ? 'active' : ''}`}
            aria-pressed={favoritesOnly}
            onClick={onToggleFavoritesOnly}
          >
            Favoris seulement
            <span className="filter-count">{favoriteCount}</span>
          </button>
        </div>
        <p className="section-toolbar-meta">{formatLastUpdatedLabel(lastUpdated)}</p>
      </div>

      <div className="filters-stack">
        <div className="filter-group">
          <p className="filter-group-label">Etat du match</p>
          <div className="filters-bar filters-bar-compact">
            {timeFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`filter-btn ${selectedTimeFilter === filter ? 'active' : ''}`}
                aria-pressed={selectedTimeFilter === filter}
                onClick={() => onTimeFilterChange(filter)}
              >
                {filter}
                <span className="filter-count">{eventTimeCounts[filter]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <p className="filter-group-label">Sport / selection</p>
          <div className="filters-bar">
            {sports.map((sport) => (
              <button
                key={sport}
                type="button"
                className={`filter-btn ${selectedSport === sport ? 'active' : ''}`}
                aria-pressed={selectedSport === sport}
                onClick={() => onSportChange(sport)}
              >
                {sport}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingCardGrid />
      ) : events.length > 0 ? (
        <div className="events-grid">
          {events.map((event) => (
            <article
              key={getEventFavoriteKey(event)}
              className={`event-card ${isFavoriteEvent(event) ? 'event-card-favorite' : ''}`}
            >
              <div className="event-header">
                <div className="event-tags">
                  <span className="sport-tag">{event.sportType}</span>
                  <span
                    className={`event-status-badge event-status-${getEventTimeStatus(
                      event,
                      currentTimeMs,
                    )}`}
                  >
                    {getEventTimeStatusLabel(event, currentTimeMs)}
                  </span>
                </div>
                <div className="event-card-tools">
                  <span className="event-time">
                    {formatEventDateLabel(event.date, event.unixTimestamp)}
                  </span>
                  <FavoriteToggleButton
                    active={isFavoriteEvent(event)}
                    onClick={() => onToggleFavorite(event)}
                  />
                </div>
              </div>
              <h3 className="event-match">{event.match}</h3>
              <div className="event-actions event-actions-single">
                <button
                  type="button"
                  className="watch-btn"
                  onClick={() => onOpenEvent(event)}
                >
                  Regarder
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          {searchQuery
            ? `Aucun evenement ne correspond a "${searchQuery}".`
            : emptyStateLabel}
        </div>
      )}
    </>
  );
};

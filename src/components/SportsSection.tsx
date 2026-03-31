import { SectionIntro } from './common/SectionIntro';
import { FlatEvent } from '../types';
import { formatEventDateLabel } from '../utils/format';

type SportsSectionProps = {
  events: FlatEvent[];
  loading: boolean;
  notice: string | null;
  searchQuery: string;
  selectedSport: string;
  sports: string[];
  totalEvents: number;
  onOpenEvent: (event: FlatEvent) => void;
  onSportChange: (sport: string) => void;
};

export const SportsSection = ({
  events,
  loading,
  notice,
  searchQuery,
  selectedSport,
  sports,
  totalEvents,
  onOpenEvent,
  onSportChange,
}: SportsSectionProps) => {
  const resultLabel = `${events.length} match${events.length > 1 ? 's' : ''}`;
  const description = searchQuery
    ? `Resultats filtres pour "${searchQuery}" dans ${selectedSport.toLowerCase()}.`
    : selectedSport === 'Tous'
      ? 'Consulte rapidement les rencontres disponibles et ouvre le flux correspondant.'
      : `Affichage des rencontres pour le sport ${selectedSport.toLowerCase()}.`;
  const meta =
    selectedSport === 'Tous'
      ? `${sports.length - 1} sports disponibles`
      : `Filtre actif : ${selectedSport}`;

  return (
    <>
      <SectionIntro
        eyebrow="Direct sportif"
        title="Matchs en direct"
        description={description}
        badge={loading ? 'Mise a jour...' : resultLabel}
        meta={`${totalEvents} match${totalEvents > 1 ? 's' : ''} charges - ${meta}`}
      />

      {notice && <div className="notice-banner">{notice}</div>}

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

      {loading ? (
        <div className="loader" role="status">
          Chargement des evenements...
        </div>
      ) : events.length > 0 ? (
        <div className="events-grid">
          {events.map((event) => (
            <article key={`${event.unixTimestamp}-${event.match}`} className="event-card">
              <div className="event-header">
                <span className="sport-tag">{event.sportType}</span>
                <span className="event-time">
                  {formatEventDateLabel(event.date, event.unixTimestamp)}
                </span>
              </div>
              <h3 className="event-match">{event.match}</h3>
              <button
                type="button"
                className="watch-btn"
                onClick={() => onOpenEvent(event)}
              >
                Regarder
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          {searchQuery
            ? `Aucun evenement ne correspond a "${searchQuery}".`
            : 'Aucun evenement ne correspond a votre recherche.'}
        </div>
      )}
    </>
  );
};

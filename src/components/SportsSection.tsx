import { FlatEvent } from '../types';
import { formatEventDateLabel } from '../utils/format';

type SportsSectionProps = {
  events: FlatEvent[];
  loading: boolean;
  notice: string | null;
  selectedSport: string;
  sports: string[];
  onOpenEvent: (event: FlatEvent) => void;
  onSportChange: (sport: string) => void;
};

export const SportsSection = ({
  events,
  loading,
  notice,
  selectedSport,
  sports,
  onOpenEvent,
  onSportChange,
}: SportsSectionProps) => (
  <>
    {notice && <div className="notice-banner">{notice}</div>}

    <div className="filters-bar">
      {sports.map((sport) => (
        <button
          key={sport}
          type="button"
          className={`filter-btn ${selectedSport === sport ? 'active' : ''}`}
          onClick={() => onSportChange(sport)}
        >
          {sport}
        </button>
      ))}
    </div>

    {loading ? (
      <div className="loader">Chargement des evenements...</div>
    ) : events.length > 0 ? (
      <div className="events-grid">
        {events.map((event, index) => (
          <article key={`${event.unixTimestamp}-${index}`} className="event-card">
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
      <div className="empty-state">Aucun evenement ne correspond a votre recherche.</div>
    )}
  </>
);


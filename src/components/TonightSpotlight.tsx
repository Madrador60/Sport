import { FlatEvent } from '../types';
import { getEventTimeStatus, getEventTimeStatusLabel } from '../utils/eventStatus';
import { formatEventDateLabel, formatRelativeKickoff } from '../utils/format';

type TonightSpotlightProps = {
  currentTimeMs: number;
  events: FlatEvent[];
  onOpenEvent: (event: FlatEvent) => void;
};

export const TonightSpotlight = ({
  currentTimeMs,
  events,
  onOpenEvent,
}: TonightSpotlightProps) => {
  if (events.length === 0) {
    return null;
  }

  const [leadEvent, ...otherEvents] = events;
  const liveCount = events.filter((event) => getEventTimeStatus(event, currentTimeMs) === 'live').length;

  return (
    <section className="tonight-spotlight">
      <div className="tonight-spotlight-head">
        <div>
          <p className="section-eyebrow">Ce soir</p>
          <h2 className="tonight-spotlight-title">Les matchs a ne pas rater</h2>
          <p className="tonight-spotlight-description">
            Une vue rapide des meilleures affiches en direct et des prochains coups d envoi.
          </p>
        </div>
        <div className="tonight-spotlight-stats">
          <span className="section-badge">{events.length} selections</span>
          <span className="tonight-pill">{liveCount} live</span>
        </div>
      </div>

      <div className="tonight-layout">
        <article className="tonight-lead-card">
          <div className="event-tags">
            <span className="sport-tag">{leadEvent.sportType}</span>
            <span
              className={`event-status-badge event-status-${getEventTimeStatus(
                leadEvent,
                currentTimeMs,
              )}`}
            >
              {getEventTimeStatusLabel(leadEvent, currentTimeMs)}
            </span>
          </div>
          <h3 className="tonight-lead-title">{leadEvent.match}</h3>
          <p className="tonight-lead-meta">
            {formatEventDateLabel(leadEvent.date, leadEvent.unixTimestamp)} -{' '}
            {formatRelativeKickoff(leadEvent.unixTimestamp, currentTimeMs)}
          </p>
          <button
            type="button"
            className="watch-btn tonight-lead-btn"
            onClick={() => onOpenEvent(leadEvent)}
          >
            Regarder ce match
          </button>
        </article>

        <div className="tonight-side-list">
          {otherEvents.map((event) => (
            <article key={`${event.unixTimestamp}-${event.match}`} className="tonight-side-card">
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
              <h3 className="tonight-side-title">{event.match}</h3>
              <p className="tonight-side-meta">
                {formatEventDateLabel(event.date, event.unixTimestamp)} -{' '}
                {formatRelativeKickoff(event.unixTimestamp, currentTimeMs)}
              </p>
              <button
                type="button"
                className="toolbar-btn tonight-side-btn"
                onClick={() => onOpenEvent(event)}
              >
                Ouvrir
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

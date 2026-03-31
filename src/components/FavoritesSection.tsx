import { FlatEvent, TVChannel } from '../types';
import { getEventTimeStatus, getEventTimeStatusLabel } from '../utils/eventStatus';
import { formatEventDateLabel } from '../utils/format';
import { getChannelInitials } from '../utils/tv';
import { FavoriteToggleButton } from './common/FavoriteToggleButton';
import { SectionIntro } from './common/SectionIntro';

type FavoritesSectionProps = {
  channels: TVChannel[];
  currentTimeMs: number;
  events: FlatEvent[];
  searchQuery: string;
  onOpenChannel: (channel: TVChannel) => void;
  onOpenEvent: (event: FlatEvent) => void;
  onToggleChannelFavorite: (channel: TVChannel) => void;
  onToggleEventFavorite: (event: FlatEvent) => void;
};

export const FavoritesSection = ({
  channels,
  currentTimeMs,
  events,
  searchQuery,
  onOpenChannel,
  onOpenEvent,
  onToggleChannelFavorite,
  onToggleEventFavorite,
}: FavoritesSectionProps) => {
  const totalFavorites = events.length + channels.length;
  const description = searchQuery
    ? `Resultats favoris pour "${searchQuery}".`
    : 'Retrouve tous tes matchs et tes chaines gardes sous la main dans un seul onglet.';

  return (
    <>
      <SectionIntro
        eyebrow="Mes favoris"
        title="Favoris"
        description={description}
        badge={`${totalFavorites} element${totalFavorites > 1 ? 's' : ''}`}
        meta={`${events.length} match${events.length > 1 ? 's' : ''} - ${channels.length} chaine${
          channels.length > 1 ? 's' : ''
        }`}
      />

      <div className="favorites-layout">
        <section className="favorites-block">
          <div className="favorites-block-header">
            <h3 className="favorites-block-title">Matchs favoris</h3>
            <span className="section-badge">{events.length}</span>
          </div>

          {events.length > 0 ? (
            <div className="events-grid">
              {events.map((event) => (
                <article key={`${event.unixTimestamp}-${event.match}`} className="event-card event-card-favorite">
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
                        active
                        onClick={() => onToggleEventFavorite(event)}
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
                ? `Aucun match favori ne correspond a "${searchQuery}".`
                : 'Ajoute des matchs en favoris pour les retrouver ici.'}
            </div>
          )}
        </section>

        <section className="favorites-block">
          <div className="favorites-block-header">
            <h3 className="favorites-block-title">Chaines favorites</h3>
            <span className="section-badge">{channels.length}</span>
          </div>

          {channels.length > 0 ? (
            <div className="events-grid">
              {channels.map((channel) => (
                <article key={channel.name} className="event-card event-card-favorite tv-card">
                  <div className="tv-logo-container">
                    {channel.image ? (
                      <img src={channel.image} alt={channel.name} className="tv-logo" loading="lazy" />
                    ) : (
                      <div className="tv-logo-fallback">{getChannelInitials(channel.name)}</div>
                    )}
                  </div>
                  <div className="favorites-channel-head">
                    <h3 className="event-match event-match-centered">{channel.name}</h3>
                    <FavoriteToggleButton active onClick={() => onToggleChannelFavorite(channel)} />
                  </div>
                  <div className="event-actions event-actions-single">
                    <button
                      type="button"
                      className="watch-btn"
                      onClick={() => onOpenChannel(channel)}
                    >
                      Voir le direct
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              {searchQuery
                ? `Aucune chaine favorite ne correspond a "${searchQuery}".`
                : 'Ajoute des chaines en favoris pour les retrouver ici.'}
            </div>
          )}
        </section>
      </div>
    </>
  );
};

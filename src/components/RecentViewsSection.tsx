import { FlatEvent, NewsArticle, TVChannel } from '../types';
import { getEventTimeStatus, getEventTimeStatusLabel } from '../utils/eventStatus';
import {
  formatEventDateLabel,
  formatNewsDateLabel,
  formatRelativeNewsLabel,
} from '../utils/format';
import { getChannelInitials } from '../utils/tv';

type RecentViewsSectionProps = {
  articles: NewsArticle[];
  channels: TVChannel[];
  currentTimeMs: number;
  events: FlatEvent[];
  onOpenArticle: (article: NewsArticle) => void;
  onOpenChannel: (channel: TVChannel) => void;
  onOpenEvent: (event: FlatEvent) => void;
};

export const RecentViewsSection = ({
  articles,
  channels,
  currentTimeMs,
  events,
  onOpenArticle,
  onOpenChannel,
  onOpenEvent,
}: RecentViewsSectionProps) => {
  if (events.length === 0 && channels.length === 0 && articles.length === 0) {
    return null;
  }

  return (
    <section className="recent-views">
      <div className="recent-views-head">
        <div>
          <p className="section-eyebrow">Vus recemment</p>
          <h2 className="recent-views-title">Reprendre la ou tu t es arrete</h2>
        </div>
      </div>

      <div className="recent-views-grid">
        <div className="recent-views-column">
          <div className="favorites-block-header">
            <h3 className="favorites-block-title">Matchs</h3>
            <span className="section-badge">{events.length}</span>
          </div>

          {events.length > 0 ? (
            <div className="recent-card-list">
              {events.map((event) => (
                <button
                  key={`${event.unixTimestamp}-${event.match}`}
                  type="button"
                  className="recent-card"
                  onClick={() => onOpenEvent(event)}
                >
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
                  <strong className="recent-card-title">{event.match}</strong>
                  <span className="recent-card-meta">
                    {formatEventDateLabel(event.date, event.unixTimestamp)}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">Aucun match vu recemment.</div>
          )}
        </div>

        <div className="recent-views-column">
          <div className="favorites-block-header">
            <h3 className="favorites-block-title">TV FR</h3>
            <span className="section-badge">{channels.length}</span>
          </div>

          {channels.length > 0 ? (
            <div className="recent-card-list">
              {channels.map((channel) => (
                <button
                  key={channel.name}
                  type="button"
                  className="recent-card recent-card-tv"
                  onClick={() => onOpenChannel(channel)}
                >
                  <div className="recent-channel-logo">
                    {channel.image ? (
                      <img src={channel.image} alt={channel.name} className="tv-logo" loading="lazy" />
                    ) : (
                      <div className="tv-logo-fallback">{getChannelInitials(channel.name)}</div>
                    )}
                  </div>
                  <strong className="recent-card-title">{channel.name}</strong>
                  <span className="recent-card-meta">Relancer le direct dans le site</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">Aucune chaine vue recemment.</div>
          )}
        </div>

        <div className="recent-views-column">
          <div className="favorites-block-header">
            <h3 className="favorites-block-title">Actualites</h3>
            <span className="section-badge">{articles.length}</span>
          </div>

          {articles.length > 0 ? (
            <div className="recent-card-list">
              {articles.map((article) => (
                <button
                  key={article.id}
                  type="button"
                  className="recent-card recent-card-news"
                  onClick={() => onOpenArticle(article)}
                >
                  <div className="event-tags">
                    <span className="sport-tag">Actu</span>
                    <span className="news-category-badge">{article.category}</span>
                  </div>
                  <strong className="recent-card-title">{article.title}</strong>
                  <span className="recent-card-meta">
                    {formatRelativeNewsLabel(article.publishedTimestamp, currentTimeMs)} -{' '}
                    {formatNewsDateLabel(article.publishedTimestamp)}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">Aucune actualite ouverte recemment.</div>
          )}
        </div>
      </div>
    </section>
  );
};

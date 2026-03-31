import { TVChannel } from '../types';
import { getChannelInitials } from '../utils/tv';

type TVChannelsSectionProps = {
  channels: TVChannel[];
  loading: boolean;
  notice: string | null;
  onOpenChannel: (channel: TVChannel) => void;
};

export const TVChannelsSection = ({
  channels,
  loading,
  notice,
  onOpenChannel,
}: TVChannelsSectionProps) => (
  <>
    {notice && <div className="notice-banner">{notice}</div>}

    {loading ? (
      <div className="loader">Chargement des chaines francaises...</div>
    ) : channels.length > 0 ? (
      <div className="events-grid">
        {channels.map((channel, index) => (
          <article key={`${channel.name}-${index}`} className="event-card tv-card">
            <div className="tv-logo-container">
              {channel.image ? (
                <img
                  src={channel.image}
                  alt={channel.name}
                  className="tv-logo"
                  loading="lazy"
                />
              ) : (
                <div className="tv-logo-fallback">{getChannelInitials(channel.name)}</div>
              )}
            </div>
            <h3 className="event-match event-match-centered">{channel.name}</h3>
            <button
              type="button"
              className="watch-btn"
              onClick={() => onOpenChannel(channel)}
            >
              Voir le direct
            </button>
          </article>
        ))}
      </div>
    ) : (
      <div className="empty-state">Aucune chaine ne correspond a votre recherche.</div>
    )}
  </>
);


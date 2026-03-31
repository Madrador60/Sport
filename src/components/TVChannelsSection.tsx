import { TVChannel } from '../types';
import { SectionIntro } from './common/SectionIntro';
import { getChannelInitials } from '../utils/tv';

type TVChannelsSectionProps = {
  channels: TVChannel[];
  loading: boolean;
  notice: string | null;
  searchQuery: string;
  totalChannels: number;
  onOpenChannel: (channel: TVChannel) => void;
};

export const TVChannelsSection = ({
  channels,
  loading,
  notice,
  searchQuery,
  totalChannels,
  onOpenChannel,
}: TVChannelsSectionProps) => {
  const resultLabel = `${channels.length} chaine${channels.length > 1 ? 's' : ''}`;
  const description = searchQuery
    ? `Chaines filtrees pour "${searchQuery}".`
    : 'Retrouve les chaines francaises disponibles et ouvre la meilleure source en un clic.';

  return (
    <>
      <SectionIntro
        eyebrow="Television"
        title="Chaines TV FR"
        description={description}
        badge={loading ? 'Mise a jour...' : resultLabel}
        meta={`${totalChannels} chaine${totalChannels > 1 ? 's' : ''} chargee${
          totalChannels > 1 ? 's' : ''
        }`}
      />

      {notice && <div className="notice-banner">{notice}</div>}

      {loading ? (
        <div className="loader" role="status">
          Chargement des chaines francaises...
        </div>
      ) : channels.length > 0 ? (
        <div className="events-grid">
          {channels.map((channel) => (
            <article key={channel.name} className="event-card tv-card">
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
        <div className="empty-state">
          {searchQuery
            ? `Aucune chaine ne correspond a "${searchQuery}".`
            : 'Aucune chaine ne correspond a votre recherche.'}
        </div>
      )}
    </>
  );
};

import { TVChannel } from '../types';
import { FavoriteToggleButton } from './common/FavoriteToggleButton';
import { SectionIntro } from './common/SectionIntro';
import { LoadingCardGrid } from './common/LoadingCardGrid';
import { getChannelFavoriteKey } from '../utils/favorites';
import { formatLastUpdatedLabel } from '../utils/format';
import { getChannelInitials } from '../utils/tv';

type TVChannelsSectionProps = {
  channels: TVChannel[];
  favoriteCount: number;
  favoritesOnly: boolean;
  loading: boolean;
  notice: string | null;
  isRefreshing: boolean;
  isFavoriteChannel: (channel: TVChannel) => boolean;
  lastUpdated: number | null;
  searchQuery: string;
  totalChannels: number;
  onOpenChannel: (channel: TVChannel) => void;
  onRefresh: () => void;
  onToggleFavorite: (channel: TVChannel) => void;
  onToggleFavoritesOnly: () => void;
};

export const TVChannelsSection = ({
  channels,
  favoriteCount,
  favoritesOnly,
  loading,
  notice,
  isRefreshing,
  isFavoriteChannel,
  lastUpdated,
  searchQuery,
  totalChannels,
  onOpenChannel,
  onRefresh,
  onToggleFavorite,
  onToggleFavoritesOnly,
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
        } - Favoris : ${favoriteCount}`}
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

      {loading ? (
        <LoadingCardGrid variant="tv" />
      ) : channels.length > 0 ? (
        <div className="events-grid">
          {channels.map((channel) => (
            <article
              key={getChannelFavoriteKey(channel)}
              className={`event-card tv-card ${
                isFavoriteChannel(channel) ? 'event-card-favorite' : ''
              }`}
            >
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
              <div className="favorites-channel-head">
                <h3 className="event-match event-match-centered">{channel.name}</h3>
                <FavoriteToggleButton
                  active={isFavoriteChannel(channel)}
                  onClick={() => onToggleFavorite(channel)}
                />
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
            ? `Aucune chaine ne correspond a "${searchQuery}".`
            : favoritesOnly
              ? 'Aucune chaine favorite ne correspond aux filtres actuels.'
              : 'Aucune chaine ne correspond a votre recherche.'}
        </div>
      )}
    </>
  );
};

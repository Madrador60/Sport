import { FlatEvent, TVChannel } from '../types';
import { formatEventDateLabel } from '../utils/format';
import { buildTvEmbedUrl, getChannelInitials } from '../utils/tv';

export type FloatingPlayerState =
  | {
      kind: 'sport';
      activeSource: string;
      event: FlatEvent;
    }
  | {
      kind: 'tv';
      activeSource: string;
      channel: TVChannel;
    };

type FloatingPlayerDockProps = {
  player: FloatingPlayerState;
  onClose: () => void;
  onRestore: () => void;
};

export const FloatingPlayerDock = ({
  player,
  onClose,
  onRestore,
}: FloatingPlayerDockProps) => {
  const isTVPlayer = player.kind === 'tv';
  const title = isTVPlayer ? player.channel.name : player.event.match;
  const subtitle = isTVPlayer
    ? 'Mini lecteur actif'
    : `${player.event.sportType} - ${formatEventDateLabel(
        player.event.date,
        player.event.unixTimestamp,
      )}`;
  const frameSource = isTVPlayer ? buildTvEmbedUrl(player.activeSource) : player.activeSource;

  return (
    <aside className="floating-player" aria-label={`Mini lecteur ${title}`}>
      <div className="floating-player-head">
        <div className="floating-player-copy">
          {isTVPlayer ? (
            player.channel.image ? (
              <img src={player.channel.image} alt={player.channel.name} className="floating-player-logo" loading="lazy" />
            ) : (
              <div className="tv-logo-fallback floating-player-logo-fallback">
                {getChannelInitials(player.channel.name)}
              </div>
            )
          ) : null}
          <div>
            <strong className="floating-player-title">{title}</strong>
            <p className="floating-player-subtitle">{subtitle}</p>
          </div>
        </div>
        <div className="floating-player-actions">
          <button type="button" className="floating-player-btn" onClick={onRestore}>
            Ouvrir
          </button>
          <button type="button" className="floating-player-btn" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>

      <div className="floating-player-frame-shell">
        <iframe
          key={`${player.kind}-${player.activeSource}`}
          src={frameSource}
          title={`Mini lecteur ${title}`}
          className="floating-player-frame"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </aside>
  );
};

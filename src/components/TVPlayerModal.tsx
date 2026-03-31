import { TVChannel } from '../types';
import { buildTvEmbedUrl, buildTvPlayerUrl, getChannelInitials } from '../utils/tv';

type TVPlayerModalProps = {
  activeStream: string | null;
  channel: TVChannel | null;
  onClose: () => void;
  onSelectStream: (stream: string) => void;
};

type TVSource = {
  label: string;
  status: string | null | undefined;
  stream: string;
};

export const TVPlayerModal = ({
  activeStream,
  channel,
  onClose,
  onSelectStream,
}: TVPlayerModalProps) => {
  if (!channel) {
    return null;
  }

  const sources = buildTVSources(channel);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content tv-modal-content"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        <div className="modal-header">
          {channel.image ? (
            <img src={channel.image} alt={channel.name} className="modal-logo" />
          ) : (
            <div className="tv-logo-fallback modal-tv-logo-fallback">
              {getChannelInitials(channel.name)}
            </div>
          )}
          <h2 className="modal-title">{channel.name} en direct</h2>
        </div>

        <div className="tv-player-shell">
          {activeStream ? (
            <iframe
              key={activeStream}
              src={buildTvEmbedUrl(activeStream)}
              title={`Lecteur ${channel.name}`}
              className="tv-player-frame"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <div className="empty-state">Aucune source disponible pour cette chaine.</div>
          )}
        </div>

        <div className="channels-list tv-source-list">
          {sources.length > 0 ? (
            sources.map((source) => (
              <button
                key={`${channel.name}-${source.label}`}
                type="button"
                className={`channel-link channel-link-button ${
                  activeStream === source.stream ? 'channel-link-active' : ''
                }`}
                onClick={() => onSelectStream(source.stream)}
              >
                {source.label}
                {source.status === 'offline' ? ' (hors ligne)' : ''}
              </button>
            ))
          ) : (
            <div className="empty-state">Aucune source disponible pour cette chaine.</div>
          )}
        </div>

        {activeStream && (
          <a
            href={buildTvPlayerUrl(activeStream)}
            target="_blank"
            rel="noopener noreferrer"
            className="channel-link tv-open-link"
          >
            Ouvrir dans un nouvel onglet
          </a>
        )}

        <button
          type="button"
          className="watch-btn watch-btn-secondary modal-close-button"
          onClick={onClose}
        >
          Fermer
        </button>
      </div>
    </div>
  );
};

const buildTVSources = (channel: TVChannel): TVSource[] => {
  const sources: TVSource[] = [];

  if (channel.stream1) {
    sources.push({
      label: 'Source 1',
      status: channel.status1,
      stream: channel.stream1,
    });
  }

  if (channel.stream2) {
    sources.push({
      label: 'Source 2',
      status: channel.status2,
      stream: channel.stream2,
    });
  }

  return sources;
};


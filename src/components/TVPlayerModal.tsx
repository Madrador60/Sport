import { useEffect } from 'react';
import { TVChannel } from '../types';
import { useEmbeddedSourceFallback } from '../hooks/useEmbeddedSourceFallback';
import { buildTvEmbedUrl, getChannelInitials } from '../utils/tv';
import { ModalShell } from './common/ModalShell';

type TVPlayerModalProps = {
  activeStream: string | null;
  channel: TVChannel | null;
  onClose: () => void;
  onMinimize?: (stream: string) => void;
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
  onMinimize,
  onSelectStream,
}: TVPlayerModalProps) => {
  if (!channel) {
    return null;
  }

  const sources = buildTVSources(channel);
  const {
    activeSource,
    failedSources,
    isLoading,
    notice,
    setActiveSource,
    handleFrameError,
    handleFrameLoad,
  } = useEmbeddedSourceFallback(
    sources.map((source) => ({
      label: source.label,
      value: source.stream,
    })),
    activeStream,
    channel.name,
  );

  useEffect(() => {
    if (activeSource && activeSource !== activeStream) {
      onSelectStream(activeSource);
    }
  }, [activeSource, activeStream, onSelectStream]);

  return (
    <ModalShell
      title={`${channel.name} en direct`}
      subtitle={`${sources.length} source${sources.length > 1 ? 's' : ''} disponible${
        sources.length > 1 ? 's' : ''
      }`}
      headerMedia={
        <>
          {channel.image ? (
            <img src={channel.image} alt={channel.name} className="modal-logo" loading="lazy" />
          ) : (
            <div className="tv-logo-fallback modal-tv-logo-fallback">
              {getChannelInitials(channel.name)}
            </div>
          )}
        </>
      }
      panelClassName="tv-modal-content"
      topActions={
        activeSource ? (
          <button
            type="button"
            className="modal-utility-btn"
            onClick={() => onMinimize?.(activeSource)}
          >
            Reduire
          </button>
        ) : null
      }
      onClose={onClose}
    >
      {notice ? <div className="notice-banner">{notice}</div> : null}

      <div className="tv-player-shell">
        {activeSource ? (
          <>
            <iframe
              key={activeSource}
              src={buildTvEmbedUrl(activeSource)}
              title={`Lecteur ${channel.name}`}
              className="tv-player-frame"
              allowFullScreen
              loading="lazy"
              onError={handleFrameError}
              onLoad={handleFrameLoad}
            />
            {isLoading ? (
              <div className="player-status-banner">Connexion a la source en cours...</div>
            ) : null}
          </>
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
                activeSource === source.stream ? 'channel-link-active' : ''
              } ${failedSources.includes(source.stream) ? 'channel-link-failed' : ''}`}
              onClick={() => {
                setActiveSource(source.stream);
                onSelectStream(source.stream);
              }}
            >
              {source.label}
              {source.status === 'offline' ? ' (hors ligne)' : ''}
            </button>
          ))
        ) : (
          <div className="empty-state">Aucune source disponible pour cette chaine.</div>
        )}
      </div>

      <div className="modal-actions">
        <button
          type="button"
          className="watch-btn watch-btn-secondary modal-close-button"
          onClick={onClose}
        >
          Fermer
        </button>
      </div>
    </ModalShell>
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

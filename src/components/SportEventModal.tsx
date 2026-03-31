import { useEffect, useState } from 'react';
import { FlatEvent } from '../types';
import { useEmbeddedSourceFallback } from '../hooks/useEmbeddedSourceFallback';
import { formatEventDateLabel } from '../utils/format';
import { ModalShell } from './common/ModalShell';

type SportEventModalProps = {
  event: FlatEvent | null;
  initialChannel?: string | null;
  onClose: () => void;
  onMinimize?: (channel: string) => void;
  onSelectChannel?: (channel: string) => void;
};

export const SportEventModal = ({
  event,
  initialChannel,
  onClose,
  onMinimize,
  onSelectChannel,
}: SportEventModalProps) => {
  const [activeChannel, setActiveChannel] = useState<string | null>(initialChannel ?? null);

  useEffect(() => {
    setActiveChannel(initialChannel ?? event?.channels[0] ?? null);
  }, [event, initialChannel]);

  if (!event) {
    return null;
  }

  const channelCount = `${event.channels.length} canal${event.channels.length > 1 ? 'aux' : ''}`;
  const channelSources = event.channels.map((channel, index) => ({
    label: `Canal ${index + 1}`,
    value: channel,
  }));
  const {
    activeSource,
    failedSources,
    isLoading,
    notice,
    setActiveSource,
    handleFrameError,
    handleFrameLoad,
  } = useEmbeddedSourceFallback(
    channelSources,
    activeChannel,
    `${event.unixTimestamp}-${event.match}`,
  );

  useEffect(() => {
    if (activeSource && activeSource !== activeChannel) {
      setActiveChannel(activeSource);
    }
  }, [activeSource, activeChannel]);

  useEffect(() => {
    if (activeSource) {
      onSelectChannel?.(activeSource);
    }
  }, [activeSource, onSelectChannel]);

  return (
    <ModalShell
      title={event.match}
      subtitle={`${event.sportType} - ${formatEventDateLabel(
        event.date,
        event.unixTimestamp,
      )} - ${channelCount}`}
      panelClassName="sport-modal-content"
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
              key={`${event.match}-${activeSource}`}
              src={activeSource}
              title={`Lecteur ${event.match}`}
              className="tv-player-frame"
              allowFullScreen
              loading="lazy"
              onError={handleFrameError}
              onLoad={handleFrameLoad}
            />
            {isLoading ? (
              <div className="player-status-banner">Connexion au canal en cours...</div>
            ) : null}
          </>
        ) : (
          <div className="empty-state">Aucun lien disponible pour cet evenement.</div>
        )}
      </div>

      <div className="channels-list tv-source-list">
        {event.channels.length > 0 ? (
          event.channels.map((url, index) => (
            <button
              key={url}
              type="button"
              className={`channel-link channel-link-button ${
                activeSource === url ? 'channel-link-active' : ''
              } ${failedSources.includes(url) ? 'channel-link-failed' : ''}`}
              onClick={() => {
                setActiveChannel(url);
                setActiveSource(url);
              }}
            >
              Canal {index + 1}
            </button>
          ))
        ) : (
          <div className="empty-state">Aucun lien disponible pour cet evenement.</div>
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

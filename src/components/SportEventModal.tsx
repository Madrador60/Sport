import { FlatEvent } from '../types';

type SportEventModalProps = {
  event: FlatEvent | null;
  onClose: () => void;
};

export const SportEventModal = ({ event, onClose }: SportEventModalProps) => {
  if (!event) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(clickEvent) => clickEvent.stopPropagation()}>
        <h2 className="modal-title">Streaming : {event.match}</h2>
        <div className="channels-list">
          {event.channels.length > 0 ? (
            event.channels.map((url, index) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="channel-link"
              >
                Canal {index + 1}
              </a>
            ))
          ) : (
            <div className="empty-state">Aucun lien disponible pour cet evenement.</div>
          )}
        </div>
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


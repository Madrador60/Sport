import { FlatEvent } from '../types';
import { formatEventDateLabel } from '../utils/format';
import { ModalShell } from './common/ModalShell';

type SportEventModalProps = {
  event: FlatEvent | null;
  onClose: () => void;
};

export const SportEventModal = ({ event, onClose }: SportEventModalProps) => {
  if (!event) {
    return null;
  }

  const channelCount = `${event.channels.length} canal${event.channels.length > 1 ? 'aux' : ''}`;

  return (
    <ModalShell
      title={event.match}
      subtitle={`${event.sportType} - ${formatEventDateLabel(
        event.date,
        event.unixTimestamp,
      )} - ${channelCount}`}
      onClose={onClose}
    >
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

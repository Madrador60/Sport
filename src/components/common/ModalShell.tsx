import { ReactNode, useId } from 'react';
import { useDialogBehavior } from '../../hooks/useDialogBehavior';

type ModalShellProps = {
  title: string;
  subtitle?: string;
  headerMedia?: ReactNode;
  panelClassName?: string;
  onClose: () => void;
  children: ReactNode;
};

export const ModalShell = ({
  title,
  subtitle,
  headerMedia,
  panelClassName,
  onClose,
  children,
}: ModalShellProps) => {
  const titleId = useId();
  const subtitleId = useId();

  useDialogBehavior(onClose);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content ${panelClassName ?? ''}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? subtitleId : undefined}
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close-icon"
          aria-label="Fermer la fenetre"
          onClick={onClose}
        >
          X
        </button>

        <div className="modal-header">
          {headerMedia}
          <h2 id={titleId} className="modal-title">
            {title}
          </h2>
          {subtitle ? (
            <p id={subtitleId} className="modal-subtitle">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

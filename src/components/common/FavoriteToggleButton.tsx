type FavoriteToggleButtonProps = {
  active: boolean;
  onClick: () => void;
};

export const FavoriteToggleButton = ({
  active,
  onClick,
}: FavoriteToggleButtonProps) => (
  <button
    type="button"
    className={`favorite-toggle ${active ? 'active' : ''}`}
    aria-label={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    aria-pressed={active}
    onClick={onClick}
  >
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="favorite-toggle-icon"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20.5 4.9 13.9a4.8 4.8 0 0 1 0-6.8 4.7 4.7 0 0 1 6.7 0L12 7.5l.4-.4a4.7 4.7 0 0 1 6.7 0 4.8 4.8 0 0 1 0 6.8z" />
    </svg>
  </button>
);

type LoadingCardGridProps = {
  count?: number;
  variant?: 'sports' | 'tv';
};

export const LoadingCardGrid = ({
  count = 6,
  variant = 'sports',
}: LoadingCardGridProps) => (
  <div className="events-grid" role="status" aria-label="Chargement du contenu">
    {Array.from({ length: count }).map((_, index) => (
      <article key={`${variant}-${index}`} className="event-card skeleton-card">
        {variant === 'tv' ? <div className="skeleton-block skeleton-media" /> : null}
        <div className="skeleton-row">
          <div className="skeleton-block skeleton-pill" />
          <div className="skeleton-block skeleton-short" />
        </div>
        <div className="skeleton-block skeleton-title" />
        <div className="skeleton-block skeleton-title skeleton-title-short" />
        <div className="skeleton-block skeleton-button" />
      </article>
    ))}
  </div>
);

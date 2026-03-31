type DashboardMetric = {
  label: string;
  value: string;
  hint: string;
};

type DashboardHeroProps = {
  badge: string;
  description: string;
  lastUpdatedLabel: string;
  metrics: DashboardMetric[];
  primaryActionLabel: string;
  title: string;
  onFocusSearch: () => void;
  onPrimaryAction: () => void;
  onRefresh: () => void;
  refreshing: boolean;
};

export const DashboardHero = ({
  badge,
  description,
  lastUpdatedLabel,
  metrics,
  primaryActionLabel,
  title,
  onFocusSearch,
  onPrimaryAction,
  onRefresh,
  refreshing,
}: DashboardHeroProps) => (
  <section className="dashboard-hero">
    <div className="dashboard-hero-copy">
      <p className="dashboard-hero-eyebrow">{badge}</p>
      <h1 className="dashboard-hero-title">{title}</h1>
      <p className="dashboard-hero-description">{description}</p>
      <div className="dashboard-hero-actions">
        <button type="button" className="watch-btn hero-btn" onClick={onPrimaryAction}>
          {primaryActionLabel}
        </button>
        <button
          type="button"
          className="watch-btn watch-btn-secondary hero-btn"
          disabled={refreshing}
          onClick={onRefresh}
        >
          {refreshing ? 'Actualisation...' : 'Rafraichir'}
        </button>
        <button
          type="button"
          className="watch-btn watch-btn-secondary hero-btn"
          onClick={onFocusSearch}
        >
          Rechercher
        </button>
      </div>
      <p className="dashboard-hero-meta">{lastUpdatedLabel}</p>
    </div>

    <div className="dashboard-hero-metrics">
      {metrics.map((metric) => (
        <article key={metric.label} className="dashboard-metric-card">
          <p className="dashboard-metric-label">{metric.label}</p>
          <strong className="dashboard-metric-value">{metric.value}</strong>
          <p className="dashboard-metric-hint">{metric.hint}</p>
        </article>
      ))}
    </div>
  </section>
);

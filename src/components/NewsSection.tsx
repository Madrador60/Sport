import { NewsArticle } from '../types';
import {
  formatLastUpdatedLabel,
  formatNewsDateLabel,
  formatRelativeNewsLabel,
} from '../utils/format';
import { LoadingCardGrid } from './common/LoadingCardGrid';
import { SectionIntro } from './common/SectionIntro';

const FRESH_NEWS_WINDOW_MS = 6 * 60 * 60 * 1000;

type NewsSectionProps = {
  articles: NewsArticle[];
  categories: string[];
  categoryCounts: Record<string, number>;
  currentTimeMs: number;
  loading: boolean;
  notice: string | null;
  isRefreshing: boolean;
  lastUpdated: number | null;
  searchQuery: string;
  selectedCategory: string;
  totalArticles: number;
  onCategoryChange: (category: string) => void;
  onOpenArticle: (article: NewsArticle) => void;
  onRefresh: () => void;
};

export const NewsSection = ({
  articles,
  categories,
  categoryCounts,
  currentTimeMs,
  loading,
  notice,
  isRefreshing,
  lastUpdated,
  searchQuery,
  selectedCategory,
  totalArticles,
  onCategoryChange,
  onOpenArticle,
  onRefresh,
}: NewsSectionProps) => {
  const resultLabel = `${articles.length} actu${articles.length > 1 ? 's' : ''}`;
  const description = searchQuery
    ? `Actualites filtrees pour "${searchQuery}" dans ${selectedCategory.toLowerCase()}.`
    : selectedCategory === 'Toutes'
      ? 'Retrouve les dernieres infos sportives en francais, triees du plus recent au plus ancien.'
      : `Retrouve les dernieres actualites sportives en francais pour ${selectedCategory.toLowerCase()}.`;
  const featuredArticle = articles[0] ?? null;
  const highlightedArticles = articles.slice(1, 5);
  const remainingArticles = articles.slice(5);
  const isFreshArticle = (article: NewsArticle): boolean =>
    currentTimeMs - article.publishedTimestamp <= FRESH_NEWS_WINDOW_MS;

  return (
    <>
      <SectionIntro
        eyebrow="Actu sport"
        title="Actualites sur le sport"
        description={description}
        badge={loading ? 'Mise a jour...' : resultLabel}
        meta={`${totalArticles} article${totalArticles > 1 ? 's' : ''} charge${
          totalArticles > 1 ? 's' : ''
        } - Theme : ${selectedCategory} - Source : L'Equipe`}
      />

      {notice ? <div className="notice-banner">{notice}</div> : null}

      <div className="section-toolbar">
        <div className="section-toolbar-actions">
          <button type="button" className="toolbar-btn" disabled={isRefreshing} onClick={onRefresh}>
            {isRefreshing ? 'Actualisation...' : 'Rafraichir'}
          </button>
        </div>
        <p className="section-toolbar-meta">{formatLastUpdatedLabel(lastUpdated)}</p>
      </div>

      <div className="filters-stack news-filters-stack">
        <div className="filter-group">
          <p className="filter-group-label">Theme</p>
          <div className="filters-bar filters-bar-compact">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                aria-pressed={selectedCategory === category}
                onClick={() => onCategoryChange(category)}
              >
                {category}
                <span className="filter-count">{categoryCounts[category] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingCardGrid />
      ) : articles.length > 0 ? (
        <>
          {featuredArticle ? (
            <section className="news-spotlight">
              <article className="news-spotlight-main">
                <div className="news-spotlight-media">
                  {featuredArticle.image ? (
                    <img
                      src={featuredArticle.image}
                      alt={featuredArticle.title}
                      className="news-card-image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="news-card-image-fallback">Actu FR</div>
                  )}
                </div>

                <div className="news-spotlight-body">
                  <div className="event-tags">
                    <span className="sport-tag">A la une</span>
                    <span className="news-category-badge">{featuredArticle.category}</span>
                    {isFreshArticle(featuredArticle) ? (
                      <span className="news-fresh-badge">Nouveau</span>
                    ) : null}
                  </div>

                  <div className="news-card-meta">
                    <span>{featuredArticle.source}</span>
                    {featuredArticle.author ? <span>{featuredArticle.author}</span> : null}
                    <span>{formatRelativeNewsLabel(featuredArticle.publishedTimestamp, currentTimeMs)}</span>
                    <span>{formatNewsDateLabel(featuredArticle.publishedTimestamp)}</span>
                  </div>

                  <h3 className="news-spotlight-title">{featuredArticle.title}</h3>
                  <p className="news-spotlight-summary">{featuredArticle.summary}</p>

                  <button
                    type="button"
                    className="watch-btn news-spotlight-btn"
                    onClick={() => onOpenArticle(featuredArticle)}
                  >
                    Lire la source
                  </button>
                </div>
              </article>

              {highlightedArticles.length > 0 ? (
                <div className="news-spotlight-side">
                  {highlightedArticles.map((article) => (
                    <article key={article.id} className="news-side-card">
                      <div className="event-tags">
                        <span className="sport-tag">Actu</span>
                        <span className="news-category-badge">{article.category}</span>
                      </div>
                      <h4 className="news-side-title">{article.title}</h4>
                      <p className="news-side-meta">
                        {formatRelativeNewsLabel(article.publishedTimestamp, currentTimeMs)} -{' '}
                        {article.source}
                      </p>
                      <button
                        type="button"
                        className="watch-btn watch-btn-secondary news-side-btn"
                        onClick={() => onOpenArticle(article)}
                      >
                        Ouvrir
                      </button>
                    </article>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          {remainingArticles.length > 0 ? (
            <div className="news-grid">
              {remainingArticles.map((article) => (
                <article key={article.id} className="news-card">
                  <div className="news-card-media">
                    {article.image ? (
                      <img
                        src={article.image}
                        alt={article.title}
                        className="news-card-image"
                        loading="lazy"
                      />
                    ) : (
                      <div className="news-card-image-fallback">Actu FR</div>
                    )}
                  </div>

                  <div className="news-card-body">
                    <div className="event-tags">
                      <span className="sport-tag">Actualites</span>
                      <span className="news-category-badge">{article.category}</span>
                      {isFreshArticle(article) ? <span className="news-fresh-badge">Nouveau</span> : null}
                    </div>

                    <div className="news-card-meta">
                      <span>{article.source}</span>
                      {article.author ? <span>{article.author}</span> : null}
                      <span>{formatRelativeNewsLabel(article.publishedTimestamp, currentTimeMs)}</span>
                    </div>

                    <h3 className="news-card-title">{article.title}</h3>
                    <p className="news-card-summary">{article.summary}</p>
                    <p className="news-card-date">{formatNewsDateLabel(article.publishedTimestamp)}</p>

                    <div className="event-actions event-actions-single">
                      <button
                        type="button"
                        className="watch-btn"
                        onClick={() => onOpenArticle(article)}
                      >
                        Lire la source
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <div className="empty-state">
          {searchQuery
            ? `Aucune actualite ne correspond a "${searchQuery}".`
            : 'Aucune actualite disponible pour le moment.'}
        </div>
      )}
    </>
  );
};
